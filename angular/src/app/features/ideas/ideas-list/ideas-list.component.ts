import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { IdeaService } from '../../../core/services/idea.service';
import { AuthService } from '../../../core/services/auth.service';
import { UserService } from '../../../core/services/user.service';
import { Idea, IdeaStatus, VoteKind } from '../../../core/models/idea.model';
import { IdeaCardComponent } from '../components/idea-card/idea-card.component';
import { Sidebar } from '../../../core/components/sidebar/sidebar';

interface FeedbackItem {
  id: number;
  userId: number;
  ideaId: number;
  comment: string;
  authorName?: string;
  createdAt?: string;
}

@Component({
  selector: 'app-ideas-list',
  standalone: true,
  imports: [CommonModule, IdeaCardComponent, RouterModule, Sidebar],
  template: `
    <div class="flex min-h-screen bg-slate-50">
      <app-sidebar></app-sidebar>

      <div class="flex-1 lg:pl-64">
        <div class="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          
          <div class="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div>
              <h1 class="text-3xl font-bold text-slate-900 flex items-center gap-3">
                <span class="text-[#915506]">⚙</span> All Ideas
              </h1>
              <p class="text-slate-500 mt-1">Explorez et votez pour les innovations de demain</p>
            </div>

            <div class="flex items-center gap-3">
               <div class="relative">
                  <input type="text" placeholder="Rechercher..." 
                         class="pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-[#915506]/20 focus:border-[#915506]">
                  <span class="absolute left-3 top-2.5 text-slate-400">🔍</span>
               </div>
               
               <a class="bg-[#915506] text-white px-4 h-10 rounded-lg flex items-center justify-center hover:bg-[#7a4605] transition-colors shadow-sm" routerLink="/ideas/create">
                  + Ajouter une idée
               </a>
            </div>
          </div>

          <div *ngIf="loading()" class="py-20 text-center">
              <div class="inline-block w-8 h-8 border-4 border-[#915506]/20 border-t-[#915506] rounded-full animate-spin mb-4"></div>
              <p class="text-slate-500">Chargement des idées...</p>
          </div>

          <div *ngIf="error()" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {{ error() }}
          </div>
          <div *ngIf="actionError()" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {{ actionError() }}
          </div>
          <div *ngIf="actionMessage()" class="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg mb-6">
              {{ actionMessage() }}
          </div>

          <div *ngIf="!loading() && !error()" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <app-idea-card
              *ngFor="let idea of ideas()"
              [idea]="idea"
              (vote)="onVote($event.idea, $event.type)"
              (bookmark)="onBookmark($event)"
              (comments)="openComments($event)"
              (view)="onView($event)"
              (edit)="onEdit($event)"
            ></app-idea-card>
            
            <div *ngIf="ideas().length === 0" class="col-span-full py-20 text-center bg-white rounded-3xl border border-dashed border-slate-200">
               <div class="text-4xl mb-4">📭</div>
               <h3 class="text-lg font-bold text-slate-900 mb-2">Aucune idée trouvée</h3>
               <p class="text-slate-500">Soyez le premier à proposer une innovation !</p>
            </div>
          </div>

          <div *ngIf="!loading() && ideas().length > 0" class="mt-8 flex items-center justify-between border-t border-slate-200 pt-6">
             <p class="text-sm text-slate-500">Affichage de {{ ideas().length }} résultats</p>
             <div class="flex gap-2">
                <button class="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium hover:bg-white disabled:opacity-50" disabled>Précédent</button>
                <button class="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium hover:bg-white disabled:opacity-50" disabled>Suivant</button>
             </div>
          </div>

        </div>
      </div>
    </div>

    <!-- Comments Modal -->
    <div *ngIf="activeIdea()" class="fixed inset-0 bg-slate-900/40 flex items-center justify-center p-4 z-50">
      <div class="bg-white w-full max-w-2xl rounded-2xl shadow-lg border border-slate-100">
        <div class="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h3 class="text-lg font-semibold text-slate-900">Commentaires</h3>
            <p class="text-xs text-slate-500">{{ activeIdea()?.title }}</p>
          </div>
          <button class="text-slate-400 hover:text-slate-700" (click)="closeComments()">✕</button>
        </div>

        <div class="px-6 py-4 max-h-[420px] overflow-auto">
          <div *ngIf="feedbackLoading()" class="text-sm text-slate-500">Chargement des commentaires...</div>
          <div *ngIf="feedbackError()" class="text-sm text-red-600">{{ feedbackError() }}</div>

          <div *ngIf="!feedbackLoading() && feedbacks().length === 0" class="text-sm text-slate-500">
            Aucun commentaire pour cette idée.
          </div>

          <div *ngFor="let fb of feedbacks()" class="border border-slate-100 rounded-lg p-3 mb-3">
            <div class="text-xs text-slate-500 mb-1">{{ fb.authorName || 'Utilisateur' }} · {{ formatDate(fb.createdAt) }}</div>
            <div class="text-sm text-slate-700">{{ fb.comment }}</div>
          </div>
        </div>

        <div class="px-6 py-4 border-t border-slate-100">
          <div class="flex gap-2">
            <input
              type="text"
              class="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm"
              placeholder="Ajouter un commentaire..."
              [value]="feedbackInput()"
              (input)="onFeedbackInput($event)" />
            <button class="bg-[#915506] text-white px-4 rounded-lg text-sm" (click)="submitFeedback()">Envoyer</button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class IdeasListComponent implements OnInit {
  private ideaService = inject(IdeaService);
  private http = inject(HttpClient);
  private router = inject(Router);
  private authService = inject(AuthService);
  private userService = inject(UserService);

  ideas = signal<Idea[]>([]);
  loading = signal<boolean>(true);
  error = signal<string | null>(null);

  activeIdea = signal<Idea | null>(null);
  feedbacks = signal<FeedbackItem[]>([]);
  feedbackLoading = signal<boolean>(false);
  feedbackError = signal<string | null>(null);
  feedbackInput = signal<string>('');
  actionError = signal<string | null>(null);
  actionMessage = signal<string | null>(null);

  private userCache = new Map<number, string>();
  private orgCache = new Map<number, string>();
  private hasVotedCache = new Map<string, boolean>();
  private top10Ids = new Set<number>();

  private currentUserId = signal<number | null>(this.authService.getUserId());
  private currentRole = signal<string | null>(this.authService.getRole());
  private votesBaseUrl = '/api/votes/votes';
  private votesFallbackUrl = '/api/votes';
  private feedbackBaseUrl = '/api/votes/feedbacks';
  private feedbackFallbackUrl = '/api/feedbacks';

  ngOnInit() {
    this.ensureCurrentUser();
    this.fetchIdeas();
  }

  fetchIdeas() {
    this.loading.set(true);
    this.error.set(null);
    this.ideaService.getAllIdeas().subscribe({
      next: (data) => {
        const userId = this.currentUserId();
        const enrichedData = (data || []).map((i) => ({
          ...i,
          creatorName: i.creatorName || (i as any).creatorFullName || 'Utilisateur',
          organizationName: i.organizationName || 'Organisation',
          isInTop10: i.isInTop10 || false,
          voteCount: i.voteCount || 0,
          feedbackCount: (i as any).feedbackCount || 0,
          tags: (i as any).tags || [],
          isBookmarked: this.isBookmarked(i.id),
          hasVoted: false,
          votedType: undefined,
          canEdit: userId !== null && i.creatorId === userId,
          canView: this.canViewIdea(i),
          showStatusBadge: this.shouldShowStatusBadge(i)
        }));

        this.ideas.set(enrichedData);
        this.loading.set(false);

        this.enrichNames(enrichedData);
        this.loadTop10();
        this.enrichVotes(enrichedData);
      },
      error: (err) => {
        console.error('Error fetching ideas:', err);
        this.error.set('Impossible de charger les idées. Vérifiez votre connexion.');
        this.loading.set(false);
      }
    });
  }

  onVote(idea: Idea, type: VoteKind) {
    const token = this.authService.getToken();
    console.log('token exists', !!token);
    console.log('Like clicked', idea.id, type);
    this.actionError.set(null);
    this.actionMessage.set(null);

    if (!this.authService.isAuthenticated()) {
      this.actionError.set('Token manquant ou expiré. Connectez-vous.');
      return;
    }

    if (idea.hasVoted) {
      this.actionMessage.set('Vous avez deja vote pour cette idee.');
      return;
    }

    this.resolveUserId(
      (userId) => {
        const payload = {
          userId,
          ideaId: idea.id,
          voteType: type
        };

        console.log('Vote payload', payload);
        this.postVote(payload, idea.id, type);
      },
      (message) => {
        this.actionError.set(message);
      }
    );
  }

  onBookmark(idea: Idea) {
    const next = !idea.isBookmarked;
    this.setBookmarked(idea.id, next);
    this.ideas.update((items) =>
      items.map((item) =>
        item.id === idea.id
          ? { ...item, isBookmarked: next }
          : item
      )
    );
  }

  onView(idea: Idea) {
    if (idea.canView === false) {
      return;
    }
    this.router.navigate(['/ideas', idea.id]);
  }

  onEdit(idea: Idea) {
    this.router.navigate(['/ideas', idea.id, 'edit']);
  }

  openComments(idea: Idea) {
    this.activeIdea.set(idea);
    this.feedbackInput.set('');
    this.loadFeedbacks(idea.id);
  }

  closeComments() {
    this.activeIdea.set(null);
    this.feedbacks.set([]);
    this.feedbackError.set(null);
  }

  onFeedbackInput(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.feedbackInput.set(value);
    if (this.feedbackError()) {
      this.feedbackError.set(null);
    }
  }

  submitFeedback() {
    const idea = this.activeIdea();
    if (!idea) {
      return;
    }

    const comment = this.feedbackInput().trim();
    if (!comment) {
      this.feedbackError.set('Le commentaire est vide.');
      return;
    }

    if (!this.authService.isAuthenticated()) {
      this.feedbackError.set('Token manquant ou expiré. Connectez-vous.');
      return;
    }

    this.resolveUserId(
      (userId) => {
        const payload = {
          userId,
          ideaId: idea.id,
          comment
        };

        console.log('Comment submit', payload);
        this.feedbackError.set(null);

        this.http.post(this.feedbackBaseUrl, payload).subscribe({
          next: () => {
            this.feedbackInput.set('');
            this.loadFeedbacks(idea.id);
            this.incrementFeedbackCount(idea.id);
            this.actionMessage.set('Commentaire ajoute.');
          },
          error: (err) => {
            if (err?.status === 404) {
              this.http.post(this.feedbackFallbackUrl, payload).subscribe({
                next: () => {
                  this.feedbackInput.set('');
                  this.loadFeedbacks(idea.id);
                  this.incrementFeedbackCount(idea.id);
                  this.actionMessage.set('Commentaire ajoute.');
                },
                error: (fallbackErr) => {
                  console.error('Feedback failed:', fallbackErr);
                  this.feedbackError.set(this.formatHttpError(fallbackErr, 'Impossible d\'envoyer le commentaire.'));
                }
              });
            } else {
              console.error('Feedback failed:', err);
              this.feedbackError.set(this.formatHttpError(err, 'Impossible d\'envoyer le commentaire.'));
            }
          }
        });
      },
      (message) => {
        this.feedbackError.set(message);
      }
    );
  }

  private loadFeedbacks(ideaId: number) {
    this.feedbackLoading.set(true);
    this.feedbackError.set(null);
    this.http.get<FeedbackItem[]>(`${this.feedbackBaseUrl}/byIdea/${ideaId}`).subscribe({
      next: (items) => {
        const withAuthors = items.map((fb) => ({
          ...fb,
          authorName: fb.authorName
        }));
        this.feedbacks.set(withAuthors);
        this.feedbackLoading.set(false);
        this.enrichFeedbackAuthors(items);
      },
      error: (err) => {
        if (err?.status === 404) {
          this.http.get<FeedbackItem[]>(`${this.feedbackFallbackUrl}/byIdea/${ideaId}`).subscribe({
            next: (items) => {
              const withAuthors = items.map((fb) => ({
                ...fb,
                authorName: fb.authorName
              }));
              this.feedbacks.set(withAuthors);
              this.feedbackLoading.set(false);
              this.enrichFeedbackAuthors(items);
            },
            error: (fallbackErr) => {
              console.error('Feedback load failed:', fallbackErr);
              this.feedbacks.set([]);
              this.feedbackLoading.set(false);
              this.feedbackError.set(this.formatHttpError(fallbackErr, 'Impossible de charger les commentaires.'));
            }
          });
        } else {
          console.error('Feedback load failed:', err);
          this.feedbacks.set([]);
          this.feedbackLoading.set(false);
          this.feedbackError.set(this.formatHttpError(err, 'Impossible de charger les commentaires.'));
        }
      }
    });
  }

  private enrichFeedbackAuthors(items: FeedbackItem[]) {
    items.forEach((fb) => {
      if (!fb.userId) {
        return;
      }
      if (this.userCache.has(fb.userId)) {
        this.applyFeedbackAuthor(fb.userId, this.userCache.get(fb.userId) || 'Utilisateur');
        return;
      }
      this.http.get<any>(`/api/users/${fb.userId}`).subscribe({
        next: (user) => {
          const name = user?.firstName && user?.lastName
            ? `${user.firstName} ${user.lastName}`
            : user?.username || user?.email || 'Utilisateur';
          this.userCache.set(fb.userId, name);
          this.applyFeedbackAuthor(fb.userId, name);
        },
        error: () => {
          this.userCache.set(fb.userId, 'Utilisateur');
          this.applyFeedbackAuthor(fb.userId, 'Utilisateur');
        }
      });
    });
  }

  private applyFeedbackAuthor(userId: number, name: string) {
    this.feedbacks.update((items) =>
      items.map((fb) =>
        fb.userId === userId
          ? { ...fb, authorName: name }
          : fb
      )
    );
  }

  private incrementFeedbackCount(ideaId: number) {
    this.ideas.update((items) =>
      items.map((item) =>
        item.id === ideaId
          ? { ...item, feedbackCount: (item.feedbackCount || 0) + 1 }
          : item
      )
    );
  }

  private enrichNames(ideas: Idea[]) {
    ideas.forEach((idea) => {
      if (idea.creatorId && !this.userCache.has(idea.creatorId)) {
        this.http.get<any>(`/api/users/${idea.creatorId}`).subscribe({
          next: (user) => {
            const name = user?.firstName && user?.lastName
              ? `${user.firstName} ${user.lastName}`
              : user?.username || user?.email || 'Utilisateur';
            this.userCache.set(idea.creatorId, name);
            this.applyUserName(idea.creatorId, name);
          },
          error: () => {
            this.userCache.set(idea.creatorId, 'Utilisateur');
            this.applyUserName(idea.creatorId, 'Utilisateur');
          }
        });
      }

      if (idea.organizationId && !this.orgCache.has(idea.organizationId)) {
        this.http.get<any>(`/api/organizations/${idea.organizationId}`).subscribe({
          next: (org) => {
            const name = org?.name || org?.organizationName || 'Organisation';
            this.orgCache.set(idea.organizationId, name);
            this.applyOrgName(idea.organizationId, name);
          },
          error: () => {
            this.orgCache.set(idea.organizationId, 'Organisation');
            this.applyOrgName(idea.organizationId, 'Organisation');
          }
        });
      }
    });
  }

  private applyUserName(userId: number, name: string) {
    this.ideas.update((items) =>
      items.map((item) =>
        item.creatorId === userId
          ? { ...item, creatorName: name }
          : item
      )
    );
  }

  private applyOrgName(orgId: number, name: string) {
    this.ideas.update((items) =>
      items.map((item) =>
        item.organizationId === orgId
          ? { ...item, organizationName: name }
          : item
      )
    );
  }

  private loadTop10() {
    this.http.get<unknown>('/api/ideas/top10').subscribe({
      next: (top) => {
        const list = this.unwrapIdeaList(top);
        this.top10Ids = new Set(list.map((i) => i.id));
        this.ideas.update((items) =>
          items.map((item) =>
            this.top10Ids.has(item.id) ? { ...item, isInTop10: true } : item
          )
        );
      },
      error: () => {
      }
    });
  }

  private unwrapIdeaList(payload: unknown): Idea[] {
    const list = this.findIdeaArray(payload, 0);
    return list ?? [];
  }

  private findIdeaArray(payload: unknown, depth: number): Idea[] | null {
    if (Array.isArray(payload)) {
      return payload as Idea[];
    }

    if (!payload || typeof payload !== 'object' || depth > 3) {
      return null;
    }

    const record = payload as Record<string, unknown>;
    const keys = ['content', 'data', 'ideas', 'items', 'results', 'list'];
    for (const key of keys) {
      const value = record[key];
      if (Array.isArray(value)) {
        return value as Idea[];
      }
      const nested = this.findIdeaArray(value, depth + 1);
      if (nested) {
        return nested;
      }
    }

    const embedded = record['_embedded'];
    if (embedded && typeof embedded === 'object') {
      for (const value of Object.values(embedded as Record<string, unknown>)) {
        if (Array.isArray(value)) {
          return value as Idea[];
        }
        const nested = this.findIdeaArray(value, depth + 1);
        if (nested) {
          return nested;
        }
      }
    }

    return null;
  }

  private enrichVotes(ideas: Idea[]) {
    if (this.currentUserId() === null) {
      return;
    }

    ideas.forEach((idea) => {
      const key = `${this.currentUserId()}-${idea.id}`;
      if (this.hasVotedCache.has(key)) {
        this.markVoted(idea.id, this.hasVotedCache.get(key) === true, 'UPVOTE');
        return;
      }

      this.checkHasVoted(idea.id);
    });
  }

  private markVoted(ideaId: number, hasVoted: boolean, type?: VoteKind) {
    this.ideas.update((items) =>
      items.map((item) =>
        item.id === ideaId
          ? { ...item, hasVoted, votedType: type || item.votedType }
          : item
      )
    );
  }

  private postVote(payload: { userId: number; ideaId: number; voteType: VoteKind }, ideaId: number, type: VoteKind) {
    this.http.post(this.votesBaseUrl, payload).subscribe({
      next: () => {
        this.markVoted(ideaId, true, type);
        this.ideas.update((items) =>
          items.map((item) =>
            item.id === ideaId
              ? { ...item, hasVoted: true, votedType: type, voteCount: (item.voteCount || 0) + 1 }
              : item
          )
        );
        this.actionMessage.set('Vote enregistre.');
      },
      error: (err) => {
        if (err?.status === 404) {
          this.http.post(this.votesFallbackUrl, payload).subscribe({
            next: () => {
              this.markVoted(ideaId, true, type);
              this.ideas.update((items) =>
                items.map((item) =>
                  item.id === ideaId
                    ? { ...item, hasVoted: true, votedType: type, voteCount: (item.voteCount || 0) + 1 }
                    : item
                )
              );
              this.actionMessage.set('Vote enregistre.');
            },
            error: (fallbackErr) => {
              console.error('Vote failed:', fallbackErr);
              this.actionError.set(this.formatHttpError(fallbackErr, 'Impossible de voter.'));
            }
          });
        } else {
          console.error('Vote failed:', err);
          this.actionError.set(this.formatHttpError(err, 'Impossible de voter.'));
        }
      }
    });
  }

  private checkHasVoted(ideaId: number) {
    if (this.currentUserId() === null) {
      return;
    }

    const key = `${this.currentUserId()}-${ideaId}`;
    this.http.get<boolean>(`${this.votesBaseUrl}/hasVoted?userId=${this.currentUserId()}&ideaId=${ideaId}`).subscribe({
      next: (hasVoted) => {
        this.hasVotedCache.set(key, hasVoted);
        this.markVoted(ideaId, hasVoted, hasVoted ? 'UPVOTE' : undefined);
      },
      error: (err) => {
        if (err?.status === 404) {
          this.http.get<boolean>(`${this.votesFallbackUrl}/hasVoted?userId=${this.currentUserId()}&ideaId=${ideaId}`).subscribe({
            next: (hasVoted) => {
              this.hasVotedCache.set(key, hasVoted);
              this.markVoted(ideaId, hasVoted, hasVoted ? 'UPVOTE' : undefined);
            },
            error: () => {
              this.hasVotedCache.set(key, false);
            }
          });
        } else {
          this.hasVotedCache.set(key, false);
        }
      }
    });
  }

  private ensureCurrentUser() {
    if (!this.authService.isAuthenticated()) {
      return;
    }

    if (this.currentUserId() !== null && this.currentRole() !== null) {
      return;
    }

    this.userService.getCurrentUser().subscribe({
      next: (user) => {
        if (user?.id) {
          this.currentUserId.set(user.id);
        }
        if (user?.role) {
          this.currentRole.set(user.role);
        }
        this.refreshPermissions();
        if (this.ideas().length > 0) {
          this.enrichVotes(this.ideas());
        }
      },
      error: (err) => {
        if (err?.status === 401 || err?.status === 403) {
          this.authService.clearToken();
        }
      }
    });
  }

  private resolveUserId(onResolved: (userId: number) => void, onError: (message: string) => void) {
    const cachedId = this.currentUserId();
    if (cachedId !== null) {
      onResolved(cachedId);
      return;
    }

    const decodedUserId = this.authService.getUserId();
    console.log('decoded userId', decodedUserId);
    if (decodedUserId !== null) {
      this.currentUserId.set(decodedUserId);
      onResolved(decodedUserId);
      return;
    }

    this.userService.getCurrentUser().subscribe({
      next: (user) => {
        const id = user?.id ?? null;
        if (id === null) {
          onError('Impossible de recuperer l\'utilisateur.');
          return;
        }
        this.currentUserId.set(id);
        if (user?.role) {
          this.currentRole.set(user.role);
        }
        this.refreshPermissions();
        onResolved(id);
      },
      error: (err) => {
        if (err?.status === 401 || err?.status === 403) {
          this.authService.clearToken();
        }
        onError(this.formatHttpError(err, 'Impossible de recuperer l\'utilisateur.'));
      }
    });
  }

  private refreshPermissions() {
    const userId = this.currentUserId();
    this.ideas.update((items) =>
      items.map((item) => ({
        ...item,
        canEdit: userId !== null && item.creatorId === userId,
        canView: this.canViewIdea(item),
        showStatusBadge: this.shouldShowStatusBadge(item)
      }))
    );
  }

  private isAdmin(): boolean {
    return this.currentRole() === 'ADMIN';
  }

  private formatHttpError(err: any, fallback: string): string {
    if (err?.status === 401 || err?.status === 403) {
      this.authService.clearToken();
      return 'Token manquant ou expiré. Connectez-vous.';
    }
    if (err?.status === 404) {
      return 'Endpoint introuvable. Verifiez la gateway.';
    }
    if (err?.status >= 500) {
      return 'Erreur serveur. Reessayez plus tard.';
    }
    if (err?.status === 0) {
      return 'Impossible de joindre le serveur.';
    }
    return fallback;
  }

  private canViewIdea(idea: Idea): boolean {
    if (idea.status !== IdeaStatus.DRAFT) {
      return true;
    }
    if (this.isAdmin()) {
      return true;
    }
    if (this.currentUserId() === null) {
      return true;
    }
    return idea.creatorId === this.currentUserId();
  }

  private shouldShowStatusBadge(idea: Idea): boolean {
    if (idea.status !== IdeaStatus.DRAFT) {
      return true;
    }
    if (this.isAdmin()) {
      return true;
    }
    if (this.currentUserId() === null) {
      return false;
    }
    return idea.creatorId === this.currentUserId();
  }

  private isBookmarked(ideaId: number): boolean {
    const stored = localStorage.getItem('bookmarkedIdeas');
    if (!stored) {
      return false;
    }
    try {
      const list = JSON.parse(stored) as number[];
      return list.includes(ideaId);
    } catch {
      return false;
    }
  }

  private setBookmarked(ideaId: number, value: boolean) {
    const stored = localStorage.getItem('bookmarkedIdeas');
    let list: number[] = [];
    if (stored) {
      try {
        list = JSON.parse(stored) as number[];
      } catch {
        list = [];
      }
    }

    if (value) {
      if (!list.includes(ideaId)) {
        list.push(ideaId);
      }
    } else {
      list = list.filter((id) => id !== ideaId);
    }

    localStorage.setItem('bookmarkedIdeas', JSON.stringify(list));
  }

  formatDate(value?: string) {
    if (!value) {
      return 'Date inconnue';
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value;
    }
    return date.toLocaleDateString('fr-FR', { year: 'numeric', month: 'short', day: '2-digit' });
  }
}
