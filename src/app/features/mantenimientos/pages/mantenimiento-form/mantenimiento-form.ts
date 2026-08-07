import { Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { Mantenimiento, ESTADOS_MANTENIMIENTO, EstadoMantenimiento } from '../../models/mantenimiento.model';
import { MantenimientoService } from '../../services/mantenimiento';
import { AutobusService } from '../../../autobuses/services/autobus';
import { Autobus } from '../../../autobuses/models/autobus.model';

@Component({
  selector: 'app-mantenimiento-form',
  imports: [ReactiveFormsModule],
  templateUrl: './mantenimiento-form.html',
  styleUrl: './mantenimiento-form.css',
})
export class MantenimientoForm implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly mantenimientoService = inject(MantenimientoService);
  private readonly autobusService = inject(AutobusService);

  readonly estadosMantenimiento = ESTADOS_MANTENIMIENTO;
  readonly esEdicion = signal(false);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly otrosMantenimientosActivos = signal(0);

  readonly autobuses = signal<Autobus[]>([]);

  readonly form = this.fb.group({
    fecha_inicio: ['', Validators.required],
    fecha_fin: [''],
    tipo_mantenimiento: ['', [Validators.pattern(/^[\p{L}\s.'-]*$/u)]],
    descripcion: ['', [Validators.maxLength(500)]],
    costo: [null as number | null, [Validators.min(0), Validators.max(10000)]],
    estado: ['PENDIENTE' as EstadoMantenimiento, Validators.required],
    id_autobus: [null as number | null, Validators.required]
  });

  constructor() {
    this.form.controls.fecha_inicio.valueChanges.subscribe(() => this.validarFechas());
    this.form.controls.fecha_fin.valueChanges.subscribe(() => this.validarFechas());
  }

  private validarFechas(): void {
    const inicio = this.form.controls.fecha_inicio.value;
    const fin = this.form.controls.fecha_fin.value;
    const controlFin = this.form.controls.fecha_fin;

    if (fin && inicio && fin < inicio) {
      controlFin.setErrors({ fechaFinInvalida: true });
    } else if (controlFin.hasError('fechaFinInvalida')) {
      controlFin.updateValueAndValidity({ onlySelf: true, emitEvent: false });
      const { fechaFinInvalida: _eliminado, ...restantes } = controlFin.errors ?? {};
      controlFin.setErrors(Object.keys(restantes).length > 0 ? restantes : null);
    }
  }

  ngOnInit() {
    this.cargarAutobuses();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.esEdicion.set(true);
      this.cargarMantenimiento(Number(id));
      return;
    }

    const autobus = this.route.snapshot.queryParamMap.get('autobus');
    if (autobus && !isNaN(Number(autobus))) {
      this.form.controls.id_autobus.setValue(Number(autobus));
    }
  }

  private rutaLista(): (string | { autobus: number })[] {
    const filtro = this.autobusFiltro();
    return filtro == null ? ['/main/mantenimientos'] : ['/main/mantenimientos', { autobus: filtro }];
  }

  autobusFiltro(): number | null {
    const autobus = this.route.snapshot.queryParamMap.get('autobus');
    return autobus && !isNaN(Number(autobus)) ? Number(autobus) : null;
  }

  private cargarAutobuses() {
    this.autobusService.listar().subscribe({
      next: (data) => this.autobuses.set(data),
      error: () => this.error.set('No se pudieron cargar los autobuses.')
    });
  }

  private cargarMantenimiento(id: number): void {
    this.loading.set(true);

    this.mantenimientoService.obtenerPorId(id).subscribe({
      next: (mantenimiento) => {
        this.form.patchValue({
          fecha_inicio: mantenimiento.fecha_inicio,
          fecha_fin: mantenimiento.fecha_fin ?? '',
          tipo_mantenimiento: mantenimiento.tipo_mantenimiento ?? '',
          descripcion: mantenimiento.descripcion ?? '',
          costo: mantenimiento.costo ?? null,
          estado: mantenimiento.estado ?? 'PENDIENTE',
          id_autobus: mantenimiento.id_autobus
        });

        // Contar otros mantenimientos activos del mismo autobús (para el aviso al cerrar)
        this.mantenimientoService.listar().subscribe({
          next: (todos) => {
            this.otrosMantenimientosActivos.set(
              todos.filter(
                (m) =>
                  m.id_autobus === mantenimiento.id_autobus &&
                  m.id_mantenimiento !== mantenimiento.id_mantenimiento &&
                  (m.estado === 'PENDIENTE' || m.estado === 'EN_PROCESO')
              ).length
            );
          },
        });

        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.error.set('No se pudo cargar el mantenimiento.');
      },
    });
  }

  mostrarAvisoOtrosMantenimientos(): boolean {
    const estado = this.form.controls.estado.value;
    return (
      this.esEdicion() &&
      (estado === 'COMPLETADO' || estado === 'CANCELADO') &&
      this.otrosMantenimientosActivos() > 0
    );
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    const datos = this.form.getRawValue();
    const payload: Partial<Mantenimiento> = {
      fecha_inicio: datos.fecha_inicio ?? '',
      fecha_fin: datos.fecha_fin || undefined,
      tipo_mantenimiento: datos.tipo_mantenimiento || undefined,
      descripcion: datos.descripcion || undefined,
      costo: datos.costo ? Number(datos.costo) : undefined,
      estado: (datos.estado as EstadoMantenimiento) ?? 'PENDIENTE',
      id_autobus: Number(datos.id_autobus)
    };

    if (this.esEdicion()) {
      const id = Number(this.route.snapshot.paramMap.get('id'));
      this.mantenimientoService.actualizar(id, payload).subscribe({
        next: () => this.router.navigate(this.rutaLista()),
        error: (err) => {
          this.loading.set(false);
          this.error.set(err.error?.mensaje ?? 'No se pudo actualizar el mantenimiento.');
        },
      });
      return;
    }

    this.mantenimientoService.crear(payload).subscribe({
      next: () => this.router.navigate(this.rutaLista()),
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.mensaje ?? 'No se pudo crear el mantenimiento.');
      },
    });
  }

  volver(): void {
    this.router.navigate(this.rutaLista());
  }

  mostrarError(campo: string): boolean {
    const control = this.form.get(campo);
    return !!control && control.invalid && control.touched;
  }

  soloTipoMantenimiento(): void {
    const control = this.form.controls.tipo_mantenimiento;
    const valor = control.value?.toString().replace(/[^\p{L}\s.'-]/gu, '').slice(0, 50) ?? '';
    control.setValue(valor, { emitEvent: false });
  }
}
