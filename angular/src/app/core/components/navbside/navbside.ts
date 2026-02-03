
import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { filter, takeUntil, switchMap } from 'rxjs/operators';
import { Subscription, Subject, interval } from 'rxjs';
import { UserProfileService, UserProfile } from '../../../services/user-profile.service';
import { NotificationService, NotificationItem } from '../../../services/notification.service';
import { AuthService as RoleAuthService } from '../../../services/auth.service';
import { AuthService as LoginAuthService } from '../../../core/services/auth.service';

interface BreadcrumbItem {
  label: string;
  url: string;
  active: boolean;
}

@Component({
  selector: 'app-navbside',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbside.html',
  styleUrls: ['./navbside.css']
})
export class Navbside implements OnInit, OnDestroy {
  breadcrumbs: BreadcrumbItem[] = [];
  userProfile: UserProfile = {
    id: 1,
    fullname: 'Utilisateur',
    email: 'user@example.com',
    role: 'User',
    tenantName: 'Organisation',
    avatar: '👤'
  };

  showProfileMenu: boolean = false;
  showNotifications: boolean = false;
  notificationCount: number = 3;
  notifications: NotificationItem[] = [];
  private notificationInterval: any = null;
  userSubscription: Subscription | null = null;
  private sseSubscription: Subscription | null = null;
  private pollingSubscription: Subscription | null = null;
  private notificationsDisabled: boolean = false;
  avatarUrl: string = '';
  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private userProfileService: UserProfileService,
    private notificationService: NotificationService,
    public roleAuthService: RoleAuthService,
    public loginAuthService: LoginAuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadBreadcrumbs();
    this.loadUserProfile();

    // Écouter les changements de rôle pour mettre à jour l'UI
    this.roleAuthService.currentUserRole$.subscribe(() => {
      // Forcer la détection de changement pour mettre à jour l'affichage
      setTimeout(() => {
        this.cdr.markForCheck();
      }, 0);
    });

