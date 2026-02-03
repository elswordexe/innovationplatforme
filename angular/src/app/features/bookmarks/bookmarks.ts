import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookmarkedIdeaCardComponent } from './bookmarked-idea-card.component';
import { Sidebar } from '../../core/components/sidebar/sidebar';
import { Navbside } from '../../core/components/navbside/navbside';
import { Toolbar } from '../../core/components/toolbar/toolbar';
import { Idea } from '../../core/models/idea';
import { IdeaService } from '../../services/idea';
import { BookmarkService } from '../../services/bookmark.service';
import { timeout, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-bookmarks',
  standalone: true,
  imports: [CommonModule, BookmarkedIdeaCardComponent, Sidebar, Navbside, Toolbar],
  templateUrl: './bookmarks.html',
  styleUrls: ['./bookmarks.css']
})
export class Bookmarks implements OnInit {
  bookmarkedIdeas: Idea[] = [];
  isLoading = true;
  error: string | null = null;
  currentUserId = 1; // À remplacer par une vraie récupération de l'utilisateur connecté

  constructor(
    private ideaService: IdeaService,
    private bookmarkService: BookmarkService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadBookmarkedIdeas();
  }

  loadBookmarkedIdeas(): void {
    console.log('[DEBUG Bookmarks] Starting loadBookmarkedIdeas');
    this.isLoading = true;
    this.error = null;

    // Récupérer les bookmarks de l'utilisateur
    this.bookmarkService.getMyBookmarks(this.currentUserId).pipe(
      timeout(5000),
      catchError(err => {
        console.warn('[DEBUG Bookmarks] Error loading bookmarks:', err);
        return of([]);
      })
    ).subscribe({
      next: (bookmarks: any[]) => {
        console.log('[DEBUG Bookmarks] Bookmarks loaded:', bookmarks.length);
        // Récupérer les détails de chaque idée bookmarkée
        const ideaIds = bookmarks.map(b => b.ideaId);
        
        if (ideaIds.length === 0) {
          this.bookmarkedIdeas = [];
          this.isLoading = false;
          this.cdr.detectChanges();
          console.log('[DEBUG Bookmarks] No bookmarks, set isLoading to FALSE');
          return;
        }

        // Charger les détails des idées
        this.ideaService.getAllIdeas().pipe(
          timeout(10000),
          catchError(err => {
            console.warn('[DEBUG Bookmarks] Error loading ideas:', err);
            return of([]);
          })
        ).subscribe({
          next: (ideas: any[]) => {
            this.bookmarkedIdeas = ideas.filter(idea => ideaIds.includes(idea.id));
            this.isLoading = false;
            this.cdr.detectChanges();
            console.log('[DEBUG Bookmarks] Loaded', this.bookmarkedIdeas.length, 'bookmarked ideas, set isLoading to FALSE');
          },
          error: (err) => {
            this.error = 'Erreur lors du chargement des idées';
            console.error('[DEBUG Bookmarks] Error:', err);
            this.isLoading = false;
            this.cdr.detectChanges();
          }
        });
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement des bookmarks';
        console.error('[DEBUG Bookmarks] Error:', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }
}
