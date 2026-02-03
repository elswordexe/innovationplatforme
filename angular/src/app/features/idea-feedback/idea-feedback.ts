import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IdeaService } from '../../services/idea';
import { UserProfileService, UserProfile } from '../../services/user-profile.service';
import { Sidebar } from '../../core/components/sidebar/sidebar';
import { Navbside } from '../../core/components/navbside/navbside';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

interface Feedback {
  id: number;
  author: string;
  avatar: string;
  content: string;
  date: string;
  rating: number;
}

interface IdeaWithFeedback {
  id: number;
  title: string;
  description: string;
  status: string;
  creationDate: string;
  voteCount: number;
  feedbacks: Feedback[];
  hasNewFeedback?: boolean;
  image?: string; // Added for placeholder support
}

@Component({
  selector: 'app-idea-feedback',
  standalone: true,
  imports: [CommonModule, FormsModule, Sidebar, Navbside],
  templateUrl: './idea-feedback.html',
  styleUrls: ['./idea-feedback.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IdeaFeedback implements OnInit, OnDestroy {
  ideas: IdeaWithFeedback[] = [];
  filteredIdeas: IdeaWithFeedback[] = [];
  selectedIdea: IdeaWithFeedback | null = null;
  loading = true;
  error = false;
  currentUserId: number | null = null;
  currentUserName: string = '';
  currentUser: UserProfile | null = null;
  
  filterStatus: string = 'all';
  searchTerm: string = '';
  sortBy: string = 'feedback-count';
  
  private subscriptions = new Subscription();

  statusConfig: { [key: string]: { color: string; label: string; icon: string } } = {
    'PENDING': { color: '#FFA500', label: 'En attente', icon: '⏳' },
    'APPROVED': { color: '#4CAF50', label: 'Approuvée', icon: '✅' },
    'REJECTED': { color: '#F44336', label: 'Rejetée', icon: '❌' },
    'IN_PROGRESS': { color: '#2196F3', label: 'En cours', icon: '🔄' },
    'COMPLETED': { color: '#8BC34A', label: 'Complétée', icon: '🎉' }
  };

  constructor(
    private ideaService: IdeaService,
    private userProfileService: UserProfileService,
    public router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.currentUserId = parseInt(localStorage.getItem('userId') || '0', 10);
    this.loadUserProfile();
    this.loadMyIdeas();
  }

  private loadUserProfile(): void {
    const user = this.userProfileService.getCurrentUser();
    if (user) {
      this.currentUserName = user.fullname || 'Utilisateur';
      this.currentUser = user;
    } else {
      this.currentUserName = 'Utilisateur';
      this.currentUser = null;
    }
    this.cdr.markForCheck();
  }

  private loadMyIdeas(): void {
    this.loading = true;
    this.error = false;

    // Use organization-based filtering
    this.ideaService.getIdeasForCurrentUser().pipe(take(1)).subscribe({
      next: (ideas: any[]) => {
        // Check if user has organization
        const tenantId = localStorage.getItem('tenantId');
        if ((!tenantId || tenantId === '1') && ideas.length === 0) {
          // Individual user without organization - show empty state
          this.ideas = [];
          this.applyFilters();
          this.loading = false;
          this.cdr.markForCheck();
          console.log('[DEBUG Feedback] Individual user without organization - empty state');
          return;
        }

        // Filtrer les idées de l'utilisateur courant
        this.ideas = ideas
          .filter(idea => idea.creatorId === this.currentUserId)
          .map(idea => ({
            id: idea.id,
            title: idea.title,
            description: idea.description,
            status: idea.status || 'PENDING',
            creationDate: new Date(idea.creationDate).toLocaleDateString(),
            voteCount: idea.voteCount || 0,
            feedbacks: idea.feedbacks || [],
            hasNewFeedback: false
          }));

        this.applyFilters();
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err: any) => {
        console.error('Erreur chargement des idées', err);
        this.error = true;
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  applyFilters(): void {
    let filtered = [...this.ideas];

    // Filtre par statut
    if (this.filterStatus !== 'all') {
      filtered = filtered.filter(idea => idea.status === this.filterStatus);
    }

    // Filtre par recherche
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(idea =>
        idea.title.toLowerCase().includes(term) ||
        idea.description.toLowerCase().includes(term)
      );
    }

    // Tri
    if (this.sortBy === 'recent') {
      filtered.sort((a, b) => new Date(b.creationDate).getTime() - new Date(a.creationDate).getTime());
    } else if (this.sortBy === 'votes') {
      filtered.sort((a, b) => b.voteCount - a.voteCount);
    } else if (this.sortBy === 'feedback-count') {
      filtered.sort((a, b) => b.feedbacks.length - a.feedbacks.length);
    }

    this.filteredIdeas = filtered;
    this.cdr.markForCheck();
  }

  selectIdea(idea: IdeaWithFeedback): void {
    this.selectedIdea = idea;
    idea.hasNewFeedback = false;
    this.cdr.markForCheck();
  }

  closeDetail(): void {
    this.selectedIdea = null;
    this.cdr.markForCheck();
  }

  getRatingStars(rating: number): string {
    return '⭐'.repeat(rating);
  }

  getStatusColor(status: string): string {
    return this.statusConfig[status]?.color || '#999';
  }

  getStatusLabel(status: string): string {
    return this.statusConfig[status]?.label || status;
  }

  getStatusIcon(status: string): string {
    return this.statusConfig[status]?.icon || '📌';
  }

  navigateToIdea(ideaId: number): void {
    this.router.navigate(['/idea', ideaId]);
  }

  // Helper methods for template access
  get hasOrganization(): boolean {
    const tenantId = localStorage.getItem('tenantId');
    return !!(this.currentUser?.tenantName || (tenantId && tenantId !== '1'));
  }

  get isIndividualUser(): boolean {
    const tenantId = localStorage.getItem('tenantId');
    return !this.currentUser?.tenantName && (!tenantId || tenantId === '1');
  }

  navigateToJoin(): void {
    this.router.navigate(['/post-registration']);
  }

  // Image placeholder methods
  getPlaceholderImage(title?: string): string {
    // Generate a placeholder based on category
    if (title) {
      const category = this.getCategoryFromTitle(title);
      return this.getTechImageUrl(category, title);
    }
    
    // Fallback to a generic placeholder
    return 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=400&h=200&fit=crop';
  }

  getTechImageUrl(category: string, title: string): string {
    // Use specific technology image URLs that are more likely to return tech images
    const techUrls: { [key: string]: string } = {
      'cloud': 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=400&h=200&fit=crop',
      'network': 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&h=200&fit=crop',
      'data': 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=200&fit=crop',
      'ai': 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=200&fit=crop',
      'security': 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&h=200&fit=crop',
      'mobile': 'https://images.unsplash.com/photo-1511707171634-824ae1b704d3?w=400&h=200&fit=crop',
      'digital': 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=200&fit=crop',
      'default': 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=400&h=200&fit=crop'
    };
    
    return techUrls[category] || techUrls['default'];
  }

  getCategoryFromTitle(title: string): string {
    const lowerTitle = title.toLowerCase();
    
    // Cloud-related keywords
    if (lowerTitle.includes('cloud') || lowerTitle.includes('saas') || lowerTitle.includes('azure') || 
        lowerTitle.includes('aws') || lowerTitle.includes('gcp') || lowerTitle.includes('migration')) {
      return 'cloud';
    }
    
    // Network-related keywords
    if (lowerTitle.includes('network') || lowerTitle.includes('réseau') || lowerTitle.includes('connectivity') ||
        lowerTitle.includes('infrastructure') || lowerTitle.includes('vpn') || lowerTitle.includes('firewall')) {
      return 'network';
    }
    
    // Data-related keywords
    if (lowerTitle.includes('data') || lowerTitle.includes('analytics') || lowerTitle.includes('database') ||
        lowerTitle.includes('big data') || lowerTitle.includes('bi') || lowerTitle.includes('dashboard')) {
      return 'data';
    }
    
    // AI/ML-related keywords
    if (lowerTitle.includes('ai') || lowerTitle.includes('intelligence') || lowerTitle.includes('machine learning') ||
        lowerTitle.includes('ml') || lowerTitle.includes('automated') || lowerTitle.includes('smart')) {
      return 'ai';
    }
    
    // Security-related keywords
    if (lowerTitle.includes('security') || lowerTitle.includes('sécurité') || lowerTitle.includes('cyber') ||
        lowerTitle.includes('protection') || lowerTitle.includes('authentification')) {
      return 'security';
    }
    
    // Mobile-related keywords
    if (lowerTitle.includes('mobile') || lowerTitle.includes('app') || lowerTitle.includes('ios') ||
        lowerTitle.includes('android') || lowerTitle.includes('tablet')) {
      return 'mobile';
    }
    
    // Digital transformation keywords
    if (lowerTitle.includes('digital') || lowerTitle.includes('transformation') || lowerTitle.includes('innovation') ||
        lowerTitle.includes('modernization') || lowerTitle.includes('automation')) {
      return 'digital';
    }
    
    // Default category
    return 'technology';
  }

  onImageError(event: any): void {
    // Fallback to a generic technology placeholder if the generated one fails
    event.target.src = 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=400&h=200&fit=crop';
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
