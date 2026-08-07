import { Component, inject, signal, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, Validators, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { Viaje, ESTADOS_VIAJE, EstadoViaje } from '../../models/viaje.model';
import { ViajeService } from '../../services/viaje';
import { AutobusService } from '../../../autobuses/services/autobus';
import { ConductorService } from '../../../conductores/services/conductor';
import { RutaService } from '../../../rutas/services/ruta';
import { Autobus } from '../../../autobuses/models/autobus.model';
import { Conductor } from '../../../conductores/models/conductor.model';
import { Ruta } from '../../../rutas/models/ruta.model';

@Component({
  selector: 'app-viaje-form',
  imports: [ReactiveFormsModule],
  templateUrl: './viaje-form.html',
  styleUrl: './viaje-form.css',
})
export class ViajeForm implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  
  private readonly viajeService = inject(ViajeService);
  private readonly autobusService = inject(AutobusService);
  private readonly conductorService = inject(ConductorService);
  private readonly rutaService = inject(RutaService);

  readonly estadosViaje = ESTADOS_VIAJE;
  readonly esEdicion = signal(false);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly fechaMinima = this.fechaHoyIso();

  readonly autobuses = signal<Autobus[]>([]);
  readonly conductores = signal<Conductor[]>([]);
  readonly rutas = signal<Ruta[]>([]);

  readonly form = this.fb.group({
    fecha: ['', [Validators.required, fechaNoPasada]],
    hora_salida: ['', Validators.required],
    hora_llegada_estimada: [''],
    id_ruta: [null as number | null, Validators.required],
    id_autobus: [null as number | null, Validators.required],
    id_conductor: [null as number | null, Validators.required]
  });

  constructor() {
    this.form.controls.hora_salida.valueChanges.subscribe(() => this.validarHoras());
    this.form.controls.hora_llegada_estimada.valueChanges.subscribe(() => this.validarHoras());
  }

  private validarHoras(): void {
    const salida = this.form.controls.hora_salida.value;
    const llegada = this.form.controls.hora_llegada_estimada.value;
    const controlLlegada = this.form.controls.hora_llegada_estimada;

    if (salida && llegada && llegada <= salida) {
      controlLlegada.setErrors({ horaLlegadaMenor: true });
    } else if (controlLlegada.hasError('horaLlegadaMenor')) {
      controlLlegada.updateValueAndValidity({ onlySelf: true, emitEvent: false });
      const { horaLLegadaMenor: _eliminado, ...restantes } = controlLlegada.errors ?? {};
      controlLlegada.setErrors(Object.keys(restantes).length > 0 ? restantes : null);
    }
  }

  ngOnInit() {
    this.cargarDatosDesplegables();
    
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.esEdicion.set(true);
      this.cargarViaje(Number(id));
    }
  }

  private cargarDatosDesplegables() {
    this.autobusService.listar().subscribe(data => this.autobuses.set(data.filter(a => a.estado === 'DISPONIBLE' || this.esEdicion())));
    this.conductorService.listar().subscribe(data => this.conductores.set(data));
    this.rutaService.listar().subscribe(data => this.rutas.set(data));
  }

  private cargarViaje(id: number): void {
    this.loading.set(true);

    this.viajeService.obtenerPorId(id).subscribe({
      next: (viaje) => {
        this.form.patchValue({
          fecha: viaje.fecha,
          hora_salida: viaje.hora_salida,
          hora_llegada_estimada: viaje.hora_llegada_estimada ?? '',
          id_ruta: viaje.id_ruta,
          id_autobus: viaje.id_autobus,
          id_conductor: viaje.id_conductor
        });
        
        if (viaje.estado !== 'PROGRAMADO') {
            this.form.disable();
            this.error.set('Solo se pueden editar viajes en estado PROGRAMADO.');
        }
        
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.error.set('No se pudo cargar el viaje.');
      },
    });
  }

  onSubmit(): void {
    if (this.form.invalid || this.form.disabled) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    const datos = this.form.getRawValue();
    const payload: Partial<Viaje> = {
      fecha: datos.fecha ?? '',
      hora_salida: datos.hora_salida ?? '',
      hora_llegada_estimada: datos.hora_llegada_estimada || undefined,
      id_ruta: Number(datos.id_ruta),
      id_autobus: Number(datos.id_autobus),
      id_conductor: Number(datos.id_conductor)
    };

    if (this.esEdicion()) {
      const id = Number(this.route.snapshot.paramMap.get('id'));
      this.viajeService.actualizar(id, payload).subscribe({
        next: () => this.router.navigate(['/main/viajes']),
        error: (err) => {
          this.loading.set(false);
          this.error.set(err.error?.mensaje ?? 'No se pudo actualizar el viaje.');
        },
      });
      return;
    }

    this.viajeService.crear(payload).subscribe({
      next: () => this.router.navigate(['/main/viajes']),
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.mensaje ?? 'No se pudo crear el viaje.');
      },
    });
  }

  volver(): void {
    this.router.navigate(['/main/viajes']);
  }

  mostrarError(campo: string): boolean {
    const control = this.form.get(campo);
    return !!control && control.invalid && control.touched;
  }

  private fechaHoyIso(): string {
    const hoy = new Date();
    const mes = String(hoy.getMonth() + 1).padStart(2, '0');
    const dia = String(hoy.getDate()).padStart(2, '0');
    return `${hoy.getFullYear()}-${mes}-${dia}`;
  }
}

function fechaNoPasada(control: AbstractControl): ValidationErrors | null {
  const valor = control.value as string;
  if (!valor) {
    return null;
  }

  const fecha = new Date(valor + 'T00:00:00');
  if (isNaN(fecha.getTime())) {
    return { fechaInvalida: true };
  }

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  return fecha < hoy ? { fechaNoPasada: true } : null;
}
