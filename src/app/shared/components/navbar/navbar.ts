import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

import { Auth } from '../../../core/services/auth';
import { ConfirmDialog } from '../confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-navbar',
  imports: [ConfirmDialog],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);

  readonly usuarioActual = this.auth.usuarioActual;
  readonly dialogoVisible = signal(false);

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
