import { Component, EventEmitter, Input, Output, signal, OnChanges, SimpleChanges, inject } from '@angular/core';
import { Viaje } from '../../models/viaje.model';
import { ViajeService } from '../../services/viaje';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-ver-reservas-modal',
  imports: [DatePipe],
  templateUrl: './ver-reservas-modal.html',
  styleUrl: './ver-reservas-modal.css',
})
export class VerReservasModal implements OnChanges {
  @Input() viaje: Viaje | null = null;
  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();

  private readonly viajeService = inject(ViajeService);

  readonly reservas = signal<any[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen'] && this.isOpen && this.viaje?.id_viaje) {
      this.cargarReservas();
    }
  }

  cargarReservas() {
    this.loading.set(true);
    this.error.set(null);
    this.viajeService.obtenerReservas(this.viaje!.id_viaje!).subscribe({
      next: (res) => {
        this.reservas.set(res);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('No se pudieron cargar las reservas.');
        this.loading.set(false);
      }
    });
  }

  cerrar(): void {
    this.close.emit();
  }
}
