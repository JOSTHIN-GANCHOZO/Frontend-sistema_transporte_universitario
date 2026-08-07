import { Routes } from '@angular/router';

import { adminPrincipalGuard } from '../../core/guards/admin-principal-guard';
import { ViajeDetail } from './pages/viaje-detail/viaje-detail';
import { ViajeForm } from './pages/viaje-form/viaje-form';
import { ViajeList } from './pages/viaje-list/viaje-list';

export const viajesRoutes: Routes = [
  { path: '', component: ViajeList },
  { path: 'nuevo', component: ViajeForm, canActivate: [adminPrincipalGuard] },
  { path: 'editar/:id', component: ViajeForm, canActivate: [adminPrincipalGuard] },
  { path: ':id', component: ViajeDetail },
];