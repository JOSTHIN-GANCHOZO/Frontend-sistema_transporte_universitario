import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Auth } from '../../../../core/services/auth';
import { ConfirmDialog } from '../../../../shared/components/confirm-dialog/confirm-dialog';
import { Usuario } from '../../models/usuario.model';
import { UsuarioService } from '../../services/usuario';

@Component({
  selector: 'app-usuario-list',
  imports: [RouterLink, ConfirmDialog],
  templateUrl: './usuario-list.html',
})
export class UsuarioList {
  private readonly usuarioService = inject(UsuarioService);
  private readonly auth = inject(Auth);

  readonly usuarios = signal<Usuario[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  readonly dialogoVisible = signal(false);
  readonly usuarioAEliminar = signal<Usuario | null>(null);
  readonly eliminando = signal(false);

  esAdminPrincipal(): boolean {
    return this.auth.esAdminPrincipal();
  }

  constructor() {
    this.cargar();
  }

  cargar(): void {
    this.loading.set(true);
    this.error.set(null);

    this.usuarioService.obtenerUsuarios().subscribe({
      next: (usuarios) => {
        this.usuarios.set(usuarios);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.error.set('No se pudieron cargar los usuarios.');
      },
    });
  }

  noGestionable(usuario: Usuario): boolean {
    const usuarioActual = this.auth.usuarioActual();
    if (usuarioActual && usuario.id_usuario === usuarioActual.id_usuario) {
      return true;
    }
    if (usuario.es_admin_principal !== true) {
      return false;
    }
    return !this.usuarios().some(
      (u) =>
        u.id_usuario !== usuario.id_usuario &&
        u.es_admin_principal === true &&
        u.Credencial?.estado === 'ACTIVA'
    );
  }

  pedirEliminar(usuario: Usuario): void {
    this.usuarioAEliminar.set(usuario);
    this.dialogoVisible.set(true);
  }

  cancelarEliminacion(): void {
    this.dialogoVisible.set(false);
    this.usuarioAEliminar.set(null);
  }

  confirmarEliminacion(): void {
    const usuario = this.usuarioAEliminar();
    if (!usuario) {
      return;
    }

    this.eliminando.set(true);

    this.usuarioService.eliminarUsuario(usuario.id_usuario).subscribe({
      next: () => {
        this.eliminando.set(false);
        this.dialogoVisible.set(false);
        this.usuarioAEliminar.set(null);
        this.cargar();
      },
      error: () => {
        this.eliminando.set(false);
        this.error.set('No se pudo eliminar el usuario.');
      },
    });
  }

  estadoBadge(estado?: string): string {
    switch (estado) {
      case 'ACTIVA':
        return 'badge badge-success';
      case 'BLOQUEADA':
        return 'badge badge-warning';
      case 'INACTIVA':
        return 'badge badge-danger';
      default:
        return 'badge badge-info';
    }
  }
}
