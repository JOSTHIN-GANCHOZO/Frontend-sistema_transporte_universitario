import { Routes } from '@angular/router';

import { adminPrincipalGuard } from '../../core/guards/admin-principal-guard';
import { AutobusForm } from './pages/autobus-form/autobus-form';
import { AutobusList } from './pages/autobus-list/autobus-list';

export const autobusesRoutes: Routes = [
  { path: '', component: AutobusList },
  { path: 'nuevo', component: AutobusForm, canActivate: [adminPrincipalGuard] },
  { path: ':id', component: AutobusForm, canActivate: [adminPrincipalGuard] },
];
