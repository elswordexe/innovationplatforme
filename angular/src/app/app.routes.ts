import { Routes } from '@angular/router';
import { Home } from './features/home/home';
import { Dashb } from './features/dashb/dashb';
import { IdeaDetail } from './features/idea-detail/idea-detail';
import { AllProjects } from './features/all-projects/all-projects';
import { AnalyticsComponent } from './features/analytics/analytics';
import { StatisticsComponent } from './features/analytics/statistics/statistics';
import { ReportsComponent } from './features/analytics/reports/reports';
import { Auth } from './features/auth/auth';
import { PostRegistration } from './features/post-registration/post-registration';
import { Votes } from './features/votes/votes';
import { Bookmarks } from './features/bookmarks/bookmarks';
import { IdeaFeedback } from './features/idea-feedback/idea-feedback';
import { Profile } from './features/profile/profile';
import { ManagerDashboard } from './features/manager-dashboard/manager-dashboard';
import { IdeasListComponent } from './features/ideas/ideas-list/ideas-list.component';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'dashboard', component: Dashb },
  { path: 'dash', component: Dashb },
  { path: 'projects', component: AllProjects },
  { path: 'ideas', component: IdeasListComponent },
  {
    path: 'analytics',
    component: AnalyticsComponent,
    children: [
      { path: 'statistics', component: StatisticsComponent },
      { path: 'reports', component: ReportsComponent },
      { path: '', redirectTo: 'statistics', pathMatch: 'full' }
    ]
  },
  { path: 'auth', component: Auth },
  { path: 'post-registration', component: PostRegistration },
  { path: 'Votes', redirectTo: 'votes', pathMatch: 'full' },
  { path: 'votes', component: Votes },
  { path: 'Bookmarks', redirectTo: 'bookmarks', pathMatch: 'full' },
  { path: 'bookmarks', component: Bookmarks },
  { path: 'feedback', component: IdeaFeedback },
  { path: 'profile', component: Profile },
  { path: 'manager', component: ManagerDashboard },
  { path: 'idea/:id', component: IdeaDetail }
];
