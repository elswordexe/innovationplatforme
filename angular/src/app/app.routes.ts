import { Routes } from '@angular/router';
import { Home } from './features/home/home';
import { AnalyticsComponent } from './features/analytics/analytics';
import { StatisticsComponent } from './features/analytics/statistics/statistics';
import { ReportsComponent } from './features/analytics/reports/reports';
import {AllProjects} from './features/all-projects/all-projects';
import {Dashb} from './features/dashb/dashb';
import {Sidebar} from './core/components/sidebar/sidebar';
import {AddIdea} from './features/dashb/add-idea/add-idea';

export const routes: Routes = [
  { path: '', component: Home },
  {
    path: 'analytics',
    component: AnalyticsComponent,
    children:[
      { path: 'statistics' , component:StatisticsComponent},
      { path: 'reports' , component: ReportsComponent}
    ]
  },
  { path: 'allprojects', component: AllProjects },
  { path: 'dashb',
    component: Dashb,
    children:[
      { path: 'addIdea' , component:AddIdea}
    ]
  },

  { path: 'sidebar', component: Sidebar}
];
