import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { DatePipe, CurrencyPipe } from '@angular/common';

import { Mantenimiento } from '../../models/mantenimiento.model';
import { MantenimientoService } from '../../services/mantenimiento';
import { MantenimientoDetailModal } from '../../components/mantenimiento-detail-modal/mantenimiento-detail-modal';

@Component({
  selector: 'app-mantenimiento-list',
  imports: [RouterLink, DatePipe, CurrencyPipe, MantenimientoDetailModal],
  templateUrl: './mantenimiento-list.html',
})
export class MantenimientoList {
  private readonly mantenimientoService = inject(MantenimientoService);
  private readonly route = inject(ActivatedRoute);

  readonly mantenimientos = signal<Mantenimiento[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  readonly autobusFiltro = signal<number | null>(null);

  readonly mantenimientosFiltrados = computed(() => {
    const filtro = this.autobusFiltro();
    if (filtro == null) {
      return this.mantenimientos();
    }
    return this.mantenimientos().filter((m) => m.id_autobus === filtro);
  });

  constructor() {
    const autobus = this.route.snapshot.queryParamMap.get('autobus');
    if (autobus && !isNaN(Number(autobus))) {
      this.autobusFiltro.set(Number(autobus));
    }
    this.cargar();
  }

  cargar(): void {
    this.loading.set(true);
    this.error.set(null);

    this.mantenimientoService.listar().subscribe({
      next: (data) => {
        this.mantenimientos.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.error.set('No se pudieron cargar los mantenimientos.');
      },
    });
  }

  estadoBadge(estado?: string): string {
    switch (estado) {
      case 'PENDIENTE':
        return 'badge badge-info';
      case 'EN_PROCESO':
        return 'badge badge-warning';
      case 'COMPLETADO':
        return 'badge badge-success';
      case 'CANCELADO':
        return 'badge badge-danger';
      default:
        return 'badge badge-info';
    }
  }

  nombreAutobus(mantenimiento: Mantenimiento): string {
    return mantenimiento.Autobus?.placa ?? `Autobús #${mantenimiento.id_autobus}`;
  }

  nombreAutobusFiltro(): string {
    const filtro = this.autobusFiltro();
    if (filtro == null) {
      return 'Mantenimientos';
    }
    const bus = this.mantenimientos().find((m) => m.id_autobus === filtro)?.Autobus;
    return bus?.placa ?? bus?.numero_interno ?? `Autobús #${filtro}`;
  }

  eliminarMantenimiento(id: number | undefined): void {
    if (!id) return;
    if (confirm('¿Estás seguro de que deseas eliminar este mantenimiento? Esta acción no se puede deshacer.')) {
      this.mantenimientoService.eliminar(id).subscribe({
        next: () => {
          this.cargar();
        },
        error: () => {
          this.error.set('No se pudo eliminar el mantenimiento. Intente nuevamente.');
        }
      });
    }
  }

  readonly modalOpen = signal(false);
  readonly selectedMantenimiento = signal<Mantenimiento | null>(null);

  verMantenimiento(mantenimiento: Mantenimiento): void {
    this.selectedMantenimiento.set(mantenimiento);
    this.modalOpen.set(true);
  }
}
