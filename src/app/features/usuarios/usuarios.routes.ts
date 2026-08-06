import { Routes } from '@angular/router';

import { UsuarioForm } from './pages/usuario-form/usuario-form';
import { UsuarioList } from './pages/usuario-list/usuario-list';

export const usuariosRoutes: Routes = [
  { path: '', component: UsuarioList },
  { path: 'nuevo', component: UsuarioForm },
  { path: ':id', component: UsuarioForm },
];
