import { Routes } from '@angular/router';

import { ViajeList } from './pages/viaje-list/viaje-list';
import { ViajeForm } from './pages/viaje-form/viaje-form';

export const viajesRoutes: Routes = [
  { path: '', component: ViajeList },
  { path: 'nuevo', component: ViajeForm },
  { path: 'editar/:id', component: ViajeForm }
];
