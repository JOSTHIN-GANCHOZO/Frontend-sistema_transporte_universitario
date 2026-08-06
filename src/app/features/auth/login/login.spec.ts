import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { Router } from '@angular/router';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { vi } from 'vitest';

import { Login } from './login';
import { Auth } from '../../../core/services/auth';
import { LoginResponse } from '../../usuarios/models/usuario.model';

const respuestaLogin = (requiere_cambio: boolean): LoginResponse => ({
  mensaje: 'ok',
  token: 'token-de-prueba',
  requiere_cambio,
  usuario: {
    id_usuario: 1,
    identificacion: '1312345678',
    nombres: 'Josthin',
    apellidos: 'Ganchozo',
    correo: 'admin@universidad.edu',
    telefono: null,
    tipo_usuario: 'ADMINISTRATIVO',
    id_rol: 1,
    Rol: { id_rol: 1, nombre: 'ADMINISTRATIVO' },
    Credencial: { estado: 'ACTIVA' },
  },
});

describe('Login', () => {
  let component: Login;
  let fixture: ComponentFixture<Login>;
  let router: Router;

  beforeEach(async () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_usuario');
    localStorage.removeItem('auth_requiere_cambio');
    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [provideHttpClient(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(Login);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('onSubmit', () => {
    it('navega a /cambiar-password cuando el servidor lo exige', () => {
      const auth = TestBed.inject(Auth);
      const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
      vi.spyOn(auth, 'login').mockReturnValue(of(respuestaLogin(true)));

      component.form.controls.correo.setValue('estudiante@universidad.edu');
      component.form.controls.password.setValue('clave123');
      component.onSubmit();

      expect(navigateSpy).toHaveBeenCalledWith(['/cambiar-password']);
    });

    it('navega a /main cuando no se requiere cambio', () => {
      const auth = TestBed.inject(Auth);
      const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
      vi.spyOn(auth, 'login').mockReturnValue(of(respuestaLogin(false)));

      component.form.controls.correo.setValue('admin@universidad.edu');
      component.form.controls.password.setValue('clave123');
      component.onSubmit();

      expect(navigateSpy).toHaveBeenCalledWith(['/main']);
    });
  });
});