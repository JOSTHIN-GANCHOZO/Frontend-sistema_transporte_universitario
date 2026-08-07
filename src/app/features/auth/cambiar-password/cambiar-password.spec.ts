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

  describe('validarPasswordFuerte', () => {
    it('rechaza contraseñas cortas, sin 2 números o sin punto', () => {
      const casosInvalidos = ['abc', 'clave123', 'abcdefgh', 'abcd1234', 'ab12cd.'];
      for (const valor of casosInvalidos) {
        component.form.controls.password.setValue(valor);
        expect(component.form.controls.password.invalid).toBe(true);
      }
    });

    it('acepta contraseñas con 8+ caracteres, 2+ números y un punto', () => {
      component.form.controls.password.setValue('clave123.');
      expect(component.form.controls.password.valid).toBe(true);
    });

    it('detecta la confirmación no coincidente aunque la contraseña sea válida', () => {
      component.form.controls.password.setValue('clave123.');
      component.form.controls.confirmacion.setValue('clave124.');
      expect(component.form.invalid).toBe(true);
    });

    it('expone el contador de caracteres y números en vivo', () => {
      component.form.controls.password.setValue('clave12');

      expect(component.longitud()).toBe(7);
      expect(component.cantidadNumeros()).toBe(2);
      expect(component.tienePunto()).toBe(false);
    });
  });

  describe('onSubmit', () => {
    it('actualiza la contraseña, limpia los campos y navega a /main', () => {
      const auth = TestBed.inject(Auth);
      const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
      vi.spyOn(auth, 'actualizarPassword').mockReturnValue(of({ mensaje: 'ok' }));

      component.form.controls.password.setValue('clave123.');
      component.form.controls.confirmacion.setValue('clave123.');
      component.onSubmit();

      expect(auth.actualizarPassword).toHaveBeenCalledWith(5, 'clave123.');
      expect(navigateSpy).toHaveBeenCalledWith(['/main']);
      expect(component.form.controls.password.value).toBe('');
      expect(component.form.controls.confirmacion.value).toBe('');
    });

    it('muestra error y no navega cuando falla el servidor', () => {
      const auth = TestBed.inject(Auth);
      const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
      vi.spyOn(auth, 'actualizarPassword').mockReturnValue(
        throwError(() => ({ error: { mensaje: 'La contraseña debe incluir al menos un punto (.).' } }))
      );

      component.form.controls.password.setValue('clave123.');
      component.form.controls.confirmacion.setValue('clave123.');
      component.onSubmit();

      expect(navigateSpy).not.toHaveBeenCalled();
      expect(component.error()).toContain('punto');
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