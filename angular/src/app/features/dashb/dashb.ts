import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Sidebar } from '../../core/components/sidebar/sidebar';
import { Navbside } from '../../core/components/navbside/navbside';
import {IdeaBackend, IdeaService} from '../../services/idea';
import { HttpClientModule } from '@angular/common/http';
import {AddIdea} from './add-idea/add-idea';

export interface IdeaFrontend {
  id: number;
  title: string;
  description: string;
  author: string;
  authorAvatar: string;
  date: string;
  votesCount: number;
  commentsCount: number;
  category: string;
  status?: string;        // 👈 OPTIONNEL (Solution 2)
}

interface Project {
  id: number;
  title: string;
  description: string;
  progress: number;
  icon: string;
}

interface CalendarEvent {
  id: number;
  title: string;
  date: Date;
  time: string;
  type: 'meeting' | 'deadline' | 'event';
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, Sidebar, Navbside, HttpClientModule,AddIdea],
  templateUrl: './dashb.html',
  styleUrls: ['./dashb.css']
})
export class Dashb implements OnInit {
  recentIdeas: {
    id: number;
    title: string;
    description: string;
    author: any;
    authorAvatar: string;
    date: string;
    votesCount: any;
    commentsCount: number;
    category: string
  }[] = [];
  topIdeas: IdeaFrontend[] = [];
  approvedProjects: Project[] = [];
  calendarEvents: CalendarEvent[] = [];
  currentDate: Date = new Date();
  currentMonth: string = '';
  currentYear: number = 0;
  calendarDays: { day: number | null, isToday: boolean, hasEvent: boolean }[] = [];

  constructor(private ideaService: IdeaService) {}
  isLoadingIdeas = true;
  ideasError = false;

  showAddIdea = false; // Contrôle l'affichage du formulaire

  ngOnInit(): void {
    console.log('Dashboard chargé');

    // Vérifier si des idées sont en localStorage
    const savedIdeas = localStorage.getItem('recentIdeas');
    if (savedIdeas) {
      this.recentIdeas = JSON.parse(savedIdeas);
      this.isLoadingIdeas = false;
    } else {
      this.loadRecentIdeas(); // sinon charger depuis backend
    }

    // Top Idées
    const savedTopIdeas = localStorage.getItem('topIdeas');
    if (savedTopIdeas) {
      this.topIdeas = JSON.parse(savedTopIdeas);
    } else {
      this.loadTopIdeas();
    }

    this.loadTopIdeas();
    this.loadApprovedProjects();
    this.loadCalendarEvents();
    this.initCalendar();
  }


  loadRecentIdeas(): void {
    this.isLoadingIdeas = true;
    this.ideasError = false;

    this.ideaService.getAllIdeas().subscribe({
      next: (res: any) => {
        const ideas = Array.isArray(res) ? res : res?.data ?? [];

        this.recentIdeas = ideas.map((i: IdeaBackend) => ({
          id: i.id,
          title: i.title,
          description: i.description,
          author: i.creatorName ?? 'Inconnu',
          authorAvatar: '👤',
          date: new Date(i.creationDate).toLocaleDateString(),
          votesCount: i.voteCount ?? 0,
          commentsCount: 0,
          category: 'Général',
          status: i.status
        }));

        // Sauvegarde pour persistance
        localStorage.setItem('recentIdeas', JSON.stringify(this.recentIdeas));
        this.isLoadingIdeas = false;
      },
      error: err => {
        console.error('Erreur chargement idées', err);
        this.ideasError = true;
        this.isLoadingIdeas = false;
      }
    });
  }
  // Méthode pour recevoir l'idée depuis AddIdeaComponent
  addIdeaToDashboard(newIdea: IdeaFrontend) {
    // Ajout immédiat à l'affichage
    this.recentIdeas.unshift(newIdea);

    // Vérifier si elle doit aussi être dans Top Idées
    //if (newIdea.votesCount >= 10) { // Exemple : votes >= 10
    //  this.topIdeas.unshift(newIdea);

      // Limiter à 10 éléments
    //  if (this.topIdeas.length > 10) this.topIdeas.pop();
    //}

    // Persistance côté backend
    this.ideaService.createIdea({
      title: newIdea.title,
      description: newIdea.description,
      author: newIdea.author,
      category: newIdea.category,
    }, 1).subscribe({
      next: (createdIdea) => {
        // Si backend renvoie l'idée avec un id, on peut mettre à jour l'objet
        const index = this.recentIdeas.findIndex(i => i.id === newIdea.id);
        if (index !== -1) this.recentIdeas[index] = createdIdea;
      },
      error: (err) => console.error(err)
    });

    // Sauvegarde pour persistance
    localStorage.setItem('recentIdeas', JSON.stringify(this.recentIdeas));
    localStorage.setItem('topIdeas', JSON.stringify(this.topIdeas));
    // Cacher le formulaire
    this.showAddIdea = false;

  }



