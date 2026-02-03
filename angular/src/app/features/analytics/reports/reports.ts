import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface MetricCard {
  label: string;
  value: string;
  suffix?: string;
}

interface KnowledgeCard {
  label: string;
  value: string;
  hasChart: boolean;
  chartData?: number[];
}

interface ActivityData {
  month: string;
  value: number;
}

interface SubjectItem {
  icon: string;
  title: string;
  percentage: number;
  status: string;
}

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reports.html',
  styleUrls: ['./reports.css']
})
export class ReportsComponent implements OnInit {
  // Filtres
  selectedTimeframe = 'All-time';
  selectedPeople = 'All';
  selectedTopic = 'All';

  timeframeOptions = ['All-time', 'Last month', 'Last week', 'Today'];
  peopleOptions = ['All', 'Active users', 'Inactive users'];
  topicOptions = ['All', 'Food Safety', 'Cyber Security', 'Compliance'];

  // Cartes métriques
  metricCards: MetricCard[] = [
    { label: 'Utilisateurs actifs', value: '1', suffix: '/250' },
    { label: 'Questions répondues', value: '1500' },
    { label: 'Durée moyenne de session', value: '2m 34s' }
  ];

  // Cartes de connaissance
  knowledgeCards: KnowledgeCard[] = [
    {
      label: 'Connaissance initiale',
      value: '64%',
      hasChart: true,
      chartData: [20, 25, 22, 28, 26, 30, 28, 32, 30, 35, 33, 38]
    },
    {
      label: 'Connaissance actuelle',
      value: '86%',
      hasChart: true,
      chartData: [45, 48, 46, 50, 48, 52, 50, 54, 52, 56, 54, 58]
    },
    {
      label: 'Gain de connaissance',
      value: '+34%',
      hasChart: true,
      chartData: [15, 18, 16, 20, 18, 22, 20, 24, 22, 26, 24, 28]
    }
  ];

  // Données d'activité mensuelle
  activityData: ActivityData[] = [
    { month: 'JAN', value: 80 },
    { month: 'FEB', value: 120 },
    { month: 'MAR', value: 150 },
    { month: 'APR', value: 210 },
    { month: 'MAY', value: 280 },
    { month: 'JUN', value: 220 },
    { month: 'JUL', value: 260 },
    { month: 'AUG', value: 100 },
    { month: 'SEP', value: 280 },
    { month: 'OCT', value: 340 },
    { month: 'NOV', value: 380 },
    { month: 'DEC', value: 420 }
  ];

  maxActivityValue = 450;

  // Sujets les plus faibles
  weakestSubjects: SubjectItem[] = [
    {
      icon: '🍎',
      title: 'Food Safety',
      percentage: 74,
      status: 'Correct'
    },
    {
      icon: '📋',
      title: 'Compliance Basics Procedures',
      percentage: 52,
      status: 'Correct'
    },
    {
      icon: '💼',
      title: 'Company Networking',
      percentage: 36,
      status: 'Correct'
    }
  ];

  // Sujets les plus maîtrisés
  masteredSubjects: SubjectItem[] = [
    {
      icon: '😷',
      title: 'Covid Protocols',
      percentage: 95,
      status: 'Correct'
    },
    {
      icon: '🔒',
      title: 'Cyber Security Basics',
      percentage: 92,
      status: 'Correct'
    },
    {
      icon: '📱',
      title: 'Social Media Policies',
      percentage: 89,
      status: 'Correct'
    }
  ];

  ngOnInit(): void {
    // Component initialization
  }

  getActivityBarHeight(value: number): number {
    return (value / this.maxActivityValue) * 100;
  }

  getProgressBarColor(percentage: number): string {
    if (percentage >= 90) return '#10b981'; // Vert
    if (percentage >= 70) return '#f59e0b'; // Orange
    return '#ef4444'; // Rouge
  }

  getChartPath(data?: number[]): string {
    if (!data || data.length === 0) return '';

    const width = 120;
    const height = 40;
    const step = width / (data.length - 1);
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min;

    let path = `M 0,${height - ((data[0] - min) / range * height)}`;

    for (let i = 1; i < data.length; i++) {
      const x = i * step;
      const y = height - ((data[i] - min) / range * height);
      path += ` L ${x},${y}`;
    }

    path += ` L ${width},${height} L 0,${height} Z`;

    return path;
  }

  getSubjectImage(title: string): string {
    // Retourne une image placeholder basée sur le titre
    const images: { [key: string]: string } = {
      'Food Safety': 'https://via.placeholder.com/60x60/ff6b6b/ffffff?text=🍎',
      'Compliance Basics Procedures': 'https://via.placeholder.com/60x60/4ecdc4/ffffff?text=📋',
      'Company Networking': 'https://via.placeholder.com/60x60/45b7d1/ffffff?text=💼',
      'Covid Protocols': 'https://via.placeholder.com/60x60/96ceb4/ffffff?text=😷',
      'Cyber Security Basics': 'https://via.placeholder.com/60x60/1a1a2e/ffffff?text=🔒',
      'Social Media Policies': 'https://via.placeholder.com/60x60/16213e/ffffff?text=📱'
    };

    return images[title] || 'https://via.placeholder.com/60x60/cccccc/ffffff?text=?';
  }
}
