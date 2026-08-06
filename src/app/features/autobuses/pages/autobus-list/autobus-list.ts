import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ConfirmDialog } from '../../../../shared/components/confirm-dialog/confirm-dialog';
import { Autobus } from '../../models/autobus.model';
import { AutobusService } from '../../services/autobus';

@Component({
  selector: 'app-autobus-list',
  imports: [RouterLink, ConfirmDialog],
  templateUrl: './autobus-list.html',
})
export class AutobusList {
  private readonly autobusService = inject(AutobusService);

  readonly autobuses = signal<Autobus[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  readonly dialogoVisible = signal(false);
  readonly autobusAEliminar = signal<Autobus | null>(null);
  readonly eliminando = signal(false);

  constructor() {
    this.cargar();
  }

  cargar(): void {
    this.loading.set(true);
    this.error.set(null);

    this.autobusService.listar().subscribe({
      next: (autobuses) => {
        this.autobuses.set(autobuses);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.error.set('No se pudieron cargar los autobuses.');
      },
    });
  }

  pedirEliminar(autobus: Autobus): void {
    this.autobusAEliminar.set(autobus);
    this.dialogoVisible.set(true);
  }

  cancelarEliminacion(): void {
    this.dialogoVisible.set(false);
    this.autobusAEliminar.set(null);
  }

  confirmarEliminacion(): void {
    const autobus = this.autobusAEliminar();
    if (!autobus) {
      return;
    }

    this.eliminando.set(true);

    this.autobusService.eliminar(autobus.id_autobus ?? 0).subscribe({
      next: () => {
        this.eliminando.set(false);
        this.dialogoVisible.set(false);
        this.autobusAEliminar.set(null);
        this.cargar();
      },
      error: () => {
        this.eliminando.set(false);
        this.error.set('No se pudo eliminar el autobús.');
      },
    });
  }

  estadoBadge(estado?: string): string {
    switch (estado) {
      case 'DISPONIBLE':
        return 'badge badge-success';
      case 'EN_SERVICIO':
        return 'badge badge-info';
      case 'EN_MANTENIMIENTO':
        return 'badge badge-warning';
      case 'FUERA_DE_SERVICIO':
        return 'badge badge-danger';
      default:
        return 'badge badge-info';
    }
  }

  anio(autobus: Autobus): number | undefined {
    return autobus.año;
  }
}
