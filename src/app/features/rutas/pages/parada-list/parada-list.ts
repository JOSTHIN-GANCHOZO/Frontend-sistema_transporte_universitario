import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ConfirmDialog } from '../../../../shared/components/confirm-dialog/confirm-dialog';
import { Parada } from '../../models/parada.model';
import { ParadaService } from '../../services/parada';

@Component({
  selector: 'app-parada-list',
  imports: [RouterLink, ConfirmDialog],
  templateUrl: './parada-list.html',
})
export class ParadaList {
  private readonly paradaService = inject(ParadaService);

  readonly paradas = signal<Parada[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  readonly dialogoVisible = signal(false);
  readonly paradaAEliminar = signal<Parada | null>(null);
  readonly eliminando = signal(false);

  constructor() {
    this.cargar();
  }

  cargar(): void {
    this.loading.set(true);
    this.error.set(null);

    this.paradaService.listar().subscribe({
      next: (paradas) => {
        this.paradas.set(paradas);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.error.set('No se pudieron cargar las paradas.');
      },
    });
  }

  pedirEliminar(parada: Parada): void {
    this.paradaAEliminar.set(parada);
    this.dialogoVisible.set(true);
  }

  cancelarEliminacion(): void {
    this.dialogoVisible.set(false);
    this.paradaAEliminar.set(null);
  }

  confirmarEliminacion(): void {
    const parada = this.paradaAEliminar();
    if (!parada) {
      return;
    }

    this.eliminando.set(true);

    this.paradaService.eliminar(parada.id_parada ?? 0).subscribe({
      next: () => {
        this.eliminando.set(false);
        this.dialogoVisible.set(false);
        this.paradaAEliminar.set(null);
        this.cargar();
      },
      error: () => {
        this.eliminando.set(false);
        this.error.set('No se pudo eliminar la parada.');
      },
    });
  }
}
