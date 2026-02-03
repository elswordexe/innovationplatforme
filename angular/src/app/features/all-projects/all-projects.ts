import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import {NgClass, NgForOf, NgIf} from '@angular/common';
import {Sidebar} from '../../core/components/sidebar/sidebar';
import {Navbside} from '../../core/components/navbside/navbside';
import { ProjectService } from '../../services/project.service';
import { VoteService } from '../../services/vote.service';
import { UserProfileService, UserProfile } from '../../services/user-profile.service';
import { Subject, timeout } from 'rxjs';
import { takeUntil, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

interface Project {
  id: number;
  title: string;
  description: string;
  status: string;
  progress: number;
  ideasCount: number;
  votesCount: number;
  feedbacksCount: number;
  icon: string;
  hasVoted?: boolean;
}

@Component({
  selector: 'app-all-projects',
  templateUrl: './all-projects.html',
  imports: [
    NgClass,
    NgForOf,
    Sidebar,
    Navbside,
    NgIf
  ],
  styleUrls: ['./all-projects.css']
})
export class AllProjects implements OnInit, OnDestroy {
  projects: Project[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 5;
  totalItems: number = 52;
  isLoading = true;
  error: string | null = null;
  private destroy$ = new Subject<void>();
  currentUser: UserProfile | null = null;

  // ✅ Mode de vue : grid par défaut
  viewMode: 'grid' | 'table' = 'grid';

  constructor(
    private projectService: ProjectService,
    private voteService: VoteService,
    private userProfileService: UserProfileService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Load current user
    this.userProfileService.currentUser$.pipe(takeUntil(this.destroy$)).subscribe(user => {
      console.log('[DEBUG AllProjects] currentUser changed:', user?.id);
      this.currentUser = user;
    });

    // Resync projects when votes change - but don't reload entire list
    this.voteService.votesChanged$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      console.log('[DEBUG AllProjects] votesChanged emitted');
      // Don't call loadProjects() here - it would cause infinite loop
      // Just update vote counts if needed
    });

    this.loadProjects();
  }

  loadProjects(): void {
    this.isLoading = true;
    this.error = null;

    console.log('[DEBUG AllProjects] Starting loadProjects');
    
    // Debug tenantId
    const tenantId = localStorage.getItem('tenantId');
    console.log('[DEBUG AllProjects] Current tenantId:', tenantId);

    // Charge directement depuis la base de données sans localStorage
    this.projectService.getAllProjects().pipe(
      takeUntil(this.destroy$),
      timeout(10000), // 10 second timeout
      catchError(err => {
        console.error('[DEBUG AllProjects] Error/timeout loading projects:', err);
        return of([]);
      })
    ).subscribe({
      next: (projects: any[]) => {
        console.log('[DEBUG AllProjects] Projects loaded:', projects.length);
        console.log('[DEBUG AllProjects] Projects data:', projects);
        
        this.projects = projects.map((p, index) => ({
          id: p.id,
          title: p.title,
          description: p.description,
          status: p.status || 'En cours',
          progress: p.progress || (index % 3 === 0 ? 70 : index % 3 === 1 ? 85 : 60),
          ideasCount: p.ideasCount || Math.floor(Math.random() * 20),
          votesCount: p.votesCount || Math.floor(Math.random() * 50),
          feedbacksCount: p.feedbacksCount || Math.floor(Math.random() * 20),
          icon: p.icon || ['🌐', '🚀', '👥', '🌱', '📊', '🔒', '📱', '⚙️', '🔗'][index % 9]
        }));
        
        console.log('[DEBUG AllProjects] Mapped projects:', this.projects);
        this.totalItems = this.projects.length;
        this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
        this.isLoading = false;
        console.log('[DEBUG AllProjects] Set isLoading to FALSE');
        this.cdr.detectChanges(); // Force change detection
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement des projets';
        console.error('[DEBUG AllProjects] Error:', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  // ✅ Toggle Grid / Table
  toggleView(mode: 'grid' | 'table') {
    this.viewMode = mode;
  }

  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadProjects();
    }
  }

  onItemsPerPageChange(value: number): void {
    this.itemsPerPage = value;
    this.currentPage = 1;
    this.loadProjects();
  }

  getPageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  onProjectClick(project: Project): void {
    console.log('Projet sélectionné:', project);
  }

  toggleProjectVote(project: Project, event: Event): void {
    event.stopPropagation();
    if (!this.currentUser) return;

    const voteData = {
      ideaId: project.id,
      userId: this.currentUser.id,
      voteType: 'UPVOTE' as const
    };

    this.voteService.addVote(voteData, this.currentUser.id).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: () => {
        project.votesCount = (project.votesCount || 0) + 1;
        project.hasVoted = true;
      },
      error: (err) => console.error('Erreur vote:', err)
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

