import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Sidebar } from '../../../core/components/sidebar/sidebar';
import { IdeaService, IdeaBackend } from '../../../services/idea';
import { VoteService, VoteDto } from '../../../services/vote.service';
import { UserProfileService, UserProfile } from '../../../services/user-profile.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

interface IdeaFrontend {
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
  bookmarkCount?: number;
  userVoteId?: number;
}

@Component({
  selector: 'app-ideas-list',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule, Sidebar],
  templateUrl: './ideas-list.component.html',
  styleUrls: ['./ideas-list.component.css']
})
export class IdeasListComponent implements OnInit, OnDestroy {
  ideas: IdeaFrontend[] = [];
  loading = true;
  error = false;
  searchTerm = '';
  currentUser: UserProfile | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private ideaService: IdeaService,
    private voteService: VoteService,
    private userProfileService: UserProfileService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadCurrentUser();
    this.loadIdeas();
  }

  private loadCurrentUser(): void {
    const userId = localStorage.getItem('userId');
    if (userId) {
      this.userProfileService.getUserProfile(parseInt(userId)).pipe(takeUntil(this.destroy$)).subscribe({
        next: (user: UserProfile) => {
          this.currentUser = user;
          console.log('Current user loaded:', user);
        },
        error: (err: any) => {
          console.error('Error loading user profile:', err);
        }
      });
    }
  }

  private loadIdeas(): void {
    this.loading = true;
    this.error = false;
    
    // Use organization-based filtering like dashboard
    this.ideaService.getIdeasForCurrentUser().pipe(takeUntil(this.destroy$)).subscribe({
      next: (ideas: IdeaBackend[]) => {
        console.log('Loaded ideas for current user:', ideas);
        
        this.ideas = ideas
          .sort((a: IdeaBackend, b: IdeaBackend) => new Date(b.creationDate).getTime() - new Date(a.creationDate).getTime())
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
            isBookmarked: false,
            bookmarkCount: 0,
            userVoteId: undefined
          }));

        // Load votes and bookmarks after ideas are loaded
        if (this.currentUser) {
          this.syncVotesForIdeas();
          this.loadBookmarksForIdeas();
        }

        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err: any) => {
        console.error('Error loading ideas:', err);
        this.error = true;
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  private syncVotesForIdeas(): void {
    if (!this.currentUser || this.ideas.length === 0) return;

    this.voteService.myVotes(this.currentUser.id).pipe(takeUntil(this.destroy$)).subscribe({
      next: (votes: VoteDto[]) => {
        const votesByIdeaId = new Map<number, VoteDto>();
        votes.forEach(v => {
          if (v.ideaId) votesByIdeaId.set(v.ideaId, v);
        });

        this.ideas.forEach(idea => {
          const v = votesByIdeaId.get(idea.id);
          idea.hasVoted = !!v;
          idea.userVoteId = v?.id;
        });
        this.cdr.markForCheck();
      },
      error: (err: any) => console.error('Error syncing votes:', err)
    });
  }

  private loadBookmarksForIdeas(): void {
    const userId = this.currentUser?.id || localStorage.getItem('userId') || '1';
    const bookmarkKey = `bookmarks_user_${userId}`;
    const bookmarks = JSON.parse(localStorage.getItem(bookmarkKey) || '[]');
    
    this.ideas.forEach((idea: any) => {
      idea.isBookmarked = bookmarks.includes(idea.id);
      idea.bookmarkCount = idea.bookmarkCount || 0;
    });
  }

  toggleBookmark(idea: any, event: Event): void {
    event.stopPropagation();
    console.log('Toggle bookmark clicked for idea:', idea.id);
    
    const userId = this.currentUser?.id || localStorage.getItem('userId') || '1';
    const bookmarkKey = `bookmarks_user_${userId}`;
    let bookmarks = JSON.parse(localStorage.getItem(bookmarkKey) || '[]');
    
    if (idea.isBookmarked) {
      bookmarks = bookmarks.filter((bookmarkId: number) => bookmarkId !== idea.id);
      idea.isBookmarked = false;
      idea.bookmarkCount = Math.max(0, (idea.bookmarkCount || 0) - 1);
    } else {
      bookmarks.push(idea.id);
      idea.isBookmarked = true;
      idea.bookmarkCount = (idea.bookmarkCount || 0) + 1;
    }
    
    localStorage.setItem(bookmarkKey, JSON.stringify(bookmarks));
    this.cdr.markForCheck();
  }

  toggleVote(idea: any, event: Event): void {
    event.stopPropagation();
    console.log('Toggle vote clicked for idea:', idea.id);
    
    if (!this.currentUser) {
      console.error('No current user found');
      return;
    }

    if (idea.hasVoted) {
      if (!idea.userVoteId) {
        console.error('Cannot unlike: missing userVoteId for idea', idea.id);
        return;
      }

      this.voteService.deleteVote(idea.userVoteId, this.currentUser.id).pipe(takeUntil(this.destroy$)).subscribe({
        next: () => {
          idea.votesCount = Math.max(0, (idea.votesCount || 0) - 1);
          idea.hasVoted = false;
          idea.userVoteId = undefined;
          this.cdr.markForCheck();
        },
        error: (err: any) => console.error('Error unlike:', err)
      });
    } else {
      const voteData: VoteDto = {
        ideaId: idea.id,
        userId: this.currentUser.id,
        voteType: 'UPVOTE'
      };

      this.voteService.addVote(voteData, this.currentUser.id).pipe(takeUntil(this.destroy$)).subscribe({
        next: (created: VoteDto | undefined) => {
          idea.votesCount = (idea.votesCount || 0) + 1;
          idea.hasVoted = true;
          idea.userVoteId = created?.id;
          this.cdr.markForCheck();
        },
        error: (err: any) => console.error('Error like:', err)
      });
    }
  }

  onIdeaClick(idea: IdeaFrontend): void {
    this.router.navigate(['/idea', idea.id]);
  }

  getFilteredIdeas(): IdeaFrontend[] {
    if (!this.searchTerm) {
      return this.ideas;
    }
    
    const term = this.searchTerm.toLowerCase();
    return this.ideas.filter(idea => 
      idea.title.toLowerCase().includes(term) ||
      idea.description.toLowerCase().includes(term) ||
      idea.author.toLowerCase().includes(term) ||
      idea.category.toLowerCase().includes(term)
    );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
