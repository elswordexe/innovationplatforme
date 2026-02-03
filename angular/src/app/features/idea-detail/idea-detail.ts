import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IdeaService, Comment, Attachment } from '../../services/idea';
import { UserProfileService, UserProfile } from '../../services/user-profile.service';
import { Subscription, Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-idea-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  templateUrl: './idea-detail.html',
  styleUrls: ['./idea-detail.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IdeaDetail implements OnInit, OnDestroy {
  idea: any = null;
  comments: Comment[] = [];
  newComment: string = '';
  loading = true;
  error = false;
  isSubmittingComment = false;
  commentSubmitError = '';
  currentUser: UserProfile | null = null;
  private subscriptions = new Subscription();
  private destroy$ = new Subject<void>();

  constructor(
    private ideaService: IdeaService,
    private userProfileService: UserProfileService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Load current user
    this.userProfileService.currentUser$.pipe(takeUntil(this.destroy$)).subscribe(user => {
      this.currentUser = user;
      this.cdr.markForCheck();
    });

    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      const ideaId = parseInt(params['id'], 10);
      if (ideaId && !this.idea) {
        this.loadIdea(ideaId);
      }
    });
  }

  loadIdea(ideaId: number): void {
    this.loading = true;
    this.error = false;
    
    this.ideaService.getIdeaById(ideaId).pipe(take(1)).subscribe({
      next: (idea: any) => {
        console.log('[DEBUG IdeaDetail] Loaded idea:', idea);
        
        // Process image and attachments separately
        let mainImage = this.getPlaceholderImage();
        let attachments: any[] = [];
        
        // Check if idea has a main image in coverImageUrl field
        if (idea.coverImageUrl) {
          mainImage = idea.coverImageUrl;
        } else if (idea.image) {
          // Handle base64 image data
          if (typeof idea.image === 'string' && idea.image.startsWith('data:')) {
            mainImage = idea.image;
          } else if (idea.image && idea.image.dataBase64) {
            mainImage = `data:${idea.image.fileType};base64,${idea.image.dataBase64}`;
          }
        } else if (idea.attachments && idea.attachments.length > 0) {
          // Find the first image attachment as cover image
          const imageAttachment = idea.attachments.find((att: any) => 
            att.fileType && att.fileType.startsWith('image/')
          );
          if (imageAttachment) {
            if (imageAttachment.data) {
              mainImage = imageAttachment.data;
            } else if (imageAttachment.fileUrl) {
              // Use public endpoint for testing (remove auth for now)
              const attachmentId = imageAttachment.fileUrl.split('/').pop(); // Extract ID from /api/ideas/attachments/1/download
              mainImage = `http://localhost:8080/api/ideas/attachments/${attachmentId}/download-public`;
              console.log('[DEBUG IdeaDetail] Using public endpoint, URL:', mainImage);
            }
          }
        }
        
        // Load attachments from backend
        this.loadAttachments(ideaId);
        
        this.idea = {
          ...idea,
          image: mainImage,
          attachments: idea.attachments || [],
          details: {
            dateCreated: new Date(idea.creationDate).toLocaleDateString(),
            status: idea.status || 'En attente',
            category: idea.category || 'Général',
            votes: idea.voteCount || 0
          }
        };
        this.loadComments(ideaId);
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err: any) => {
        console.error('Erreur chargement idée', err);
        this.error = true;
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  private loadAttachments(ideaId: number): void {
    this.ideaService.getAttachmentsByIdeaId(ideaId).pipe(take(1)).subscribe({
      next: (attachments: Attachment[]) => {
        console.log('[DEBUG IdeaDetail] Loaded attachments:', attachments);
        if (attachments && attachments.length > 0) {
          // Filter out the cover image from attachments list
          const filteredAttachments = attachments.filter((att: any) => {
            // Exclude if it's an image and likely the cover image
            const isImage = att.fileType && att.fileType.startsWith('image/');
            const hasCoverImageName = att.fileName && att.fileName.includes('idea_image_');
            return !(isImage && hasCoverImageName);
          });
          
          // Process attachments for display
          const processedAttachments = filteredAttachments.map((att: any) => ({
            ...att,
            downloadUrl: this.getAttachmentDownloadUrl(att)
          }));
          this.idea.attachments = processedAttachments;
        }
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.warn('Failed to load attachments:', err);
        // Check if idea already has attachments in the main idea object
        if (this.idea.attachments && this.idea.attachments.length > 0) {
          console.log('[DEBUG IdeaDetail] Using attachments from idea object:', this.idea.attachments);
          
          // Filter out the cover image from attachments list
          const filteredAttachments = this.idea.attachments.filter((att: any) => {
            const isImage = att.fileType && att.fileType.startsWith('image/');
            const hasCoverImageName = att.fileName && att.fileName.includes('idea_image_');
            return !(isImage && hasCoverImageName);
          });
          
          // Process existing attachments
          const processedAttachments = filteredAttachments.map((att: any) => ({
            ...att,
            downloadUrl: this.getAttachmentDownloadUrl(att)
          }));
          this.idea.attachments = processedAttachments;
        } else {
          // Keep empty attachments array
          this.idea.attachments = [];
        }
        this.cdr.markForCheck();
      }
    });
  }

  private getAttachmentDownloadUrl(attachment: any): string {
    if (attachment.data) {
      // If attachment has base64 data
      return attachment.data;
    } else if (attachment.fileUrl) {
      // Add authentication parameters for download links
      const userId = localStorage.getItem('userId') || '1';
      const tenantId = localStorage.getItem('tenantId') || '1';
      return `http://localhost:8080${attachment.fileUrl}?userId=${userId}&tenantId=${tenantId}`;
    } else if (attachment.fileName) {
      // Create download URL from backend with auth params
      const userId = localStorage.getItem('userId') || '1';
      const tenantId = localStorage.getItem('tenantId') || '1';
      return `http://localhost:8080/api/ideas/download/${attachment.fileName}?userId=${userId}&tenantId=${tenantId}`;
    }
    return '#';
  }

  getFileIcon(fileName: string): string {
    const extension = fileName.split('.').pop()?.toLowerCase();
    const iconMap: { [key: string]: string } = {
      'pdf': '📄',
      'doc': '📝',
      'docx': '📝',
      'xls': '📊',
      'xlsx': '📊',
      'ppt': '📈',
      'pptx': '📈',
      'txt': '📃',
      'jpg': '🖼️',
      'jpeg': '🖼️',
      'png': '🖼️',
      'gif': '🖼️',
      'svg': '🎨',
      'zip': '📦',
      'rar': '📦',
      'mp4': '🎬',
      'avi': '🎬',
      'mp3': '🎵',
      'wav': '🎵'
    };
    return iconMap[extension || ''] || '📄';
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  downloadAttachment(attachment: Attachment): void {
    const downloadUrl = this.getAttachmentDownloadUrl(attachment);
    if (downloadUrl && downloadUrl !== '#') {
      // Create a temporary link to trigger download
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = attachment.fileName || 'attachment';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      console.error('Cannot download attachment: no valid URL');
    }
  }

  goBack(): void {
    this.router.navigate(['/dash']);
  }

  getPlaceholderImage(title?: string): string {
    // If title is provided, generate a placeholder based on category
    if (title) {
      const category = this.getCategoryFromTitle(title);
      return this.getTechImageUrl(category, title);
    }
    
    // Return a simple SVG placeholder that doesn't require network access
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="400">
      <rect width="800" height="400" fill="#e0e0e0"/>
      <text x="50%" y="50%" text-anchor="middle" dy=".3em" font-family="Arial, sans-serif" font-size="24" fill="#666">
        Image non disponible
      </text>
    </svg>`;
    
    // Use Unicode-safe base64 encoding
    return 'data:image/svg+xml;base64,' + this.btoaUnicode(svg);
  }

  getTechImageUrl(category: string, title: string): string {
    // Use specific technology image URLs that are more likely to return tech images
    const techUrls: { [key: string]: string } = {
      'cloud': 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&h=400&fit=crop',
      'network': 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&h=400&fit=crop',
      'data': 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=400&fit=crop',
      'ai': 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=400&fit=crop',
      'security': 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&h=400&fit=crop',
      'mobile': 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&h=400&fit=crop',
      'digital': 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=400&fit=crop',
      'default': 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=800&h=400&fit=crop'
    };
    
    return techUrls[category] || techUrls['default'];
  }

  getTechSeedForCategory(category: string, title: string): string {
    const titleHash = title.toLowerCase().replace(/\s+/g, '-').substring(0, 15);
    
    switch (category) {
      case 'cloud':
        return `technology-cloud-server-${titleHash}`;
      case 'network':
        return `technology-network-datacenter-${titleHash}`;
      case 'data':
        return `technology-data-database-${titleHash}`;
      case 'ai':
        return `technology-ai-robot-${titleHash}`;
      case 'security':
        return `technology-security-shield-${titleHash}`;
      case 'mobile':
        return `technology-mobile-smartphone-${titleHash}`;
      case 'digital':
        return `technology-digital-circuit-${titleHash}`;
      default:
        return `technology-computer-code-${titleHash}`;
    }
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

  loadComments(ideaId: number): void {
    this.ideaService.getCommentsByIdeaId(ideaId).pipe(take(1)).subscribe({
      next: (comments: Comment[]) => {
        this.comments = comments;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.warn('Failed to load comments from backend, using fallback:', err);
        // Fallback to mock comments if backend fails
        this.comments = [
          {
            id: 1,
            ideaId: ideaId,
            authorId: 1,
            authorName: 'Jean Dupont',
            authorAvatar: '👨',
            content: 'Excellente idée ! Je pense que cela pourrait vraiment améliorer notre processus.',
            createdAt: new Date().toISOString(),
            likes: 3
          },
          {
            id: 2,
            ideaId: ideaId,
            authorId: 2,
            authorName: 'Marie Martin',
            authorAvatar: '👩',
            content: 'Intéressant, mais il faudrait considérer les coûts d\'implémentation.',
            createdAt: new Date().toISOString(),
            likes: 1
          }
        ];
        this.cdr.markForCheck();
      }
    });
  }

  addComment(): void {
    if (!this.newComment.trim() || !this.idea || !this.currentUser) return;

    this.isSubmittingComment = true;
    this.commentSubmitError = '';

    this.ideaService.addComment(
      this.idea.id,
      this.newComment,
      this.currentUser.id,
      this.currentUser.fullname
    ).pipe(take(1)).subscribe({
      next: (newComment: Comment) => {
        // Add the new comment to the list with formatted date
        this.comments.unshift(newComment);
        this.newComment = '';
        this.isSubmittingComment = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Failed to add comment:', err);
        this.commentSubmitError = 'Erreur lors de l\'ajout du commentaire. Veuillez réessayer.';
        this.isSubmittingComment = false;
        this.cdr.markForCheck();
      }
    });
  }

  likeComment(commentId: number): void {
    const comment = this.comments.find(c => c.id === commentId);
    if (!comment || !this.currentUser) return;

    this.ideaService.toggleCommentLike(
      commentId,
      this.currentUser.id
    ).pipe(take(1)).subscribe({
      next: (response) => {
        comment.likes = response.likes;
        comment.isLiked = response.isLiked;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Failed to like comment:', err);
        // Fallback: toggle locally
        comment.likes = comment.isLiked ? comment.likes - 1 : comment.likes + 1;
        comment.isLiked = !comment.isLiked;
        this.cdr.markForCheck();
      }
    });
  }

  btoaUnicode(str: string): string {
    // Unicode-safe base64 encoding
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (match, p1) => {
      return String.fromCharCode(parseInt(p1, 16));
    }));
  }

  onImageError(event: any): void {
    // Fallback to a generic technology placeholder if the generated one fails
    event.target.src = 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=800&h=400&fit=crop';
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    this.destroy$.next();
    this.destroy$.complete();
  }
}
