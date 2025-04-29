import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'tinder',
    loadComponent: () => import('./tinder/tinder.page').then( m => m.TinderPage)
  },
  {
    path: 'login',
    loadComponent: () => import('./log-in/log-in.page').then( m => m.LogInPage)
  }
];
