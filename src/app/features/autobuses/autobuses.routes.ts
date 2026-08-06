import { Routes } from '@angular/router';

import { AutobusForm } from './pages/autobus-form/autobus-form';
import { AutobusList } from './pages/autobus-list/autobus-list';

export const autobusesRoutes: Routes = [
  { path: '', component: AutobusList },
  { path: 'nuevo', component: AutobusForm },
  { path: ':id', component: AutobusForm },
];