    // Mettre à jour les breadcrumbs lors de la navigation
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.loadBreadcrumbs();
        // Close menus when navigating
        this.closeMenus();
      });

    // Close menus when clicking outside
    document.addEventListener('click', this.handleDocumentClick.bind(this));
  }

  

  private loadUserProfile(): void {
    // S'abonner aux changements du profil utilisateur
    this.userSubscription = this.userProfileService.currentUser$.subscribe(
      (user: UserProfile | null) => {
        if (user) {
          this.userProfile = {
            ...user,
            avatar: this.getAvatarEmoji(user.role)
          };
          // Priorité: profileImageUrl > avatarUrl > default avatar
          this.avatarUrl = user.profileImageUrl || this.userProfileService.getAvatarUrl(user);
          this.cdr.detectChanges();
          // Notifications are started only when user opens the notifications dropdown.
        }
      }
    );

    // Charger le profil si pas déjà chargé (forcer pour détecter les changements de rôle)
    this.userProfileService.loadUserProfile(true);
  }

  getDefaultAvatar(): string {
    // Générer un avatar basé sur le nom de l'utilisateur
    if (this.userProfile?.fullname) {
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(this.userProfile.fullname)}&background=915506&color=fff&size=150`;
    }
    // Avatar par défaut si pas de nom
    return 'https://ui-avatars.com/api/?name=User&background=915506&color=fff&size=150';
  }

  getAvatarEmoji(role: string): string {
    const emojiMap: { [key: string]: string } = {
      'ADMIN': '👑',
      'MANAGER': '📊',
      'HR': '👥',
      'USER': '👤',
      'EMPLOYEE': '👤',
      'LEAD': '⭐'
    };
    return emojiMap[role?.toUpperCase()] || '👤';
  }

 
  loadBreadcrumbs(): void {
    const url = this.router.url || '/';

    if (!url || url === '/' || url === '') {
      this.breadcrumbs = [{ label: 'Dashboard', url: '/', active: true }];
      return;
    }

    this.generateBreadcrumbs(url);
  }

  generateBreadcrumbs(url: string): void {
    const urlSegments = url.split('/').filter(segment => segment);

    this.breadcrumbs = urlSegments.map((segment, index) => {
      const path = '/' + urlSegments.slice(0, index + 1).join('/');
      const isActive = index === urlSegments.length - 1;

      return {
        label: this.formatLabel(segment),
        url: path,
        active: isActive
      };
    });
  }

  formatLabel(segment: string): string {
    // Convertir le segment d'URL en label lisible
    const labelMap: { [key: string]: string } = {
      'dashboard': 'Dashboard',
      'dash': 'Dashboard',
      'projects': 'Projects',
      'ideas': 'Ideas',
      'analytics': 'Analytics',
      'statistics': 'Statistics',
      'reports': 'Reports',
      'votes': 'Votes',
      'bookmarks': 'Bookmarks',
      'feedback': 'Feedback',
      'profile': 'Profile',
      'manager': 'Manager',
      'auth': 'Authentication',
      'post-registration': 'Registration'
    };
    
    return labelMap[segment.toLowerCase()] || 
      segment.replace(/-/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
  }

  navigateTo(url: string): void {
    if (url) {
      this.router.navigate([url]);
    }
  }

  toggleProfileMenu(): void {
    this.showProfileMenu = !this.showProfileMenu;
    this.showNotifications = false;
  }

  toggleNotifications(): void {
    this.showNotifications = !this.showNotifications;
    this.showProfileMenu = false;
    if (this.showNotifications) {
      // Notifications disabled: do not trigger any backend calls/polling/SSE
      this.notificationCount = 0;
      this.notifications = [];
    }
  }

  startNotificationPolling(): void {
    if (this.notificationsDisabled) return;
    if (this.pollingSubscription) return;
    const userId = this.userProfile?.id;
    if (!userId) return;
    
    // initial fetch
    this.fetchUnreadCount(userId);
    
    // Use RxJS interval for 15 seconds polling
    this.pollingSubscription = interval(15000)
      .pipe(
        switchMap(() => this.notificationService.getUnreadCount(userId)),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (count) => {
          this.notificationCount = Math.max(0, count);
        },
        error: (err) => {
          console.warn('Failed to fetch unread count during polling:', err);
          if (err?.status === 503) {
            this.notificationsDisabled = true;
            this.notificationCount = 0;
            this.stopNotificationPolling();
            this.stopSse();
          }
        }
      });
  }

  startRealtimeUpdates(): void {
    const userId = this.userProfile?.id;
    if (!userId) return;
    if (this.notificationsDisabled) return;
    if (this.sseSubscription) return;
    
    try {
      this.sseSubscription = this.notificationService.listen(userId).subscribe({
        next: (n) => {
          // update count and list in real time
          if (!n.read) {
            this.notificationCount = Math.max(0, (this.notificationCount || 0) + 1);
          }
          this.notifications.unshift(n);
          if (this.notifications.length > 8) {
            this.notifications.pop();
          }
        },
        error: (err) => {
          console.warn('SSE failed, falling back to polling:', err);
          if (err?.status === 503) {
            this.notificationsDisabled = true;
            this.notificationCount = 0;
            this.stopSse();
            this.stopNotificationPolling();
            return;
          }
          this.stopSse();
          this.startNotificationPolling();
        }
      });
    } catch (err) {
      console.warn('SSE initialization failed, using polling:', err);
      this.startNotificationPolling();
    }
  }

  stopSse(): void {
    if (this.sseSubscription) {
      this.sseSubscription.unsubscribe();
      this.sseSubscription = null;
    }
  }

  stopNotificationPolling(): void {
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
      this.pollingSubscription = null;
    }
    if (this.notificationInterval) {
      clearInterval(this.notificationInterval);
      this.notificationInterval = null;
    }
  }

  fetchUnreadCount(userId: number): void {
    if (!userId) return;
    if (this.notificationsDisabled) return;
    
    this.notificationService.getUnreadCount(userId).subscribe({
      next: (count) => {
        this.notificationCount = Math.max(0, count);
      },
      error: (err) => {
        console.warn('Failed to fetch unread count:', err);
        if (err?.status === 503) {
          this.notificationsDisabled = true;
          this.notificationCount = 0;
          this.stopNotificationPolling();
          this.stopSse();
        }
      }
    });
  }

  fetchNotifications(): void {
    const userId = this.userProfile?.id;
    if (!userId) return;
    if (this.notificationsDisabled) return;
    
    this.notificationService.listByUser(userId, 0, 8).subscribe({
      next: (page) => {
        this.notifications = page?.content || [];
      },
      error: (err) => {
        console.warn('Failed to fetch notifications:', err);
        this.notifications = [];
        if (err?.status === 503) {
          this.notificationsDisabled = true;
          this.notificationCount = 0;
          this.stopNotificationPolling();
          this.stopSse();
        }
      }
    });
  }

  openNotification(n: NotificationItem): void {
    if (!n.read) {
      this.notificationService.markAsRead(n.id).subscribe({
        next: () => {
          n.read = true;
          this.notificationCount = Math.max(0, (this.notificationCount || 0) - 1);
        },
        error: (err) => {
          console.warn('Failed to mark notification as read:', err);
        }
      });
    }
    
    // Close menus after opening notification
    this.closeMenus();
  }

  viewAllNotifications(): void {
    this.showNotifications = false;
    // Navigate to bookmarks or notifications page if it exists
    this.router.navigate(['/bookmarks']);
  }

  onLogout(): void {
    // Confirmation optionnelle (commentée pour l'instant)
    // if (!confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
    //   return;
    // }
    
    console.log('Déconnexion en cours...');
    
    // Arrêter tous les abonnements et timers
    this.stopNotificationPolling();
    this.stopSse();
    
    // Fermer les menus
    this.closeMenus();
    
    // Effectuer la déconnexion via le service
    this.loginAuthService.logout();
    
    // Nettoyer le profil utilisateur local
    this.userProfile = {
      id: 1,
      fullname: 'Utilisateur',
      email: 'user@example.com',
      role: 'User',
      tenantName: 'Organisation',
      avatar: '👤'
    };
    this.avatarUrl = '';
    this.notificationCount = 0;
    this.notifications = [];
    
    // Forcer la détection des changements
    this.cdr.detectChanges();
    
    // Naviguer vers la page de login
    this.router.navigate(['/auth']).then(success => {
      if (success) {
        console.log('Déconnexion réussie, redirection vers login');
      } else {
        console.error('Échec de la redirection vers login');
        // En cas d'échec, essayer avec window.location
        window.location.href = '/auth';
      }
    });
  }

  onProfile(): void {
    console.log('Voir le profil');
    this.showProfileMenu = false;
    this.router.navigate(['/profile']);
  }

  onSettings(): void {
    console.log('Paramètres');
    this.showProfileMenu = false;
    this.router.navigate(['/profile']);
  }

  handleDocumentClick(event: Event): void {
    const target = event.target as Element;
    if (!target.closest('.navbar-actions')) {
      this.closeMenus();
    }
  }

  closeMenus(): void {
    this.showProfileMenu = false;
    this.showNotifications = false;
  }

  // Helper methods for template access
  get hasOrganization(): boolean {
    const tenantId = localStorage.getItem('tenantId');
    return !!(this.userProfile?.tenantName || (tenantId && tenantId !== '1'));
  }

  get isIndividualUser(): boolean {
    const tenantId = localStorage.getItem('tenantId');
    return !this.userProfile?.tenantName && (!tenantId || tenantId === '1');
  }

  ngOnDestroy(): void {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
    this.stopNotificationPolling();
    this.stopSse();
    this.destroy$.next();
    this.destroy$.complete();
    document.removeEventListener('click', this.handleDocumentClick.bind(this));
  }
}