  toggleAddIdeaForm() {
    this.showAddIdea = !this.showAddIdea;
  }


  loadTopIdeas(): void {
    this.ideaService.getTopIdeas().subscribe({
      next: (ideas: IdeaBackend[]) => {
        this.topIdeas = ideas.map((i: IdeaBackend) => ({
          id: i.id,
          title: i.title,
          description: i.description,
          author: i.creatorName ?? 'Inconnu',
          authorAvatar: '👤',
          date: new Date(i.creationDate).toLocaleDateString(),
          votesCount: i.voteCount,
          commentsCount: 0,
          category: 'Top 10',
          status: i.status
        }));

        localStorage.setItem('topIdeas', JSON.stringify(this.topIdeas));
      },
      error: err => console.error(err)
    });
  }





  loadApprovedProjects(): void {
    this.approvedProjects = [
      { id: 1, title: 'Innovation IA 2025', description: 'Solutions basées sur l\'IA...', progress: 70, icon: '🌐' },
      { id: 2, title: 'Transformation Digitale', description: 'Modernisation des systèmes...', progress: 85, icon: '🚀' },
      { id: 3, title: 'Data Analytics Hub', description: 'Centralisation des données', progress: 75, icon: '📊' },
      { id: 4, title: 'Cybersécurité Avancée', description: 'Renforcement de la sécurité', progress: 90, icon: '🔒' }
    ];
  }

  loadCalendarEvents(): void {
    this.calendarEvents = [
      { id: 1, title: 'Revue des projets Q1', date: new Date(2025, 0, 28), time: '10:00', type: 'meeting' },
      { id: 2, title: 'Deadline soumission idées', date: new Date(2025, 0, 30), time: '17:00', type: 'deadline' },
      { id: 3, title: 'Webinar Innovation', date: new Date(2025, 1, 3), time: '14:00', type: 'event' },
      { id: 4, title: 'Sprint Planning', date: new Date(2025, 1, 5), time: '09:00', type: 'meeting' }
    ];
  }

  initCalendar(): void {
    const months = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
    this.currentMonth = months[this.currentDate.getMonth()];
    this.currentYear = this.currentDate.getFullYear();
    this.generateCalendarDays();
  }

  generateCalendarDays(): void {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    this.calendarDays = [];
    const startDay = firstDay === 0 ? 6 : firstDay - 1;

    for (let i = 0; i < startDay; i++) {
      this.calendarDays.push({ day: null, isToday: false, hasEvent: false });
    }

    const today = new Date();
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDay = new Date(year, month, day);
      const isToday = currentDay.toDateString() === today.toDateString();
      const hasEvent = this.calendarEvents.some(event => event.date.toDateString() === currentDay.toDateString());
      this.calendarDays.push({ day, isToday, hasEvent });
    }
  }

  previousMonth(): void {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1, 1);
    this.initCalendar();
  }

  nextMonth(): void {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 1);
    this.initCalendar();
  }


  onIdeaClick(idea: IdeaFrontend): void { console.log('Idée sélectionnée:', idea); }
  onProjectClick(project: Project): void { console.log('Projet sélectionné:', project); }
}
