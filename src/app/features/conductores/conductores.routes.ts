import { Routes } from '@angular/router';

import { adminPrincipalGuard } from '../../core/guards/admin-principal-guard';
import { ConductorForm } from './pages/conductor-form/conductor-form';
import { ConductorList } from './pages/conductor-list/conductor-list';

export const conductoresRoutes: Routes = [
  { path: '', component: ConductorList },
  { path: 'nuevo', component: ConductorForm, canActivate: [adminPrincipalGuard] },
  { path: ':id', component: ConductorForm, canActivate: [adminPrincipalGuard] },
];
