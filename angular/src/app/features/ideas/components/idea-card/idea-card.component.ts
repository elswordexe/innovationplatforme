import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

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
    selector: 'app-idea-card',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div
      class="bg-white rounded-xl shadow-sm border border-slate-100 p-6 hover:shadow-md transition-shadow duration-300 h-full flex flex-col relative overflow-hidden group cursor-pointer"
      (click)="onView()">
      
      <div class="flex items-start gap-4 mb-4">
        <div class="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-xl shrink-0">
          💡
        </div>
        
        <div class="min-w-0 flex-1">
          <h3 class="font-bold text-lg text-slate-800 leading-tight mb-1 truncate group-hover:text-[#915506] transition-colors">
            {{ idea.title }}
          </h3>
          <div class="text-xs text-slate-500 flex flex-wrap items-center gap-2">
            <span>👤 {{ idea.author || 'Utilisateur' }}</span>
            <span class="w-1 h-1 rounded-full bg-slate-300"></span>
            <span>{{ idea.date }}</span>
          </div>
        </div>
      </div>

      <p class="text-sm text-slate-600 mb-4 line-clamp-2 flex-grow">
        {{ idea.description }}
      </p>

      <div class="flex flex-wrap gap-2 mb-4">
        <span class="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
          {{ idea.category || 'Général' }}
        </span>
      </div>

      <div class="flex items-center justify-between border-t border-slate-50 pt-4 mt-auto">
        <div class="flex items-center gap-4 text-sm font-medium">
          <div class="flex items-center gap-1.5 text-slate-700" title="Votes">
             <span class="text-slate-400">👍</span> {{ idea.votesCount || 0 }}
          </div>
          <div class="flex items-center gap-1.5 text-slate-700" title="Feedbacks">
             <span class="text-slate-400">💬</span> {{ idea.commentsCount || 0 }}
          </div>
        </div>

        <span *ngIf="idea.status" [class]="getStatusClass(idea.status)" class="text-xs font-bold px-2.5 py-1 rounded-full border">
          {{ formatStatus(idea.status) }}
        </span>
      </div>

      <div class="mt-4 flex items-center justify-between" (click)="stop($event)">
        <div class="flex items-center gap-2">
          <button
            class="px-3 py-1.5 rounded-lg text-sm font-semibold border border-slate-200 hover:bg-white transition disabled:opacity-50"
            [disabled]="idea.hasVoted"
            (click)="vote.emit({ idea, type: 'UPVOTE' })"
            [class.bg-emerald-50]="idea.hasVoted"
            [class.text-emerald-700]="idea.hasVoted">
            👍
          </button>
          <button
            class="px-3 py-1.5 rounded-lg text-sm font-semibold border border-slate-200 hover:bg-white transition"
            (click)="bookmark.emit(idea)">
            {{ idea.isBookmarked ? 'Sauvegardé' : 'Enregistrer' }}
          </button>
          <button
            class="px-3 py-1.5 rounded-lg text-sm font-semibold border border-slate-200 hover:bg-white transition"
            (click)="comments.emit(idea)">
            💬
          </button>
        </div>

        <div class="flex items-center gap-2">
          <button
            class="px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 hover:bg-white transition"
            (click)="view.emit(idea)">
            Détails
          </button>
        </div>
      </div>

      <div *ngIf="idea.status === 'APPROVED'" class="absolute bottom-0 left-0 w-full h-1 bg-green-500"></div>
    </div>
  `
})
export class IdeaCardComponent {
    @Input({ required: true }) idea!: IdeaFrontend;
    @Output() vote = new EventEmitter<{ idea: IdeaFrontend; type: string }>();
    @Output() bookmark = new EventEmitter<IdeaFrontend>();
    @Output() comments = new EventEmitter<IdeaFrontend>();
    @Output() view = new EventEmitter<IdeaFrontend>();
    @Output() edit = new EventEmitter<IdeaFrontend>();

    getStatusClass(status?: string): string {
        if (!status) return 'bg-slate-50 text-slate-600 border-slate-200';
        
        switch (status.toUpperCase()) {
            case 'APPROVED':
                return 'bg-green-50 text-green-700 border-green-200';
            case 'SUBMITTED':
                return 'bg-blue-50 text-blue-700 border-blue-200';
            case 'DRAFT':
                return 'bg-slate-50 text-slate-600 border-slate-200';
            case 'REJECTED':
                return 'bg-red-50 text-red-700 border-red-200';
            case 'UNDER_REVIEW':
                return 'bg-yellow-50 text-yellow-700 border-yellow-200';
            case 'IN_PROGRESS':
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
        this.view.emit(this.idea);
    }

    stop(event: Event) {
        event.stopPropagation();
    }
}
