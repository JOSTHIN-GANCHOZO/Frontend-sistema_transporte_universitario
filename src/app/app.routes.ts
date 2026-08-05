import { Routes } from '@angular/router';

import { authGuard } from './core/guards/auth-guard';
import { roleGuard } from './core/guards/role-guard';
import { Login } from './features/auth/login/login';
import { AuthLayout } from './layout/auth-layout/auth-layout';
import { MainLayout } from './layout/main-layout/main-layout';

export const routes: Routes = [
  {
    path: '',
    component: AuthLayout,
    children: [
      { path: '', redirectTo: 'login', pathMatch: 'full' },
      { path: 'login', component: Login },
    ],
  },
  {
    path: 'main',
    component: MainLayout,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'usuarios', pathMatch: 'full' },
      {
        path: 'usuarios',
        canActivate: [roleGuard],
        loadChildren: () =>
          import('./features/usuarios/usuarios.routes').then((m) => m.usuariosRoutes),
      },
      {
        path: 'autobuses',
        canActivate: [roleGuard],
        loadChildren: () =>
          import('./features/autobuses/autobuses.routes').then((m) => m.autobusesRoutes),
      },
      {
        path: 'conductores',
        canActivate: [roleGuard],
        loadChildren: () =>
          import('./features/conductores/conductores.routes').then((m) => m.conductoresRoutes),
      },
      {
        path: 'viajes',
        canActivate: [roleGuard],
        loadChildren: () =>
          import('./features/viajes/viajes.routes').then((m) => m.viajesRoutes),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
