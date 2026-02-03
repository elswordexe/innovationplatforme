import { Routes } from '@angular/router';
import { Home } from './features/home/home';
import { Dash } from './features/dash/dash';
import { IdeasListComponent } from './features/ideas/ideas-list/ideas-list.component';
import { IdeaCreateComponent } from './features/ideas/idea-create/idea-create.component';
import { SettingsComponent } from './features/settings/settings.component';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'dash', component: Dash },
  { path: 'ideas/create', component: IdeaCreateComponent },
  { path: 'ideas', component: IdeasListComponent },
  { path: 'settings', component: SettingsComponent },
];
