import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ConfirmDialog } from '../../../../shared/components/confirm-dialog/confirm-dialog';
import { Conductor } from '../../models/conductor.model';
import { ConductorService } from '../../services/conductor';

@Component({
  selector: 'app-conductor-list',
  imports: [RouterLink, ConfirmDialog],
  templateUrl: './conductor-list.html',
})
export class ConductorList {
  private readonly conductorService = inject(ConductorService);

  readonly conductores = signal<Conductor[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  readonly dialogoVisible = signal(false);
  readonly conductorAEliminar = signal<Conductor | null>(null);
  readonly eliminando = signal(false);

  constructor() {
    this.cargar();
  }

  cargar(): void {
    this.loading.set(true);
    this.error.set(null);

    this.conductorService.listar().subscribe({
      next: (conductores) => {
        this.conductores.set(conductores);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.error.set('No se pudieron cargar los conductores.');
      },
    });
  }

  pedirEliminar(conductor: Conductor): void {
    this.conductorAEliminar.set(conductor);
    this.dialogoVisible.set(true);
  }

  cancelarEliminacion(): void {
    this.dialogoVisible.set(false);
    this.conductorAEliminar.set(null);
  }

  confirmarEliminacion(): void {
    const conductor = this.conductorAEliminar();
    if (!conductor) {
      return;
    }

    this.eliminando.set(true);

    this.conductorService.eliminar(conductor.id_conductor ?? 0).subscribe({
      next: () => {
        this.eliminando.set(false);
        this.dialogoVisible.set(false);
        this.conductorAEliminar.set(null);
        this.cargar();
      },
      error: () => {
        this.eliminando.set(false);
        this.error.set('No se pudo eliminar el conductor.');
      },
    });
  }

  licenciaVencida(conductor: Conductor): boolean {
    if (!conductor.fecha_vencimiento_licencia) {
      return false;
    }
    const vencimiento = new Date(conductor.fecha_vencimiento_licencia + 'T00:00:00');
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    return vencimiento < hoy;
  }
}
