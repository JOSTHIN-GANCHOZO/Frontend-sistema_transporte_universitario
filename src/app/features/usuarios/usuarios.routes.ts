import { Routes } from '@angular/router';

import { adminPrincipalGuard } from '../../core/guards/admin-principal-guard';
import { UsuarioForm } from './pages/usuario-form/usuario-form';
import { UsuarioList } from './pages/usuario-list/usuario-list';

export const usuariosRoutes: Routes = [
  { path: '', component: UsuarioList },
  { path: 'nuevo', component: UsuarioForm, canActivate: [adminPrincipalGuard] },
  { path: ':id', component: UsuarioForm, canActivate: [adminPrincipalGuard] },
];
