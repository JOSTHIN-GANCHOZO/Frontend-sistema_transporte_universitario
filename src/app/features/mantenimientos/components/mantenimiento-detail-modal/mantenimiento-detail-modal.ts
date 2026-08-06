import { Component, Input, Output, EventEmitter } from '@angular/core';
import { DatePipe, CurrencyPipe } from '@angular/common';
import { Mantenimiento } from '../../models/mantenimiento.model';

@Component({
  selector: 'app-mantenimiento-detail-modal',
  imports: [DatePipe, CurrencyPipe],
  templateUrl: './mantenimiento-detail-modal.html',
  styleUrl: './mantenimiento-detail-modal.css'
})
export class MantenimientoDetailModal {
  @Input() isOpen = false;
  @Input() mantenimiento: Mantenimiento | null = null;
  
  @Output() close = new EventEmitter<void>();

  cerrar(): void {
    this.close.emit();
  }
}
