import { Component, inject, input, output, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { Auth } from '../../../core/services/auth';
import { Icon } from '../icon/icon';

const COLAPSADO_KEY = 'sidebar-colapsado';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive, Icon],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
  private readonly auth = inject(Auth);

  readonly abierto = input(false);
  readonly navegado = output<void>();

  readonly colapsado = signal(localStorage.getItem(COLAPSADO_KEY) === 'true');

  esAdministrador(): boolean {
    return this.auth.esAdministrador();
  }

  alternarColapso(): void {
    const nuevo = !this.colapsado();
    this.colapsado.set(nuevo);
    localStorage.setItem(COLAPSADO_KEY, String(nuevo));
  }

  cerrarMenu(): void {
    this.navegado.emit();
  }
}