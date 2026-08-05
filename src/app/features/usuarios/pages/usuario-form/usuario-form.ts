import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { Rol, TIPOS_USUARIO, Usuario } from '../../models/usuario.model';
import { UsuarioService } from '../../services/usuario';

@Component({
  selector: 'app-usuario-form',
  imports: [ReactiveFormsModule],
  templateUrl: './usuario-form.html',
  styleUrl: './usuario-form.css',
})
export class UsuarioForm {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly usuarioService = inject(UsuarioService);

  readonly tiposUsuario = TIPOS_USUARIO;
  readonly esEdicion = signal(false);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly roles = signal<Rol[]>([]);
  readonly creado = signal<Usuario | null>(null);
  readonly copiado = signal(false);

  readonly form = this.fb.group({
    identificacion: ['', Validators.required],
    nombres: ['', Validators.required],
    apellidos: ['', Validators.required],
    correo: ['', [Validators.required, Validators.email]],
    telefono: [''],
    tipo_usuario: ['', Validators.required],
    id_rol: [null as number | null, Validators.required],
  });

  constructor() {
    this.usuarioService.obtenerRoles().subscribe({
      next: (roles) => this.roles.set(roles),
      error: () => this.error.set('No se pudieron cargar los roles.'),
    });

    this.form.controls.id_rol.valueChanges.subscribe((idRol) => {
      const rol = this.roles().find((r) => r.id_rol === idRol);
      if (!rol) {
        return;
      }
      if (rol.nombre === 'ADMINISTRATIVO') {
        this.form.controls.tipo_usuario.setValue('ADMINISTRATIVO');
      } else if (rol.nombre === 'PASAJERO' && this.form.controls.tipo_usuario.value === 'ADMINISTRATIVO') {
        this.form.controls.tipo_usuario.setValue('ESTUDIANTE');
      }
    });

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.esEdicion.set(true);
      this.cargarUsuario(Number(id));
    }
  }

  private cargarUsuario(id: number): void {
    this.loading.set(true);

    this.usuarioService.obtenerUsuario(id).subscribe({
      next: (usuario) => {
        this.form.patchValue({
          identificacion: usuario.identificacion,
          nombres: usuario.nombres,
          apellidos: usuario.apellidos,
          correo: usuario.correo,
          telefono: usuario.telefono ?? '',
          tipo_usuario: usuario.tipo_usuario,
          id_rol: usuario.id_rol,
        });
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.error.set('No se pudo cargar el usuario.');
      },
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    const datos = this.form.getRawValue();
    const payload: Partial<Usuario> = {
      identificacion: datos.identificacion ?? '',
      nombres: datos.nombres ?? '',
      apellidos: datos.apellidos ?? '',
      correo: datos.correo ?? '',
      telefono: datos.telefono ?? '',
      tipo_usuario: (datos.tipo_usuario as Usuario['tipo_usuario']) ?? 'ESTUDIANTE',
      id_rol: Number(datos.id_rol),
    };

    if (this.esEdicion()) {
      const id = Number(this.route.snapshot.paramMap.get('id'));
      this.usuarioService.actualizarUsuario(id, payload).subscribe({
        next: () => this.router.navigate(['/main/usuarios']),
        error: (err) => {
          this.loading.set(false);
          this.error.set(err.error?.mensaje ?? 'No se pudo actualizar el usuario.');
        },
      });
      return;
    }

    this.usuarioService.crearUsuario(payload).subscribe({
      next: (usuario) => {
        this.loading.set(false);
        this.creado.set(usuario);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.mensaje ?? 'No se pudo crear el usuario.');
      },
    });
  }

  copiarCredencial(): void {
    const usuario = this.creado();
    if (!usuario) {
      return;
    }

    const texto = `Usuario: ${usuario.correo}\nContraseña temporal: ${usuario.password_temporal ?? usuario.identificacion}`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(texto).then(() => {
        this.copiado.set(true);
      });
    } else {
      const area = document.createElement('textarea');
      area.value = texto;
      document.body.appendChild(area);
      area.select();
      document.execCommand('copy');
      document.body.removeChild(area);
      this.copiado.set(true);
    }

    setTimeout(() => this.copiado.set(false), 2500);
  }

  finalizar(): void {
    this.router.navigate(['/main/usuarios']);
  }

  volver(): void {
    this.router.navigate(['/main/usuarios']);
  }

  mostrarError(campo: string): boolean {
    const control = this.form.get(campo);
    return !!control && control.invalid && control.touched;
  }
}
