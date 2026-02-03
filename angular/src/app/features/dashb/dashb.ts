import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { Sidebar } from '../../core/components/sidebar/sidebar';
import { Navbside } from '../../core/components/navbside/navbside';
import { IdeaService, IdeaBackend } from '../../services/idea';
import { ProjectService } from '../../services/project.service';
import { VoteService, VoteDto } from '../../services/vote.service';
import { BookmarkService, BookmarkDto } from '../../services/bookmark.service';
import { UserProfileService, UserProfile } from '../../services/user-profile.service';
import { OrganizationService } from '../../services/organization.service';
import { Subject, forkJoin, of, timeout } from 'rxjs';
import { finalize, takeUntil, switchMap, catchError } from 'rxjs/operators';
import { AddIdea } from './add-idea/add-idea';

export interface IdeaFrontend {
  id: number;
  title: string;
  description: string;
  author: string;
  authorAvatar: string;
  date: string;
  votesCount: number;
  commentsCount: number;
  category: string;
  image?: string;
  priority?: string;
  status?: string;
  hasVoted?: boolean;
  isBookmarked?: boolean;
  bookmarkCount: number;
  userVoteId?: number;
  bookmarkId?: number; // Added for backend bookmark tracking
}

interface Project {
  id: number;
  title: string;
  description: string;
  progress: number;
  icon: string;
}

interface CalendarEvent {
  id: number;
  title: string;
  date: Date;
  time: string;
  type: 'meeting' | 'deadline' | 'event';
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, Sidebar, Navbside, HttpClientModule, AddIdea],
  providers: [IdeaService, VoteService],
  templateUrl: './dashb.html',
  styleUrls: ['./dashb.css']
})
export class Dashb implements OnInit, OnDestroy {
  recentIdeas: IdeaFrontend[] = [];
  lastIdeas: IdeaFrontend[] = []; // Changed from topIdeas to lastIdeas
  approvedProjects: Project[] = [];
  calendarEvents: CalendarEvent[] = [];
  currentDate: Date = new Date();
  currentMonth: string = '';
  currentYear: number = 0;
  calendarDays: { day: number | null, isToday: boolean, hasEvent: boolean }[] = [];
  currentUser: UserProfile | null = null;
  private destroy$ = new Subject<void>();
  
  // Flags to prevent multiple rapid actions
  private isVoting = false;
  private isBookmarking = false;

  constructor(
    private ideaService: IdeaService,
    private projectService: ProjectService,
    private voteService: VoteService,
    private bookmarkService: BookmarkService,
    private userProfileService: UserProfileService,
    private organizationService: OrganizationService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}
  isLoadingIdeas = true;
  ideasError = false;

  showAddIdea = false; // Contrôle l'affichage du formulaire

