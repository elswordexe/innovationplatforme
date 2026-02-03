import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VotedIdeaCardComponent } from './voted-idea-card.component';
import { Sidebar } from '../../core/components/sidebar/sidebar';
import { Navbside } from '../../core/components/navbside/navbside';
import { Toolbar } from '../../core/components/toolbar/toolbar';
import { Idea } from '../../core/models/idea';
import { IdeaService } from '../../services/idea';
import { VoteService } from '../../services/vote.service';
import { Router, NavigationEnd } from '@angular/router';
import { filter, timeout, catchError } from 'rxjs/operators';
import { Subscription, of } from 'rxjs';
import { UserProfileService, UserProfile } from '../../services/user-profile.service';
import { ChangeDetectorRef } from '@angular/core';
import { OrganizationService } from '../../services/organization.service';

@Component({
  selector: 'app-votes',
  standalone: true,
  imports: [CommonModule, VotedIdeaCardComponent, Sidebar, Navbside, Toolbar],
  templateUrl: './votes.html',
  styleUrls: ['./votes.css']
})
export class Votes implements OnInit, OnDestroy {
  votedIdeas: Idea[] = [];
  isLoading = true;
  error: string | null = null;
  currentUser: UserProfile | null = null;
  currentUserId: number | null = null;
  private subs: Subscription[] = [];
  currentSort: 'date' | 'score' | 'votes' = 'date';

  constructor(
    private ideaService: IdeaService,
    private voteService: VoteService,
    private userProfileService: UserProfileService,
    private organizationService: OrganizationService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  // Helper methods for template access
  get hasOrganization(): boolean {
    const tenantId = localStorage.getItem('tenantId');
    return !!(this.currentUser?.tenantName || (tenantId && tenantId !== '1'));
  }

  get isIndividualUser(): boolean {
    const tenantId = localStorage.getItem('tenantId');
    return !this.currentUser?.tenantName && (!tenantId || tenantId === '1');
  }

  ngOnInit(): void {
    // Listen for organization changes
    this.subs.push(this.organizationService.organizationChanged$.subscribe(change => {
      console.log('[DEBUG Votes] Organization changed:', change);
      // Reload voted ideas when organization changes
      this.loadVotedIdeas();
    }));

    // Subscribe to votes changes only (reload when votes change)
    this.subs.push(this.voteService.votesChanged$.subscribe(() => {
      console.log('[DEBUG Votes] votesChanged, reloading');
      this.loadVotedIdeas();
    }));

    // Subscribe to user profile but only set currentUserId (don't reload on user change)
    this.subs.push(this.userProfileService.currentUser$.subscribe(user => {
      console.log('[DEBUG Votes] currentUser changed:', user?.id);
      this.currentUser = user;
      this.currentUserId = user?.id ?? parseInt(localStorage.getItem('userId') || '1');
      // Don't call loadVotedIdeas() here - it will be called once in the initial load
    }));

    // Also reload on navigation to this route (cover navigation behavior/route reuse)
    this.subs.push(this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe((ev: any) => {
      if (ev.url && ev.url.includes('/votes')) {
        console.log('[DEBUG Votes] Navigated to votes, reloading');
        this.loadVotedIdeas();
      }
    }));

    // Load once on init
    this.loadVotedIdeas();
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }

  onSortChange(event: any): void {
    this.currentSort = event.target.value;
    this.sortIdeas();
  }

  sortIdeas(): void {
    switch (this.currentSort) {
      case 'score':
        this.votedIdeas.sort((a, b) => (b.totalScore || 0) - (a.totalScore || 0));
        break;
      case 'votes':
        this.votedIdeas.sort((a, b) => (b.voteCount || 0) - (a.voteCount || 0));
        break;
      case 'date':
      default:
        this.votedIdeas.sort((a, b) => new Date(b.creationDate).getTime() - new Date(a.creationDate).getTime());
        break;
    }
  }

  viewIdea(ideaId: number): void {
    this.router.navigate(['/idea', ideaId]);
  }

  navigateToJoin(): void {
    this.router.navigate(['/post-registration']);
  }

  navigateToIdeas(): void {
    this.router.navigate(['/ideas']);
  }

  loadVotedIdeas(): void {
    if (!this.currentUserId) {
      // fallback to localStorage userId
      this.currentUserId = parseInt(localStorage.getItem('userId') || '1');
    }

    console.log('[DEBUG Votes] Starting loadVotedIdeas for user', this.currentUserId);
    this.isLoading = true;
    this.error = null;

    // Récupérer les votes de l'utilisateur
    this.voteService.myVotes(this.currentUserId).pipe(
      timeout(5000),
      catchError(err => {
        console.error('[DEBUG Votes] Error/timeout loading votes:', err);
        return of([]);
      })
    ).subscribe({
      next: (votes) => {
        console.log('[DEBUG Votes] Votes loaded:', (votes || []).length);
        // Récupérer les détails de chaque idée votée
        const ideaIds = (votes || []).map(v => v.ideaId);

        if (ideaIds.length === 0) {
          this.votedIdeas = [];
          this.isLoading = false;
          this.cdr.detectChanges();
          console.log('[DEBUG Votes] No voted ideas, set isLoading to FALSE');
          return;
        }

        // Charger les détails des idées
        this.ideaService.getIdeasForCurrentUser().pipe(
          timeout(10000),
          catchError(err => {
            console.error('[DEBUG Votes] Error/timeout loading ideas:', err);
            return of([]);
          })
        ).subscribe({
          next: (ideas: any[]) => {
            // Check if user has organization
            const tenantId = localStorage.getItem('tenantId');
            if ((!tenantId || tenantId === '1') && ideas.length === 0) {
              // Individual user without organization - show empty state
              this.votedIdeas = [];
              this.isLoading = false;
              this.cdr.detectChanges();
              console.log('[DEBUG Votes] Individual user without organization - empty state');
              return;
            }

            // Associer les votes aux idées
            this.votedIdeas = (ideas || []).filter(idea => ideaIds.includes(idea.id));
            
            // Ajouter le type de vote à chaque idée
            this.votedIdeas.forEach(idea => {
              const vote = (votes || []).find(v => v.ideaId === idea.id);
              if (vote) {
                idea.voteType = vote.voteType;
              }
            });
            
            this.sortIdeas();
            this.isLoading = false;
            this.cdr.detectChanges();
            console.log('[DEBUG Votes] Loaded', this.votedIdeas.length, 'voted ideas, set isLoading to FALSE');
          },
          error: (err) => {
            this.error = 'Erreur lors du chargement des idées';
            console.error('[DEBUG Votes] Error:', err);
            this.isLoading = false;
            this.cdr.detectChanges();
          }
        });
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement des votes';
        console.error('[DEBUG Votes] Error:', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }
}