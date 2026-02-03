import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface StatCard {
  label: string;
  value: string;
  change: string;
  isPositive: boolean;
  subtitle: string;
}

interface ProfileImpression {
  month: string;
  comptes: number;
  activite: number;
  attentes: number;
}

interface FollowerCountry {
  name: string;
  percentage: number;
  color: string;
}

interface RecentActivity {
  user: string;
  avatar: string;
  action: string;
  time: string;
}

@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './statistics.html',
  styleUrls: ['./statistics.css']
})
export class StatisticsComponent implements OnInit {
  statCards: StatCard[] = [
    {
      label: 'Abonnés',
      value: '20',
      change: '+9.0%',
      isPositive: true,
      subtitle: 'par rapport au mois dernier'
    },
    {
      label: 'Portée',
      value: '250',
      change: '+9.0%',
      isPositive: true,
      subtitle: 'par rapport au mois dernier'
    },
    {
      label: "Mentions J'aime",
      value: '201',
      change: '+9.0%',
      isPositive: true,
      subtitle: 'par rapport au mois dernier'
    },
    {
      label: 'Commentaires',
      value: '150',
      change: '-7.%',
      isPositive: false,
      subtitle: 'par rapport au mois dernier'
    }
  ];

  profileImpressions: ProfileImpression[] = [
    { month: 'Dim', comptes: 10000, activite: 10000, attentes: 5000 },
    { month: 'Lun', comptes: 47000, activite: 15000, attentes: 15000 },
    { month: 'Mar', comptes: 52000, activite: 9000, attentes: 22000 },
    { month: 'Mer', comptes: 5000, activite: 27000, attentes: 8000 },
    { month: 'Jeu', comptes: 10000, activite: 22000, attentes: 15000 },
    { month: 'Ven', comptes: 7000, activite: 22000, attentes: 15000 },
    { month: 'Sam', comptes: 5000, activite: 8000, attentes: 7000 }
  ];

  audienceReached = 250;
  audiencePercentage = 75;

  followerCountries: FollowerCountry[] = [
    { name: 'Maroc', percentage: 90, color: '#8B5A2B' },
    { name: 'Espagne', percentage: 8, color: '#CD853F' },
    { name: 'France', percentage: 1, color: '#D2691E' },
    { name: 'Autre', percentage: 1, color: '#DEB887' }
  ];

  recentActivities: RecentActivity[] = [
    {
      user: 'Guy Hawkins',
      avatar: '👤',
      action: 'started following you',
      time: '12 June, 08:12 AM'
    },
    {
      user: 'Jerome Bell',
      avatar: '👤',
      action: 'started following you',
      time: '12 June, 08:12 AM'
    },
    {
      user: 'Leslie Alexander',
      avatar: '👤',
      action: 'started following you',
      time: '12 June, 08:12 AM'
    },
    {
      user: 'Cameron Williamson',
      avatar: '👤',
      action: 'started following you',
      time: '12 June, 08:12 AM'
    }
  ];

  selectedPeriod = 'Hebdomadaire';
  selectedCountry = 'Country';

  maxImpressionValue = 50000;

  ngOnInit(): void {
    // Component initialization
  }

  getBarHeight(value: number): number {
    return (value / this.maxImpressionValue) * 100;
  }
}
