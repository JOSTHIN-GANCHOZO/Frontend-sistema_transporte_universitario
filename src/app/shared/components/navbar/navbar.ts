import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

import { Auth } from '../../../core/services/auth';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);

  readonly usuarioActual = this.auth.usuarioActual;

  cerrarSesion(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
