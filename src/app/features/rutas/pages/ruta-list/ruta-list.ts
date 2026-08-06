import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ConfirmDialog } from '../../../../shared/components/confirm-dialog/confirm-dialog';
import { Ruta } from '../../models/ruta.model';
import { RutaService } from '../../services/ruta';

@Component({
  selector: 'app-ruta-list',
  imports: [RouterLink, ConfirmDialog],
  templateUrl: './ruta-list.html',
})
export class RutaList {
  private readonly rutaService = inject(RutaService);

  readonly rutas = signal<Ruta[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  readonly dialogoVisible = signal(false);
  readonly rutaAEliminar = signal<Ruta | null>(null);
  readonly eliminando = signal(false);

  constructor() {
    this.cargar();
  }

  cargar(): void {
    this.loading.set(true);
    this.error.set(null);

    this.rutaService.listar().subscribe({
      next: (rutas) => {
        this.rutas.set(rutas);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.error.set('No se pudieron cargar las rutas.');
      },
    });
  }

  pedirEliminar(ruta: Ruta): void {
    this.rutaAEliminar.set(ruta);
    this.dialogoVisible.set(true);
  }

  cancelarEliminacion(): void {
    this.dialogoVisible.set(false);
    this.rutaAEliminar.set(null);
  }

  confirmarEliminacion(): void {
    const ruta = this.rutaAEliminar();
    if (!ruta) {
      return;
    }

    this.eliminando.set(true);

    this.rutaService.eliminar(ruta.id_ruta ?? 0).subscribe({
      next: () => {
        this.eliminando.set(false);
        this.dialogoVisible.set(false);
        this.rutaAEliminar.set(null);
        this.cargar();
      },
      error: () => {
        this.eliminando.set(false);
        this.error.set('No se pudo eliminar la ruta.');
      },
    });
  }
}
