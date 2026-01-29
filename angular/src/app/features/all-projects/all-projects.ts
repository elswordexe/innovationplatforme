import { Component, OnInit } from '@angular/core';
import {NgClass, NgForOf, NgIf} from '@angular/common';
import {Sidebar} from '../../core/components/sidebar/sidebar';
import {Navbside} from '../../core/components/navbside/navbside';


interface Project {
  id: number;
  title: string;
  description: string;
  status: string;
  progress: number;
  ideasCount: number;
  votesCount: number;
  feedbacksCount: number;
  icon: string;
}

@Component({
  selector: 'app-all-projects',
  templateUrl: './all-projects.html',
  imports: [
    NgClass,
    NgForOf,
    Sidebar,
    Navbside,
    NgIf
  ],
  styleUrls: ['./all-projects.css']
})
export class AllProjects implements OnInit {
  projects: Project[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 5;
  totalItems: number = 52;

  // ✅ Mode de vue : grid par défaut
  viewMode: 'grid' | 'table' = 'grid';

  constructor() {}

  ngOnInit(): void {
    this.loadProjects();
  }

  loadProjects(): void {
    // Données statiques (déjà présentes)
    this.projects = [
      { id: 1, title: 'Innovation IA 2025', description: 'solutions basées sur l\'intelligence artificielle pour automatiser les processus internes.', status: 'Approuvée', progress: 70, ideasCount: 6, votesCount: 19, feedbacksCount: 9, icon: '🌐' },
      { id: 2, title: 'Transformation Digitale', description: 'Modernisation des systèmes legacy et migration vers le cloud pour améliorer la performance.', status: 'Approuvée', progress: 85, ideasCount: 12, votesCount: 34, feedbacksCount: 15, icon: '🚀' },
      { id: 3, title: 'Expérience Client 360', description: 'Plateforme unifiée pour centraliser toutes les interactions clients et améliorer la satisfaction.', status: 'En cours', progress: 45, ideasCount: 8, votesCount: 27, feedbacksCount: 12, icon: '👥' },
      { id: 4, title: 'Green IT Initiative', description: 'Réduction de l\'empreinte carbone numérique et adoption de pratiques éco-responsables.', status: 'Approuvée', progress: 60, ideasCount: 15, votesCount: 42, feedbacksCount: 18, icon: '🌱' },
      { id: 5, title: 'Data Analytics Hub', description: 'Centralisation des données et création d\'un entrepôt de données pour l\'analyse prédictive.', status: 'Approuvée', progress: 75, ideasCount: 10, votesCount: 31, feedbacksCount: 14, icon: '📊' },
      { id: 6, title: 'Cybersécurité Avancée', description: 'Renforcement de la sécurité informatique avec détection des menaces en temps réel.', status: 'Approuvée', progress: 90, ideasCount: 7, votesCount: 25, feedbacksCount: 11, icon: '🔒' },
      { id: 7, title: 'Mobile First Strategy', description: 'Développement d\'applications mobiles natives pour tous les services de l\'entreprise.', status: 'En cours', progress: 35, ideasCount: 9, votesCount: 22, feedbacksCount: 8, icon: '📱' },
      { id: 8, title: 'Automatisation RH', description: 'Digitalisation des processus de recrutement, onboarding et gestion des talents.', status: 'Approuvée', progress: 55, ideasCount: 11, votesCount: 29, feedbacksCount: 13, icon: '⚙️' },
      { id: 9, title: 'Blockchain Supply Chain', description: 'Traçabilité et transparence de la chaîne d\'approvisionnement via la technologie blockchain.', status: 'En cours', progress: 40, ideasCount: 5, votesCount: 16, feedbacksCount: 7, icon: '🔗' }
    ];
  }

  // ✅ Toggle Grid / Table
  toggleView(mode: 'grid' | 'table') {
    this.viewMode = mode;
  }

  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadProjects();
    }
  }

  onItemsPerPageChange(value: number): void {
    this.itemsPerPage = value;
    this.currentPage = 1;
    this.loadProjects();
  }

  getPageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  onProjectClick(project: Project): void {
    console.log('Projet sélectionné:', project);
  }
}

