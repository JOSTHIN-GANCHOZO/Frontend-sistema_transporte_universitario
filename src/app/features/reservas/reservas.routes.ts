import { Routes } from '@angular/router';

import { ReservaForm } from './pages/reserva-form/reserva-form';
import { ReservaList } from './pages/reserva-list/reserva-list';

export const reservasRoutes: Routes = [
  { path: '', component: ReservaList },
  { path: 'nuevo', component: ReservaForm },
];
