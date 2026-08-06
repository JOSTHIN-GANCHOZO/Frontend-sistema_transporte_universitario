import { Routes } from '@angular/router';

import { ViajeDetail } from './pages/viaje-detail/viaje-detail';
import { ViajeList } from './pages/viaje-list/viaje-list';

export const viajesRoutes: Routes = [
  { path: '', component: ViajeList },
  { path: ':id', component: ViajeDetail },
];