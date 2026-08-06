import { Component, inject, output, signal } from '@angular/core';
import { Router } from '@angular/router';

import { Auth } from '../../../core/services/auth';
import { ConfirmDialog } from '../confirm-dialog/confirm-dialog';
import { Icon } from '../icon/icon';

@Component({
  selector: 'app-navbar',
  imports: [ConfirmDialog, Icon],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);

  readonly usuarioActual = this.auth.usuarioActual;
  readonly dialogoVisible = signal(false);

  readonly menuClick = output<void>();

  solicitarCierre(): void {
    this.dialogoVisible.set(true);
  }

  confirmarCierre(): void {
    this.dialogoVisible.set(false);
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  cancelarCierre(): void {
    this.dialogoVisible.set(false);
  }
}
