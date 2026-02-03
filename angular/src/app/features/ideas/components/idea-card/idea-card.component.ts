import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Idea, IdeaStatus, VoteKind } from '../../../../core/models/idea.model';

@Component({
    selector: 'app-idea-card',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div
      class="bg-white rounded-xl shadow-sm border border-slate-100 p-6 hover:shadow-md transition-shadow duration-300 h-full flex flex-col relative overflow-hidden group"
      [class.cursor-pointer]="idea.canView !== false"
      (click)="onView()">
      
      <div *ngIf="idea.isInTop10" class="absolute top-0 right-0 bg-[#915506] text-white text-xs font-bold px-3 py-1 rounded-bl-xl z-10">
        TOP 10
      </div>

      <div class="flex items-start gap-4 mb-4">
        <div class="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-xl shrink-0">
          💡
        </div>
        
        <div class="min-w-0 flex-1">
          <h3 class="font-bold text-lg text-slate-800 leading-tight mb-1 truncate group-hover:text-[#915506] transition-colors">
            {{ idea.title }}
          </h3>
          <div class="text-xs text-slate-500 flex flex-wrap items-center gap-2">
            <span>👤 {{ idea.creatorName || 'Utilisateur' }}</span>
            <span class="w-1 h-1 rounded-full bg-slate-300"></span>
            <span>🏢 {{ idea.organizationName || 'Organisation' }}</span>
            <span class="w-1 h-1 rounded-full bg-slate-300"></span>
            <span>{{ formatDate(idea.creationDate) }}</span>
          </div>
        </div>
      </div>

      <p class="text-sm text-slate-600 mb-4 line-clamp-2 flex-grow">
        {{ idea.description }}
      </p>

      <div class="flex flex-wrap gap-2 mb-4">
        <span *ngFor="let tag of (idea.tags || [])" class="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
          {{ tag }}
        </span>
        <span *ngIf="!idea.tags || idea.tags.length === 0" class="text-xs text-slate-400">Aucun tag</span>
      </div>

      <div class="flex items-center justify-between border-t border-slate-50 pt-4 mt-auto">
        <div class="flex items-center gap-4 text-sm font-medium">
          <div class="flex items-center gap-1.5 text-slate-700" title="Votes">
             <span class="text-slate-400">👍</span> {{ idea.voteCount || 0 }}
          </div>
          <div class="flex items-center gap-1.5 text-slate-700" title="Feedbacks">
             <span class="text-slate-400">💬</span> {{ idea.feedbackCount || 0 }}
          </div>
        </div>

        <span *ngIf="idea.showStatusBadge !== false" [class]="getStatusClass(idea.status)" class="text-xs font-bold px-2.5 py-1 rounded-full border">
          {{ formatStatus(idea.status) }}
        </span>
      </div>

      <div class="mt-4 flex items-center justify-between" (click)="stop($event)">
        <div class="flex items-center gap-2">
          <button
            class="px-3 py-1.5 rounded-lg text-sm font-semibold border border-slate-200 hover:bg-white transition disabled:opacity-50"
            [disabled]="idea.hasVoted || idea.canView === false"
            (click)="vote.emit({ idea, type: 'UPVOTE' })"
            [class.bg-emerald-50]="idea.hasVoted && idea.votedType === 'UPVOTE'"
            [class.text-emerald-700]="idea.hasVoted && idea.votedType === 'UPVOTE'">
            👍
          </button>
          <button
            class="px-3 py-1.5 rounded-lg text-sm font-semibold border border-slate-200 hover:bg-white transition disabled:opacity-50"
            [disabled]="idea.hasVoted || idea.canView === false"
            (click)="vote.emit({ idea, type: 'DOWNVOTE' })"
            [class.bg-rose-50]="idea.hasVoted && idea.votedType === 'DOWNVOTE'"
            [class.text-rose-600]="idea.hasVoted && idea.votedType === 'DOWNVOTE'">
            👎
          </button>
          <button
            class="px-3 py-1.5 rounded-lg text-sm font-semibold border border-slate-200 hover:bg-white transition"
            (click)="bookmark.emit(idea)">
            {{ idea.isBookmarked ? 'Sauvegarde' : 'Enregistrer' }}
          </button>
          <button
            class="px-3 py-1.5 rounded-lg text-sm font-semibold border border-slate-200 hover:bg-white transition"
            (click)="comments.emit(idea)">
            💬
          </button>
        </div>

        <div class="flex items-center gap-2">
          <button
            class="px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 hover:bg-white transition disabled:opacity-50"
            [disabled]="idea.canView === false"
            (click)="view.emit(idea)">
            Details
          </button>
          <button
            *ngIf="idea.canEdit && idea.status === 'DRAFT'"
            class="px-3 py-1.5 rounded-lg text-xs font-semibold border border-amber-200 text-amber-700 hover:bg-amber-50 transition"
            (click)="edit.emit(idea)">
            Modifier
          </button>
        </div>
      </div>

      <div *ngIf="idea.status === 'DRAFT' && idea.canView === false" class="mt-3 text-xs text-slate-400">
        Brouillon prive
      </div>

      <div *ngIf="idea.status === 'APPROVED'" class="absolute bottom-0 left-0 w-full h-1 bg-green-500"></div>
    </div>
  `
})
export class IdeaCardComponent {
    @Input({ required: true }) idea!: Idea;
    @Output() vote = new EventEmitter<{ idea: Idea; type: VoteKind }>();
    @Output() bookmark = new EventEmitter<Idea>();
    @Output() comments = new EventEmitter<Idea>();
    @Output() view = new EventEmitter<Idea>();
    @Output() edit = new EventEmitter<Idea>();

    getStatusClass(status: IdeaStatus): string {
        switch (status) {
            case IdeaStatus.APPROVED:
                return 'bg-green-50 text-green-700 border-green-200';
            case IdeaStatus.SUBMITTED:
                return 'bg-blue-50 text-blue-700 border-blue-200';
            case IdeaStatus.DRAFT:
                return 'bg-slate-50 text-slate-600 border-slate-200';
            case IdeaStatus.REJECTED:
                return 'bg-red-50 text-red-700 border-red-200';
            case IdeaStatus.UNDER_REVIEW:
                return 'bg-yellow-50 text-yellow-700 border-yellow-200';
            case IdeaStatus.IN_PROGRESS:
                return 'bg-cyan-50 text-cyan-700 border-cyan-200';
            default:
                return 'bg-slate-50 text-slate-600 border-slate-200';
        }
    }

    formatStatus(status: string): string {
        return status.replace('_', ' ');
    }

    formatDate(value: string): string {
        if (!value) {
            return 'Date inconnue';
        }
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) {
            return value;
        }
        return date.toLocaleDateString('fr-FR', { year: 'numeric', month: 'short', day: '2-digit' });
    }

    onView() {
        if (this.idea.canView === false) {
            return;
        }
        this.view.emit(this.idea);
    }

    stop(event: Event) {
        event.stopPropagation();
    }
}