  ngOnInit(): void {
    console.log('Dashboard chargé');

    // Listen for organization changes
    this.organizationService.organizationChanged$.pipe(takeUntil(this.destroy$)).subscribe(change => {
      console.log('[DEBUG Dashboard] Organization changed:', change);
      // Reload all data when organization changes
      this.loadRecentIdeas();
      this.loadLastIdeas();
      this.loadApprovedProjects();
    });

    // Charger l'utilisateur actuel (seulement subscribe, ne pas rappeler loadRecentIdeas)
    this.userProfileService.currentUser$.pipe(
      takeUntil(this.destroy$),
      switchMap(user => {
        console.log('[DEBUG] currentUser changed:', user?.id);
        this.currentUser = user;
        // When user becomes available, sync votes for already-loaded ideas
        if (this.recentIdeas.length > 0) {
          console.log('[DEBUG] Syncing votes due to user change');
          return this.syncVotesForRecentIdeasOnce();
        }
        return of(null);
      })
    ).subscribe();

    // Resync votes when they change elsewhere (e.g., from Votes page)
    this.voteService.votesChanged$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      console.log('[DEBUG] votesChanged emitted, resyncing');
      if (this.recentIdeas.length > 0) {
        this.syncVotesForRecentIdeas();
      }
    });

    // Charger directement depuis le backend (pas de localStorage) - LOAD ONCE
    this.loadRecentIdeas();
    this.loadLastIdeas();
    this.loadApprovedProjects();
    this.loadCalendarEvents();
    this.initCalendar();
  }

  private syncVotesForRecentIdeas(): void {
    if (!this.currentUser || this.recentIdeas.length === 0) {
      console.log('[DEBUG] Cannot sync votes - missing user or ideas');
      return;
    }

    console.log('[DEBUG] Syncing votes for', this.recentIdeas.length, 'ideas for user', this.currentUser.id);
    
    this.voteService.myVotes(this.currentUser.id).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (votes) => {
        console.log('[DEBUG] User votes loaded from backend:', votes);
        const votesByIdeaId = new Map<number, VoteDto>();
        
        // Process votes safely
        if (Array.isArray(votes)) {
          votes.forEach(v => {
            if (v && typeof v.ideaId === 'number') {
              votesByIdeaId.set(v.ideaId, v);
              console.log(`[DEBUG] Found vote for idea ${v.ideaId} with ID ${v.id}`);
            }
          });
        }

        // Update each idea with vote information
        this.recentIdeas.forEach(idea => {
          const vote = votesByIdeaId.get(idea.id);
          if (vote) {
            idea.hasVoted = true;
            idea.userVoteId = vote.id;
            console.log(`[DEBUG] Idea ${idea.id}: hasVoted=true, userVoteId=${vote.id}`);
          } else {
            idea.hasVoted = false;
            idea.userVoteId = undefined;
            console.log(`[DEBUG] Idea ${idea.id}: hasVoted=false, no vote found`);
          }
        });
        
        // Force UI update after syncing votes with setTimeout to avoid NG0100 error
        setTimeout(() => {
          this.cdr.detectChanges();
          console.log('[DEBUG] Vote synchronization complete');
        }, 0);
      },
      error: (err) => {
        console.error('[DEBUG] Error loading user votes:', err);
        // Reset all vote states on error
        this.recentIdeas.forEach(idea => {
          idea.hasVoted = false;
          idea.userVoteId = undefined;
        });
        // Ensure UI still updates even on error
        this.cdr.detectChanges();
      }
    });
  }

  private syncVotesForRecentIdeasOnce(): any {
    if (!this.currentUser || this.recentIdeas.length === 0) return of(null);

    return this.voteService.myVotes(this.currentUser.id).pipe(
      takeUntil(this.destroy$),
      switchMap(votes => {
        const votesByIdeaId = new Map<number, VoteDto>();
        (votes || []).forEach(v => {
          if (typeof v.ideaId === 'number') {
            votesByIdeaId.set(v.ideaId, v);
          }
        });

        this.recentIdeas.forEach(idea => {
          const v = votesByIdeaId.get(idea.id);
          idea.hasVoted = !!v;
          idea.userVoteId = v?.id;
        });
        return of(null);
      })
    );
  }


  loadRecentIdeas(): void {
    this.isLoadingIdeas = true;
    this.ideasError = false;

    console.log('[DEBUG] Starting loadRecentIdeas');

    // Use organization-based filtering
    this.ideaService.getIdeasForCurrentUser().pipe(
      takeUntil(this.destroy$),
      timeout(10000) // 10 second timeout
    ).subscribe({
      next: (res: any) => {
        console.log('[DEBUG] getIdeasForCurrentUser returned:', res);
        
        const ideas = Array.isArray(res) ? res : res?.data ?? [];
        console.log('[DEBUG] Ideas count:', ideas.length);

        // Check if user has organization and ideas exist
        const tenantId = localStorage.getItem('tenantId');
        if ((!tenantId || tenantId === '1') && ideas.length === 0) {
          // Individual user without organization - show empty state
          this.recentIdeas = [];
          this.isLoadingIdeas = false;
          this.cdr.detectChanges();
          console.log('[DEBUG] Individual user without organization - empty state');
          return;
        }

        this.recentIdeas = ideas
          .sort((a: IdeaBackend, b: IdeaBackend) => new Date(b.creationDate).getTime() - new Date(a.creationDate).getTime())
          // NOTE: On limite l'affichage à 7 idées dans le template avec | slice:0:7
          .map((i: IdeaBackend) => ({
            id: i.id,
            title: i.title,
            description: i.description,
            author: i.creatorName ?? 'Inconnu',
            authorAvatar: '👤',
            date: new Date(i.creationDate).toLocaleDateString(),
            votesCount: i.voteCount ?? 0,
            commentsCount: 0,
            category: 'Général',
            status: i.status,
            hasVoted: false,
            userVoteId: undefined,
            isBookmarked: false,
            bookmarkCount: 0,
            bookmarkId: undefined
          }));

        console.log('[DEBUG] Ideas loaded with initial vote counts:');
        this.recentIdeas.forEach(idea => {
          console.log(`[DEBUG] Idea ${idea.id}: initial votes=${idea.votesCount} (from idea service)`);
        });

        // Load bookmarks after ideas are loaded
        this.loadBookmarksForIdeas();

        // Sync votes if user is loaded - add delay to ensure ideas are processed
        if (this.currentUser) {
          console.log('[DEBUG] Syncing votes for user:', this.currentUser.id);
          // Add a small delay to ensure ideas are fully processed before syncing votes
          setTimeout(() => {
            this.syncVotesForRecentIdeas();
          }, 100);
        }

        // Mark loading as done immediately - load comments in background
        this.isLoadingIdeas = false;
        console.log('[DEBUG] Set isLoadingIdeas to FALSE:', this.isLoadingIdeas);
        this.cdr.detectChanges(); // Force change detection
        console.log('[DEBUG] Loading complete, loading spinner should stop');

        // Load comments asynchronously in background (don't block the UI)
        if (this.recentIdeas.length > 0) {
          console.log('[DEBUG] Starting to load comments for', this.recentIdeas.length, 'ideas');
          this.recentIdeas.forEach(idea => {
            this.ideaService.getCommentsByIdeaId(idea.id).pipe(
              takeUntil(this.destroy$),
              timeout(5000), // 5 second timeout per comment request
              catchError(err => {
                console.warn('[DEBUG] Comment request timeout/error for idea', idea.id);
                return of([]); // Return empty comments on timeout
              })
            ).subscribe({
              next: (comments) => {
                idea.commentsCount = Array.isArray(comments) ? comments.length : 0;
                console.log('[DEBUG] Loaded', idea.commentsCount, 'comments for idea', idea.id);
              },
              error: (err) => {
                console.error('[DEBUG] Error loading comments for idea', idea.id, err);
              }
            });
          });
        }
      },
      error: (err) => {
        console.error('[DEBUG] Error loading ideas:', err);
        this.ideasError = true;
        this.isLoadingIdeas = false;
      }
    });
  }
  // Méthode pour recevoir l'idée depuis AddIdeaComponent
  addIdeaToDashboard(newIdea: IdeaFrontend) {
    console.log('[DEBUG] Idea received from AddIdeaComponent:', newIdea);
    
    // Check if idea already exists (prevent duplicates)
    const existingIndex = this.recentIdeas.findIndex(i => 
      i.title === newIdea.title && i.description === newIdea.description
    );
    
    if (existingIndex !== -1) {
      console.log('Idea already exists, skipping addition');
      return;
    }
    
    // Add to beginning of array (idea is already created in backend by AddIdeaComponent)
    this.recentIdeas.unshift(newIdea);
    
    // Keep only the 5 most recent ideas
    if (this.recentIdeas.length > 5) {
      this.recentIdeas = this.recentIdeas.slice(0, 5);
    }

    // Load bookmarks for the new idea if user is logged in
    if (this.currentUser) {
      this.loadBookmarksForIdeas();
    }

    // Sync votes for the new idea if user is logged in
    if (this.currentUser) {
      setTimeout(() => {
        this.syncVotesForRecentIdeas();
      }, 100);
    }

    // Force UI update
    setTimeout(() => this.cdr.detectChanges(), 0);
  }



  toggleAddIdeaForm() {
    this.showAddIdea = !this.showAddIdea;
  }


  loadLastIdeas(): void {
    // Use organization-based filtering
    this.ideaService.getIdeasForCurrentUser().subscribe({
      next: (ideas: IdeaBackend[]) => {
        // Check if user has organization
        const tenantId = localStorage.getItem('tenantId');
        if ((!tenantId || tenantId === '1') && ideas.length === 0) {
          // Individual user without organization
          this.lastIdeas = [];
          return;
        }

        // Sort by creation date (most recent first) and take only 5
        this.lastIdeas = ideas
          .sort((a, b) => new Date(b.creationDate).getTime() - new Date(a.creationDate).getTime())
          .slice(0, 5)
          .map((i: IdeaBackend) => ({
            id: i.id,
            title: i.title,
            description: i.description,
            author: i.creatorName ?? 'Inconnu',
            authorAvatar: '👤',
            date: new Date(i.creationDate).toLocaleDateString(),
            votesCount: i.voteCount,
            commentsCount: 0,
            category: 'Dernières idées',
            status: i.status,
            hasVoted: false,
            isBookmarked: false,
            bookmarkCount: 0,
            userVoteId: undefined,
            bookmarkId: undefined
          }));
      },
      error: err => console.error('Erreur chargement dernières idées', err)
    });
  }





  loadApprovedProjects(): void {
    // Use organization-based filtering
    this.ideaService.getIdeasForCurrentUser().pipe(
      switchMap((ideas: IdeaBackend[]) => {
        // Check if user has organization
        const tenantId = localStorage.getItem('tenantId');
        if ((!tenantId || tenantId === '1') && ideas.length === 0) {
          // Individual user without organization
          this.approvedProjects = [];
          return of([]);
        }
        
        // Filter for approved ideas
        const approvedIdeas = ideas.filter(idea => idea.status === 'APPROVED');
        return of(approvedIdeas);
      }),
      timeout(10000)
    ).subscribe({
      next: (approvedIdeas: IdeaBackend[]) => {
        this.approvedProjects = approvedIdeas
          .slice(0, 4)
          .map((idea, index) => ({
            id: idea.id,
            title: idea.title,
            description: idea.description || 'Description non disponible',
            progress: idea.totalScore ? Math.min(100, Math.floor((idea.totalScore / 100) * 100)) : (index % 4 === 0 ? 70 : index % 4 === 1 ? 85 : index % 4 === 2 ? 75 : 90),
            icon: ['🌐', '🚀', '📊', '🔒'][index % 4]
          }));
      },
      error: (err) => {
        console.error('Erreur chargement projets approuvés', err);
        // Check if user is individual before showing fallback
        const tenantId = localStorage.getItem('tenantId');
        if (!tenantId || tenantId === '1') {
          this.approvedProjects = [];
        } else {
          // Fallback: afficher des données par défaut
          this.approvedProjects = [
            { id: 1, title: 'Innovation IA 2025', description: 'Solutions basées sur l\'IA...', progress: 70, icon: '🌐' },
            { id: 2, title: 'Transformation Digitale', description: 'Modernisation des systèmes...', progress: 85, icon: '🚀' },
            { id: 3, title: 'Data Analytics Hub', description: 'Centralisation des données', progress: 75, icon: '📊' },
            { id: 4, title: 'Cybersécurité Avancée', description: 'Renforcement de la sécurité', progress: 90, icon: '🔒' }
          ];
        }
      }
    });
  }

  loadCalendarEvents(): void {
    this.calendarEvents = [
      { id: 1, title: 'Revue des projets Q1', date: new Date(2025, 0, 28), time: '10:00', type: 'meeting' },
      { id: 2, title: 'Deadline soumission idées', date: new Date(2025, 0, 30), time: '17:00', type: 'deadline' },
      { id: 3, title: 'Webinar Innovation', date: new Date(2025, 1, 3), time: '14:00', type: 'event' },
      { id: 4, title: 'Sprint Planning', date: new Date(2025, 1, 5), time: '09:00', type: 'meeting' }
    ];
  }

  initCalendar(): void {
    const months = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
    this.currentMonth = months[this.currentDate.getMonth()];
    this.currentYear = this.currentDate.getFullYear();
    this.generateCalendarDays();
  }

  generateCalendarDays(): void {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    this.calendarDays = [];
    const startDay = firstDay === 0 ? 6 : firstDay - 1;

    for (let i = 0; i < startDay; i++) {
      this.calendarDays.push({ day: null, isToday: false, hasEvent: false });
    }

    const today = new Date();
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDay = new Date(year, month, day);
      const isToday = currentDay.toDateString() === today.toDateString();
      const hasEvent = this.calendarEvents.some(event => event.date.toDateString() === currentDay.toDateString());
      this.calendarDays.push({ day, isToday, hasEvent });
    }
  }

  previousMonth(): void {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1, 1);
    this.initCalendar();
  }

  nextMonth(): void {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 1);
    this.initCalendar();
  }


  onIdeaClick(idea: IdeaFrontend): void {
    // Navigate to idea detail page
    if (idea && idea.id) {
      this.router.navigate(['/idea', idea.id]);
    }
  }

  navigateTo(url: string): void {
    this.router.navigate([url]);
  }

  onProjectClick(project: Project): void {
    console.log('Projet sélectionné:', project);
    // TODO: Navigate to project detail page if needed
    this.router.navigate(['/project', project.id]);
  }

  toggleIdeaVote(idea: any, event: Event): void {
    event.stopPropagation();
    
    // Prevent multiple rapid clicks
    if (this.isVoting) {
      console.log('Vote in progress, ignoring click');
      return;
    }
    
    this.isVoting = true;
    console.log('Toggle vote clicked for idea:', idea.id);
    
    if (!this.currentUser) {
      console.error('No current user found');
      this.isVoting = false;
      return;
    }

    // Optimistic UI update
    const originalVotesCount = idea.votesCount;
    const originalHasVoted = idea.hasVoted;
    const originalUserVoteId = idea.userVoteId;
    
    if (idea.hasVoted) {
      // Check if userVoteId exists, if not try to resync votes
      if (!idea.userVoteId) {
        console.log('[DEBUG] Missing userVoteId for idea', idea.id, 'resyncing votes...');
        this.syncVotesForRecentIdeas();
        // Wait a bit for sync to complete
        setTimeout(() => {
          if (!idea.userVoteId) {
            console.error('Cannot unlike: missing userVoteId for idea', idea.id, 'even after resync');
            this.isVoting = false;
            return;
          }
      // Proceed with unlike after getting userVoteId
      // Optimistic UI update - decrement vote count immediately
      idea.votesCount = originalVotesCount - 1;
      idea.hasVoted = false;
      console.log(`[DEBUG] Optimistic update: decremented vote count for idea ${idea.id} from ${originalVotesCount} to ${idea.votesCount}`);
      
      this.performUnlike(idea, originalVotesCount, originalHasVoted, originalUserVoteId);
        }, 200);
        return;
      }
      
      // Proceed with unlike (direct case)
      // Optimistic UI update - decrement vote count immediately  
      idea.votesCount = originalVotesCount - 1;
      idea.hasVoted = false;
      console.log(`[DEBUG] Optimistic update: decremented vote count for idea ${idea.id} from ${originalVotesCount} to ${idea.votesCount}`);
      
      this.performUnlike(idea, originalVotesCount, originalHasVoted, originalUserVoteId);
    } else {
      // Proceed with like
      // Optimistic UI update - increment vote count immediately
      idea.votesCount = originalVotesCount + 1;
      idea.hasVoted = true;
      console.log(`[DEBUG] Optimistic update: incremented vote count for idea ${idea.id} from ${originalVotesCount} to ${idea.votesCount}`);
      
      this.performLike(idea, originalVotesCount, originalHasVoted, originalUserVoteId);
    }
  }

  private performUnlike(idea: any, originalVotesCount: number, originalHasVoted: boolean, originalUserVoteId: any): void {
    if (originalUserVoteId && this.currentUser) {
      this.voteService.deleteVote(originalUserVoteId, this.currentUser.id).pipe(
        takeUntil(this.destroy$)
      ).subscribe({
        next: () => {
          console.log('Successfully unliked idea:', idea.id);
          // hasVoted and votesCount already updated optimistically above
          idea.userVoteId = undefined;
          this.isVoting = false;
          // No need to refresh vote count since we did optimistic update
          // The count will be corrected on next page load if needed
        },
        error: (err) => {
          console.error('Erreur unlike(vote delete):', err);
          // Revert optimistic update on error
          idea.votesCount = originalVotesCount;
          idea.hasVoted = originalHasVoted;
          idea.userVoteId = originalUserVoteId;
          this.isVoting = false;
          // Force UI update after error revert
          setTimeout(() => this.cdr.detectChanges(), 0);
        }
      });
    } else {
      console.error('Cannot perform unlike: missing userVoteId or currentUser');
      // Revert optimistic update
      idea.votesCount = originalVotesCount;
      idea.hasVoted = originalHasVoted;
      idea.userVoteId = originalUserVoteId;
      this.isVoting = false;
      setTimeout(() => this.cdr.detectChanges(), 0);
    }
  }

  private performLike(idea: any, originalVotesCount: number, originalHasVoted: boolean, originalUserVoteId: any): void {
    if (this.currentUser) {
      const voteData: VoteDto = {
        ideaId: idea.id,
        userId: this.currentUser.id,
        voteType: 'UPVOTE'
      };

      this.voteService.addVote(voteData, this.currentUser.id).pipe(
        takeUntil(this.destroy$)
      ).subscribe({
        next: (created) => {
          console.log('Successfully liked idea:', idea.id);
          idea.userVoteId = created?.id;
          // hasVoted and votesCount already updated optimistically above
          this.isVoting = false;
          // No need to refresh vote count since we did optimistic update
          // The count will be corrected on next page load if needed
        },
        error: (err) => {
          console.error('Erreur like(vote create):', err);
          // Revert optimistic update on error
          idea.votesCount = originalVotesCount;
          idea.hasVoted = originalHasVoted;
          idea.userVoteId = originalUserVoteId;
          this.isVoting = false;
          // Force UI update after error revert
          setTimeout(() => this.cdr.detectChanges(), 0);
        }
      });
    } else {
      console.error('Cannot perform like: missing currentUser');
      // Revert optimistic update
      idea.votesCount = originalVotesCount;
      idea.hasVoted = originalHasVoted;
      idea.userVoteId = originalUserVoteId;
      this.isVoting = false;
      setTimeout(() => this.cdr.detectChanges(), 0);
    }
  }

  toggleBookmark(idea: any, event: Event): void {
    event.stopPropagation();
    
    // Prevent multiple rapid clicks
    if (this.isBookmarking) {
      console.log('Bookmark action in progress, ignoring click');
      return;
    }
    
    this.isBookmarking = true;
    console.log('Toggle bookmark clicked for idea:', idea.id);
    
    if (!this.currentUser) {
      console.error('No current user found for bookmark');
      this.isBookmarking = false;
      return;
    }

    // Store original state for revert
    const originalIsBookmarked = idea.isBookmarked;
    const originalBookmarkCount = idea.bookmarkCount;
    const originalBookmarkId = idea.bookmarkId;
    
    if (idea.isBookmarked && idea.bookmarkId) {
      // Remove bookmark
      console.log('Removing bookmark with ID:', idea.bookmarkId);
      this.bookmarkService.removeBookmark(idea.bookmarkId, this.currentUser.id).pipe(
        takeUntil(this.destroy$)
      ).subscribe({
        next: () => {
          console.log('Successfully removed bookmark for idea:', idea.id);
          this.isBookmarking = false;
          // Update UI immediately after successful removal
          idea.isBookmarked = false;
          idea.bookmarkId = undefined;
          idea.bookmarkCount = Math.max(0, (idea.bookmarkCount || 0) - 1);
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error removing bookmark:', err);
          // Revert optimistic update on error
          idea.isBookmarked = originalIsBookmarked;
          idea.bookmarkCount = originalBookmarkCount;
          idea.bookmarkId = originalBookmarkId;
          this.isBookmarking = false;
          // Force UI update after error revert
          this.cdr.detectChanges();
        }
      });
    } else {
      // Check if bookmark already exists before adding
      console.log('Checking if bookmark already exists for idea:', idea.id);
      this.bookmarkService.hasBookmarked(idea.id, this.currentUser.id).pipe(
        takeUntil(this.destroy$)
      ).subscribe({
        next: (hasBookmark) => {
          if (hasBookmark) {
            console.log('Bookmark already exists, refreshing bookmark details');
            // Bookmark exists but we don't have the ID, refresh details
            this.refreshBookmarkDetails(idea);
            this.isBookmarking = false;
          } else {
            // Add bookmark
            console.log('Adding new bookmark for idea:', idea.id);
            const bookmarkData: BookmarkDto = {
              ideaId: idea.id,
              userId: this.currentUser!.id
            };
            
            this.bookmarkService.addBookmark(bookmarkData, this.currentUser!.id).pipe(
              takeUntil(this.destroy$)
            ).subscribe({
              next: (created) => {
                console.log('Successfully added bookmark for idea:', idea.id);
                idea.bookmarkId = created?.id;
                idea.isBookmarked = true;
                idea.bookmarkCount = (idea.bookmarkCount || 0) + 1;
                this.isBookmarking = false;
                this.cdr.detectChanges();
              },
              error: (err) => {
                console.error('Error adding bookmark:', err);
                // Check if it's a "already exists" error
                if (err.status === 409 || err.error?.message?.includes('already bookmarked')) {
                  console.log('Bookmark already exists, refreshing details');
                  this.refreshBookmarkDetails(idea);
                } else {
                  // Revert optimistic update on other errors
                  idea.isBookmarked = originalIsBookmarked;
                  idea.bookmarkCount = originalBookmarkCount;
                }
                this.isBookmarking = false;
                this.cdr.detectChanges();
              }
            });
          }
        },
        error: (err) => {
          console.error('Error checking bookmark status:', err);
          // Try to add anyway and let backend handle duplicate
          const bookmarkData: BookmarkDto = {
            ideaId: idea.id,
            userId: this.currentUser!.id
          };
          
          this.bookmarkService.addBookmark(bookmarkData, this.currentUser!.id).pipe(
            takeUntil(this.destroy$)
          ).subscribe({
            next: (created) => {
              console.log('Successfully added bookmark for idea:', idea.id);
              idea.bookmarkId = created?.id;
              idea.isBookmarked = true;
              idea.bookmarkCount = (idea.bookmarkCount || 0) + 1;
              this.isBookmarking = false;
              this.cdr.detectChanges();
            },
            error: (addErr) => {
              console.error('Error adding bookmark:', addErr);
              // Refresh details to get current state
              this.refreshBookmarkDetails(idea);
              this.isBookmarking = false;
              this.cdr.detectChanges();
            }
          });
        }
      });
    }
  }

  private loadBookmarksForIdeas(): void {
    if (!this.currentUser) {
      console.log('[DEBUG] Cannot load bookmarks - no current user');
      return;
    }

    console.log('[DEBUG] Loading bookmarks from backend for user', this.currentUser.id);
    
    this.bookmarkService.getMyBookmarks(this.currentUser.id).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (bookmarks) => {
        console.log('[DEBUG] User bookmarks loaded from backend:', bookmarks);
        const bookmarksByIdeaId = new Map<number, BookmarkDto>();
        
        // Process bookmarks safely
        if (Array.isArray(bookmarks)) {
          bookmarks.forEach(b => {
            if (b && typeof b.ideaId === 'number') {
              bookmarksByIdeaId.set(b.ideaId, b);
              console.log(`[DEBUG] Found bookmark for idea ${b.ideaId} with ID ${b.id}`);
            }
          });
        }

        // Update each idea with bookmark information
        this.recentIdeas.forEach(idea => {
          const bookmark = bookmarksByIdeaId.get(idea.id);
          if (bookmark) {
            idea.isBookmarked = true;
            idea.bookmarkId = bookmark.id;
            console.log(`[DEBUG] Idea ${idea.id}: isBookmarked=true, bookmarkId=${bookmark.id}`);
          } else {
            idea.isBookmarked = false;
            idea.bookmarkId = undefined;
            console.log(`[DEBUG] Idea ${idea.id}: isBookmarked=false, no bookmark found`);
          }
        });
        
        // Force UI update after loading bookmarks with setTimeout to avoid NG0100 error
        setTimeout(() => {
          this.cdr.detectChanges();
          console.log('[DEBUG] Bookmark synchronization complete');
        }, 0);
      },
      error: (err) => {
        console.error('[DEBUG] Error loading user bookmarks:', err);
        // Reset all bookmark states on error
        this.recentIdeas.forEach(idea => {
          idea.isBookmarked = false;
          idea.bookmarkId = undefined;
        });
        // Ensure UI still updates even on error
        this.cdr.detectChanges();
      }
    });
  }

  private loadRealCountsForIdeas(): void {
    // DISABLED: This method was overwriting correct vote counts from idea service
    // with incorrect counts from vote service (which only counts actual votes in DB)
    // The idea service maintains the correct vote_count field via voteCount updates
    console.log('[DEBUG] loadRealCountsForIdeas() disabled - using idea service vote counts instead');
    
    /* 
    if (this.recentIdeas.length === 0) {
      console.log('[DEBUG] No ideas to load counts for');
      return;
    }

    console.log('[DEBUG] Loading real counts from backend for', this.recentIdeas.length, 'ideas');
    
    // Create an array of observables for all vote and bookmark counts
    const countRequests = this.recentIdeas.map(idea => {
      return forkJoin({
        voteCount: this.voteService.countVotesByIdea(idea.id),
        bookmarkCount: this.bookmarkService.countBookmarksByIdea(idea.id)
      }).pipe(
        takeUntil(this.destroy$)
      );
    });

    // Execute all count requests in parallel
    forkJoin(countRequests).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (counts) => {
        console.log('[DEBUG] Real counts loaded from backend:', counts);
        
        // Update each idea with real counts from backend
        counts.forEach((count, index) => {
          const idea = this.recentIdeas[index];
          if (idea) {
            // Log current vs new values to detect discrepancies
            console.log(`[DEBUG] Idea ${idea.id}: current votes=${idea.votesCount}, backend votes=${count.voteCount}`);
            
            // IMPORTANT: Only update vote count if backend has non-zero value
            // This prevents overwriting correct vote counts from idea service with zeros
            if (count.voteCount > 0 && idea.votesCount !== count.voteCount) {
              console.log(`[DEBUG] Updating vote count for idea ${idea.id}: ${idea.votesCount} → ${count.voteCount}`);
              idea.votesCount = count.voteCount;
            } else if (count.voteCount === 0) {
              console.log(`[DEBUG] Keeping original vote count for idea ${idea.id}: ${idea.votesCount} (backend returned 0)`);
            }
            
            // Always update bookmark count (bookmarks can be 0 legitimately)
            if (idea.bookmarkCount !== count.bookmarkCount) {
              console.log(`[DEBUG] Updating bookmark count for idea ${idea.id}: ${idea.bookmarkCount} → ${count.bookmarkCount}`);
              idea.bookmarkCount = count.bookmarkCount;
            }
          }
        });
        
        // Force UI update after loading counts with setTimeout to avoid NG0100 error
        setTimeout(() => {
          this.cdr.detectChanges();
          console.log('[DEBUG] Real counts synchronization complete');
        }, 0);
      },
      error: (err) => {
        console.error('[DEBUG] Error loading real counts:', err);
        // Keep existing counts on error, but ensure UI updates
        this.cdr.detectChanges();
      }
    });
    */
  }

  private refreshVoteCount(idea: any): void {
    console.log(`[DEBUG] Refreshing vote count for idea ${idea.id} from backend`);
    this.voteService.countVotesByIdea(idea.id).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (count) => {
        idea.votesCount = count;
        console.log(`[DEBUG] Refreshed vote count for idea ${idea.id}: ${count} (total votes from backend)`);
        setTimeout(() => this.cdr.detectChanges(), 0);
      },
      error: (err) => {
        console.error(`[DEBUG] Error refreshing vote count for idea ${idea.id}:`, err);
        setTimeout(() => this.cdr.detectChanges(), 0);
      }
    });
  }

  private refreshBookmarkCount(idea: any): void {
    this.bookmarkService.countBookmarksByIdea(idea.id).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (count) => {
        idea.bookmarkCount = count;
        idea.isBookmarked = count > 0;
        console.log(`[DEBUG] Refreshed bookmark count for idea ${idea.id}: ${count}`);
        // Also refresh bookmark details if bookmarked
        if (count > 0 && this.currentUser) {
          this.refreshBookmarkDetails(idea);
        } else {
          idea.bookmarkId = undefined;
        }
        setTimeout(() => this.cdr.detectChanges(), 0);
      },
      error: (err) => {
        console.error(`[DEBUG] Error refreshing bookmark count for idea ${idea.id}:`, err);
        setTimeout(() => this.cdr.detectChanges(), 0);
      }
    });
  }

  private refreshBookmarkDetails(idea: any): void {
    if (!this.currentUser) return;
    
    console.log(`[DEBUG] Refreshing bookmark details for idea ${idea.id}`);
    this.bookmarkService.getMyBookmarks(this.currentUser.id).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (bookmarks) => {
        const userBookmark = bookmarks.find(b => b.ideaId === idea.id);
        if (userBookmark) {
          idea.bookmarkId = userBookmark.id;
          idea.isBookmarked = true;
          console.log(`[DEBUG] Found existing bookmark for idea ${idea.id} with ID ${userBookmark.id}`);
        } else {
          idea.bookmarkId = undefined;
          idea.isBookmarked = false;
          console.log(`[DEBUG] No existing bookmark found for idea ${idea.id}`);
        }
        setTimeout(() => this.cdr.detectChanges(), 0);
      },
      error: (err) => {
        console.error(`[DEBUG] Error refreshing bookmark details for idea ${idea.id}:`, err);
        // Reset bookmark state on error
        idea.bookmarkId = undefined;
        idea.isBookmarked = false;
        setTimeout(() => this.cdr.detectChanges(), 0);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
