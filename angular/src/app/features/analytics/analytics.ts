import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { Sidebar } from '../../core/components/sidebar/sidebar';
import { Navbside } from '../../core/components/navbside/navbside';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, Sidebar, Navbside],
  templateUrl: './analytics.html',
  styleUrl: './analytics.css',
})
export class AnalyticsComponent {}
