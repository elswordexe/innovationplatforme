import { Component, ViewEncapsulation } from '@angular/core';
import { Router, NavigationEnd, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../../services/auth.service';

@Component({
  standalone: true,
  selector: 'app-sidebar',
  imports: [RouterLink, CommonModule],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.css'],
  encapsulation: ViewEncapsulation.Emulated,
})
export class Sidebar {
  currentUrl: string = '/';
  isVotesAndFeedbackExpanded: boolean = false;
  managerAccess: boolean = false;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {
    this.currentUrl = this.router.url || '/';

    // Keep a stable boolean for the template to avoid ExpressionChangedAfterItHasBeenCheckedError
    this.authService.currentUserRole$.subscribe(() => {
      // Defer to next macrotask so it doesn't flip during the same change detection pass
      setTimeout(() => {
        this.managerAccess = this.authService.hasManagerAccess();
      }, 0);
    });

    // Initial value
    this.managerAccess = this.authService.hasManagerAccess();

    this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe((e: any) => {
      this.currentUrl = e.urlAfterRedirects || e.url;
      // Auto-expand Votes & Feedback menu if on votes or feedbacks
      this.isVotesAndFeedbackExpanded = this.isVotesAndFeedbackActive();
    });
  }

  isActive(path: string): boolean {
    if (!path) return false;
    if (path === '/') return this.currentUrl === '/' || this.currentUrl === '';
    return this.currentUrl === path || this.currentUrl.startsWith(path + '/') || this.currentUrl === path;
  }

  isVotesAndFeedbackActive(): boolean {
    return this.isActive('/votes') || this.isActive('/feedback') || this.isActive('/feedbacks');
  }

  toggleVotesAndFeedback(): void {
    this.isVotesAndFeedbackExpanded = !this.isVotesAndFeedbackExpanded;
  }
}