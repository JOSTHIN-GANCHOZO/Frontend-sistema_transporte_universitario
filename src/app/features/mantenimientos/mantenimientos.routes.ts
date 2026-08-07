import { Routes } from '@angular/router';

import { adminPrincipalGuard } from '../../core/guards/admin-principal-guard';
import { MantenimientoList } from './pages/mantenimiento-list/mantenimiento-list';
import { MantenimientoForm } from './pages/mantenimiento-form/mantenimiento-form';

export const mantenimientosRoutes: Routes = [
  { path: '', component: MantenimientoList },
  { path: 'nuevo', component: MantenimientoForm, canActivate: [adminPrincipalGuard] },
  { path: 'editar/:id', component: MantenimientoForm, canActivate: [adminPrincipalGuard] }
];
