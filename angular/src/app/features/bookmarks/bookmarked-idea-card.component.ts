import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Idea } from '../../core/models/idea';

@Component({
  selector: 'app-bookmarked-idea-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './bookmarked-idea-card.component.html',
  styleUrls: ['./bookmarked-idea-card.component.css']
})
export class BookmarkedIdeaCardComponent {
  @Input({ required: true }) idea!: Idea;

  get formattedDate(): string {
    return new Date(this.idea.creationDate).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  // Image placeholder methods
  getPlaceholderImage(title?: string): string {
    // Generate a placeholder based on category
    if (title) {
      const category = this.getCategoryFromTitle(title);
      return this.getTechImageUrl(category, title);
    }
    
    // Fallback to a generic placeholder
    return 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=400&h=250&fit=crop';
  }

  getTechImageUrl(category: string, title: string): string {
    // Use specific technology image URLs that are more likely to return tech images
    const techUrls: { [key: string]: string } = {
      'cloud': 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=400&h=250&fit=crop',
      'network': 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&h=250&fit=crop',
      'data': 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=250&fit=crop',
      'ai': 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=250&fit=crop',
      'security': 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&h=250&fit=crop',
      'mobile': 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=250&fit=crop',
      'digital': 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=250&fit=crop',
      'default': 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=400&h=250&fit=crop'
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

  onImageError(event: any): void {
    // Fallback to a generic technology placeholder if the generated one fails
    event.target.src = 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=400&h=250&fit=crop';
  }
}
