
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

interface BreadcrumbItem {
  label: string;
  url: string;
  active: boolean;
}

interface UserProfile {
  name: string;
  avatar: string;
  role: string;
}

@Component({
  selector: 'app-nearside',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbside.html',
  styleUrls: ['./navbside.css']
})
export class Navbside implements OnInit {
  breadcrumbs: BreadcrumbItem[] = [];
  userProfile: UserProfile = {
    name: 'IBRAHIM AT',
    avatar: '👤',
    role: 'Admin'
  };

  showProfileMenu: boolean = false;
  showNotifications: boolean = false;
  notificationCount: number = 3;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.loadBreadcrumbs();

    // Mettre à jour les breadcrumbs lors de la navigation
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.loadBreadcrumbs();
      });
  }

  loadBreadcrumbs(): void {
    // Exemple de breadcrumbs - À adapter selon votre routing
    const url = this.router.url;

    this.breadcrumbs = [
      { label: 'All Projects', url: '/projects', active: false },
      { label: 'Company name', url: '/company', active: false },
      { label: 'Project 1', url: '/project/1', active: true }
    ];

    // Vous pouvez aussi générer dynamiquement selon l'URL
    // this.generateBreadcrumbs(url);
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
    return segment
      .replace(/-/g, ' ')
      .replace(/\b\w/g, char => char.toUpperCase());
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
  }

  onLogout(): void {
    console.log('Déconnexion');
    // Logique de déconnexion
  }

  onProfile(): void {
    console.log('Voir le profil');
    this.showProfileMenu = false;
    this.router.navigate(['/profile']);
  }

  onSettings(): void {
    console.log('Paramètres');
    this.showProfileMenu = false;
    this.router.navigate(['/settings']);
  }

  closeMenus(): void {
    this.showProfileMenu = false;
    this.showNotifications = false;
  }
}
