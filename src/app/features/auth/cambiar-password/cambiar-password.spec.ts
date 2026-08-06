import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { Router } from '@angular/router';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';

import { CambiarPassword } from './cambiar-password';
import { Auth } from '../../../core/services/auth';
import { Usuario } from '../../usuarios/models/usuario.model';

const usuarioActivo: Usuario = {
  id_usuario: 5,
  identificacion: '1312345678',
  nombres: 'Luis',
  apellidos: 'Cedeño',
  correo: 'luis.cedeno@universidad.edu',
  telefono: null,
  tipo_usuario: 'ESTUDIANTE',
  id_rol: 3,
  Rol: { id_rol: 3, nombre: 'PASAJERO' },
  Credencial: { estado: 'ACTIVA' },
};

describe('CambiarPassword', () => {
  let component: CambiarPassword;
  let fixture: ComponentFixture<CambiarPassword>;
  let router: Router;

  beforeEach(async () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_usuario');
    localStorage.removeItem('auth_requiere_cambio');
    localStorage.setItem('auth_token', 'token-de-prueba');
    localStorage.setItem('auth_requiere_cambio', 'true');
    localStorage.setItem('auth_usuario', JSON.stringify(usuarioActivo));
    await TestBed.configureTestingModule({
      imports: [CambiarPassword],
      providers: [provideHttpClient(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(CambiarPassword);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('onSubmit', () => {
    it('valida mínima longitud y confirmación coincidente', () => {
      component.form.controls.password.setValue('abc');
      component.form.controls.confirmacion.setValue('abc');

      expect(component.form.controls.password.invalid).toBe(true);
      component.form.controls.password.setValue('clave123');
      component.form.controls.confirmacion.setValue('clave124');
      expect(component.form.invalid).toBe(true);
    });

    it('actualiza la contraseña y navega a /main', () => {
      const auth = TestBed.inject(Auth);
      const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
      vi.spyOn(auth, 'actualizarPassword').mockReturnValue(of({ mensaje: 'ok' }));

      component.form.controls.password.setValue('clave123');
      component.form.controls.confirmacion.setValue('clave123');
      component.onSubmit();

      expect(auth.actualizarPassword).toHaveBeenCalledWith(5, 'clave123');
      expect(navigateSpy).toHaveBeenCalledWith(['/main']);
    });

    it('muestra error y no navega cuando falla el servidor', () => {
      const auth = TestBed.inject(Auth);
      const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
      vi.spyOn(auth, 'actualizarPassword').mockReturnValue(
        throwError(() => ({ error: { mensaje: 'La contraseña debe tener al menos 6 caracteres.' } }))
      );

      component.form.controls.password.setValue('clave123');
      component.form.controls.confirmacion.setValue('clave123');
      component.onSubmit();

      expect(navigateSpy).not.toHaveBeenCalled();
      expect(component.error()).toContain('al menos 6 caracteres');
    });
  });

  describe('cerrarSesion', () => {
    it('limpia la sesión y vuelve a /login', () => {
      const auth = TestBed.inject(Auth);
      const logoutSpy = vi.spyOn(auth, 'logout');
      const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

      component.cerrarSesion();

      expect(logoutSpy).toHaveBeenCalled();
      expect(navigateSpy).toHaveBeenCalledWith(['/login']);
    });
  });
});