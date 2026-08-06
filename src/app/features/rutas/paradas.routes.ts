import { Routes } from '@angular/router';

import { ParadaForm } from './pages/parada-form/parada-form';
import { ParadaList } from './pages/parada-list/parada-list';

export const paradasRoutes: Routes = [
  { path: '', component: ParadaList },
  { path: 'nuevo', component: ParadaForm },
  { path: ':id', component: ParadaForm },
];
