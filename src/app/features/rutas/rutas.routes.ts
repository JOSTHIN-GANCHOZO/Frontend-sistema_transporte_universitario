import { Routes } from '@angular/router';

import { RutaForm } from './pages/ruta-form/ruta-form';
import { RutaList } from './pages/ruta-list/ruta-list';

export const rutasRoutes: Routes = [
  { path: '', component: RutaList },
  { path: 'nuevo', component: RutaForm },
  { path: ':id', component: RutaForm },
];
