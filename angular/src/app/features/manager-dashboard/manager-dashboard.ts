import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IdeaService, IdeaBackend } from '../../services/idea';
import { ProjectService, ProjectDto } from '../../services/project.service';
import { UserProfileService, UserProfile } from '../../services/user-profile.service';
import { AuthService } from '../../services/auth.service';
import { TeamAssignmentService, TeamAssignmentDTO, TeamMember, TeamAssignmentCreateRequest } from '../../services/team-assignment.service';
import { Navbside } from '../../core/components/navbside/navbside';
import { Sidebar } from '../../core/components/sidebar/sidebar';
import { timeout, catchError, takeUntil, filter, tap, distinctUntilChanged, map, take } from 'rxjs/operators';
import { of, Subject, forkJoin, combineLatest } from 'rxjs';

function hasUserAndAccess(v: { user: UserProfile | null; hasAccess: boolean }): v is { user: UserProfile; hasAccess: true } {
  return !!v.user && v.hasAccess;
}

export interface IdeaWithFeedback extends IdeaBackend {
  feedback?: string;
  submittedToHR?: boolean;
  hrApproved?: boolean;
}

export interface ProjectAssignmentUI {
  projectId: number;
  projectName: string;
  assignedMembers: TeamAssignmentDTO[];
}

@Component({
  selector: 'app-manager-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, Navbside, Sidebar],
  templateUrl: './manager-dashboard.html',
  styleUrls: ['./manager-dashboard.css']
})
export class ManagerDashboard implements OnInit, OnDestroy {
  pendingIdeas: IdeaWithFeedback[] = [];
  approvedProjects: ProjectDto[] = [];
  teamMembers: TeamMember[] = [];
  projectAssignments: ProjectAssignmentUI[] = [];
  
  selectedIdea: IdeaWithFeedback | null = null;
  selectedProject: ProjectDto | null = null;
  feedbackText = '';
  
  isLoading = true;
  activeTab = 'ideas';
  saveMessage = '';
  
  // Form data for assignment
  newAssignmentMembers: number[] = [];
  selectedMemberRole = 'DEVELOPER';

  private destroy$ = new Subject<void>();
  private currentUserId: number | null = null;
  private currentUserTenantId: number | null = null;
  private currentUserTenantName: string | null = null;
  private currentUserTenantType: string | null = null;

