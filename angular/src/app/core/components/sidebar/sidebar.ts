import { Component } from '@angular/core';
import {Router, RouterLink, RouterLinkActive} from '@angular/router';
import {NgIf} from '@angular/common';

@Component({
  selector: 'app-sidebar',
  imports: [
    NgIf,
    RouterLinkActive,
    RouterLink
  ],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {

  sidebarOpen = true; // variable pour afficher/masquer le sidebar
  analyticsOpen = false; // pour le sous-menu Analytics

  // toggle pour le menu complet
  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  // toggle pour Analytics
  toggleAnalytics() {
    this.analyticsOpen = !this.analyticsOpen;
  }
}
