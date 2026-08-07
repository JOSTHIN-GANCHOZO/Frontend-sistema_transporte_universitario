import { Routes } from '@angular/router';

import { adminPrincipalGuard } from '../../core/guards/admin-principal-guard';
import { RutaForm } from './pages/ruta-form/ruta-form';
import { RutaList } from './pages/ruta-list/ruta-list';

export const rutasRoutes: Routes = [
  { path: '', component: RutaList },
  { path: 'nuevo', component: RutaForm, canActivate: [adminPrincipalGuard] },
  { path: ':id', component: RutaForm, canActivate: [adminPrincipalGuard] },
];
