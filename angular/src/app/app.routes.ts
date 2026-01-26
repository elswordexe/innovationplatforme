import { Routes } from '@angular/router';
import { Home } from './features/home/home';
import { Dash } from './features/dash/dash';
export const routes: Routes = [
  { path: '', component: Home },
  { path: 'dash', component: Dash },
];
