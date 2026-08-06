import { Routes } from '@angular/router';

import { MantenimientoList } from './pages/mantenimiento-list/mantenimiento-list';
import { MantenimientoForm } from './pages/mantenimiento-form/mantenimiento-form';

export const mantenimientosRoutes: Routes = [
  { path: '', component: MantenimientoList },
  { path: 'nuevo', component: MantenimientoForm },
  { path: 'editar/:id', component: MantenimientoForm }
];
