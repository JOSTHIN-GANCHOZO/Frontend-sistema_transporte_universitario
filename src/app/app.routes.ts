import { Routes } from '@angular/router';

import { authGuard } from './core/guards/auth-guard';
import { cambioPasswordGuard } from './core/guards/cambio-password-guard';
import { roleGuard } from './core/guards/role-guard';
import { CambiarPassword } from './features/auth/cambiar-password/cambiar-password';
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
      {
        path: 'cambiar-password',
        component: CambiarPassword,
        canActivate: [authGuard],
      },
    ],
  },
  {
    path: 'main',
    component: MainLayout,
    canActivate: [authGuard, cambioPasswordGuard],
    children: [
      { path: '', redirectTo: 'viajes', pathMatch: 'full' },
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
        loadChildren: () =>
          import('./features/viajes/viajes.routes').then((m) => m.viajesRoutes),
      },
      {
        path: 'reservas',
        loadChildren: () =>
          import('./features/reservas/reservas.routes').then((m) => m.reservasRoutes),
      },
      {
        path: 'mantenimientos',
        canActivate: [roleGuard],
        loadChildren: () =>
          import('./features/mantenimientos/mantenimientos.routes').then((m) => m.mantenimientosRoutes),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