  constructor(
    private ideaService: IdeaService,
    private projectService: ProjectService,
    private userProfileService: UserProfileService,
    private authService: AuthService,
    private teamAssignmentService: TeamAssignmentService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // After refresh, role/currentUser may not be ready yet.
    // Load profile first, then wait until access is granted + user exists.
    this.userProfileService.loadUserProfile();

    combineLatest([
      this.userProfileService.currentUser$,
      this.authService.currentUserRole$
    ])
      .pipe(
        takeUntil(this.destroy$),
        map(([user]) => {
          // Recompute access based on latest role
          const hasAccess = this.authService.hasManagerAccess();
          return { user, hasAccess };
        }),
        filter(hasUserAndAccess),
        tap(({ user }) => {
          this.currentUserId = user.id;
          this.currentUserTenantName = user.tenantName ?? null;
        }),
        // Load once per refresh (avoid repeated forkJoin calls)
        distinctUntilChanged((a, b) => a.user.id === b.user.id && a.hasAccess === b.hasAccess),
        take(1),
        tap(() => this.loadManagerData())
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadManagerData(): void {
    console.log('[DEBUG ManagerDashboard] Starting loadManagerData');
    this.isLoading = true;
    
    // Load pending ideas, projects, team members, and assignments in parallel
    forkJoin({
      ideas: this.ideaService.getIdeasByStatus('SUBMITTED').pipe(
        timeout(5000),
        catchError(err => {
          console.warn('[DEBUG ManagerDashboard] Error loading ideas:', err);
          return of([]);
        }),
        takeUntil(this.destroy$)
      ),
      projects: this.projectService.getAllProjects().pipe(
        timeout(5000),
        catchError(err => {
          console.warn('[DEBUG ManagerDashboard] Error loading projects:', err);
          return of([]);
        }),
        takeUntil(this.destroy$)
      ),
      teamMembers: this.teamAssignmentService.getAllTeamMembers().pipe(
        timeout(5000),
        catchError(err => {
          console.warn('[DEBUG ManagerDashboard] Error loading team members:', err);
          return of([]);
        }),
        takeUntil(this.destroy$)
      ),
      assignments: this.teamAssignmentService.getAllAssignments().pipe(
        timeout(5000),
        catchError(err => {
          console.warn('[DEBUG ManagerDashboard] Error loading assignments:', err);
          return of([]);
        }),
        takeUntil(this.destroy$)
      )
    }).subscribe({
      next: (result) => {
        this.pendingIdeas = result.ideas.map(idea => ({
          ...idea,
          feedback: '',
          submittedToHR: false,
          hrApproved: false
        }));
        this.approvedProjects = result.projects;
        // Filter members: only show members from same organization/tenant as current user (when info exists)
        const filteredMembers = (result.teamMembers || []).filter((m: TeamMember) => {
          // If API doesn't provide tenant info, don't filter (keep behavior)
          const hasTenantInfo =
            (typeof m.tenantId === 'number') ||
            (typeof m.tenantName === 'string' && m.tenantName.trim() !== '') ||
            (typeof m.tenantType === 'string' && m.tenantType.trim() !== '');

          if (!hasTenantInfo) return true;

          if (this.currentUserTenantId != null && typeof m.tenantId === 'number') {
            return m.tenantId === this.currentUserTenantId;
          }

          if (this.currentUserTenantName && typeof m.tenantName === 'string' && m.tenantName.trim() !== '') {
            return m.tenantName === this.currentUserTenantName;
          }

          if (this.currentUserTenantType && typeof m.tenantType === 'string' && m.tenantType.trim() !== '') {
            return m.tenantType === this.currentUserTenantType;
          }

          // If current user has no tenant info, do not filter.
          return true;
        });

        this.teamMembers = filteredMembers;
        
        // Group assignments by project
        this.projectAssignments = [];
        result.assignments.forEach((assignment: TeamAssignmentDTO) => {
          let project = this.projectAssignments.find(p => p.projectId === assignment.ideaId);
          if (!project) {
            project = {
              projectId: assignment.ideaId,
              projectName: this.approvedProjects.find(p => p.id === assignment.ideaId)?.title || 'Project ' + assignment.ideaId,
              assignedMembers: []
            };
            this.projectAssignments.push(project);
          }
          project.assignedMembers.push(assignment);
        });
        
        console.log('[DEBUG ManagerDashboard] Loaded', result.ideas.length, 'ideas,',
          result.projects.length, 'projects,',
          result.teamMembers.length, 'team members,',
          result.assignments.length, 'assignments');
        
        this.isLoading = false;
        console.log('[DEBUG ManagerDashboard] Set isLoading to FALSE');
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('[DEBUG ManagerDashboard] Error loading manager data:', err);
        this.pendingIdeas = [];
        this.approvedProjects = [];
        this.teamMembers = [];
        this.projectAssignments = [];
        
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  // Idea Management Methods
  selectIdea(idea: IdeaWithFeedback): void {
    this.selectedIdea = idea;
    this.feedbackText = idea.feedback || '';
  }

  approveIdea(): void {
    if (!this.selectedIdea) return;
    
    // In real app, this would call an API
    this.selectedIdea.status = 'APPROVED';
    this.selectedIdea.feedback = this.feedbackText;
    
    // Move from pending to approved projects
    const newProject: ProjectDto = {
      id: this.selectedIdea.id,
      title: this.selectedIdea.title,
      description: this.selectedIdea.description,
      status: 'APPROVED',
      progress: 0,
      ideasCount: 1,
      votesCount: this.selectedIdea.voteCount,
      feedbacksCount: 0,
      icon: '💡',
      createdAt: this.selectedIdea.creationDate
    };
    
    this.approvedProjects.push(newProject);
    this.pendingIdeas = this.pendingIdeas.filter(i => i.id !== this.selectedIdea!.id);
    this.selectedIdea = null;
    this.feedbackText = '';
    
    console.log('[DEBUG ManagerDashboard] Idea approved, approvedProjects count:', this.approvedProjects.length);
    this.cdr.detectChanges();
  }

  rejectIdea(): void {
    if (!this.selectedIdea) return;
    
    this.selectedIdea.status = 'REJECTED';
    this.selectedIdea.feedback = this.feedbackText;
    
    this.pendingIdeas = this.pendingIdeas.filter(i => i.id !== this.selectedIdea!.id);
    this.selectedIdea = null;
    this.feedbackText = '';
    
    console.log('[DEBUG ManagerDashboard] Idea rejected, pendingIdeas count:', this.pendingIdeas.length);
    this.cdr.detectChanges();
  }

  submitToHR(): void {
    if (!this.selectedIdea) return;
    
    this.selectedIdea.submittedToHR = true;
    this.selectedIdea.feedback = this.feedbackText;
    
    console.log('[DEBUG ManagerDashboard] Idea submitted to HR');
    this.cdr.detectChanges();
    
    // Simulate HR approval after delay
    setTimeout(() => {
      this.selectedIdea!.hrApproved = true;
      console.log('[DEBUG ManagerDashboard] Idea approved by HR');
      this.cdr.detectChanges();
    }, 2000);
  }

  // Project Assignment Methods
  selectProject(project: ProjectDto): void {
    this.selectedProject = project;
    this.newAssignmentMembers = [];
    this.selectedMemberRole = 'DEVELOPER';
  }

  private resetAssignmentForm(): void {
    this.newAssignmentMembers = [];
    this.selectedMemberRole = 'DEVELOPER';
    this.cdr.detectChanges();
  }

  // Helper Methods
  getMemberById(id: number): TeamMember | undefined {
    return this.teamMembers.find(m => m.id === id);
  }

  toggleMemberAssignment(memberId: number): void {
    const index = this.newAssignmentMembers.indexOf(memberId);
    if (index > -1) {
      this.newAssignmentMembers.splice(index, 1);
    } else {
      this.newAssignmentMembers.push(memberId);
    }
  }

  saveAssignment(): void {
    if (!this.selectedProject || this.newAssignmentMembers.length === 0) {
      console.warn('[DEBUG ManagerDashboard] Cannot save assignment: no project or members selected');
      return;
    }

    if (this.currentUserId == null) {
      console.warn('[DEBUG ManagerDashboard] Cannot save assignment: current user not loaded');
      return;
    }

    console.log('[DEBUG ManagerDashboard] Saving assignments for', this.newAssignmentMembers.length, 'members');
    
    // Create individual assignments for each selected member
    const assignments = this.newAssignmentMembers.map(memberId => {
      const request: TeamAssignmentCreateRequest = {
        ideaId: this.selectedProject!.id || 0,
        userId: memberId,
        assignedById: this.currentUserId as number,
        role: this.selectedMemberRole
      };
      return request;
    });

    // Save all assignments in parallel
    const assignmentRequests = assignments.map(req =>
      this.teamAssignmentService.createAssignment(req).pipe(
        timeout(5000),
        catchError(err => {
          console.error('[DEBUG ManagerDashboard] Error saving assignment:', err);
          return of(null);
        }),
        takeUntil(this.destroy$)
      )
    );

    forkJoin(assignmentRequests).subscribe({
      next: (results) => {
        const successCount = results.filter(r => r !== null).length;
        if (successCount > 0) {
          this.saveMessage = `${successCount} member(s) assigned successfully`;
          console.log('[DEBUG ManagerDashboard] Assignments saved successfully');
          
          // Reload assignments for the project
          this.loadAssignmentsForProject(this.selectedProject!.id || 0);
        }
        this.resetAssignmentForm();
      },
      error: (err) => {
        console.error('[DEBUG ManagerDashboard] Error saving assignments:', err);
        this.saveMessage = 'Erreur lors de la sauvegarde des assignations';
        this.resetAssignmentForm();
      }
    });

    // Clear message after 3 seconds
    setTimeout(() => {
      this.saveMessage = '';
      this.cdr.detectChanges();
    }, 3000);
  }

  private loadAssignmentsForProject(projectId: number): void {
    this.teamAssignmentService.getAssignmentsByIdea(projectId)
      .pipe(
        timeout(5000),
        catchError(err => {
          console.warn('[DEBUG ManagerDashboard] Error loading assignments:', err);
          return of([]);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (assignments) => {
          const existingIndex = this.projectAssignments.findIndex(
            p => p.projectId === projectId
          );
          
          if (existingIndex > -1) {
            this.projectAssignments[existingIndex].assignedMembers = assignments;
          } else if (this.selectedProject) {
            this.projectAssignments.push({
              projectId: projectId,
              projectName: this.selectedProject.title,
              assignedMembers: assignments
            });
          }
          
          this.cdr.detectChanges();
        }
      });
  }

  // All data now comes from backend services
}
