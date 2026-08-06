import { HttpClient, provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { vi } from 'vitest';

import { Auth } from './auth';
import { LoginResponse, Usuario } from '../../features/usuarios/models/usuario.model';

const TOKEN_KEY = 'auth_token';
const USUARIO_KEY = 'auth_usuario';
const REQUIERE_CAMBIO_KEY = 'auth_requiere_cambio';

const usuarioActivo: Usuario = {
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
};

describe('Auth', () => {
  let service: Auth;

  beforeEach(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USUARIO_KEY);
    localStorage.removeItem(REQUIERE_CAMBIO_KEY);
    TestBed.configureTestingModule({
      providers: [provideHttpClient()],
    });
    service = TestBed.inject(Auth);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('logout', () => {
    it('limpia el token y el usuario del localStorage', () => {
      localStorage.setItem(TOKEN_KEY, 'token-de-prueba');
      localStorage.setItem(USUARIO_KEY, JSON.stringify(usuarioActivo));

      service.logout();

      expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
      expect(localStorage.getItem(USUARIO_KEY)).toBeNull();
    });

    it('resetea la señal de usuario actual a null', () => {
      localStorage.setItem(TOKEN_KEY, 'token-de-prueba');
      localStorage.setItem(USUARIO_KEY, JSON.stringify(usuarioActivo));

      service.logout();

      expect(service.usuarioActual()).toBeNull();
    });

    it('deja al usuario sin autenticar y sin rol', () => {
      localStorage.setItem(TOKEN_KEY, 'token-de-prueba');

      service.logout();

      expect(service.estaAutenticado()).toBe(false);
      expect(service.getToken()).toBeNull();
      expect(service.esAdministrador()).toBe(false);
      expect(service.rolActual()).toBeNull();
    });

    it('limpia la bandera de cambio de contraseña obligatoria', () => {
      localStorage.setItem(REQUIERE_CAMBIO_KEY, 'true');

      service.logout();

      expect(localStorage.getItem(REQUIERE_CAMBIO_KEY)).toBeNull();
    });
  });

  describe('requiereCambio', () => {
    it('devuelve true cuando la bandera está activa', () => {
      localStorage.setItem(REQUIERE_CAMBIO_KEY, 'true');

      expect(service.requiereCambio()).toBe(true);
    });

    it('devuelve false cuando la bandera no está activa', () => {
      expect(service.requiereCambio()).toBe(false);
    });
  });

  describe('login', () => {
    it('guarda la bandera cuando el servidor pide cambio de contraseña', () => {
      const http = TestBed.inject(HttpClient);
      const respuesta = { mensaje: 'ok', token: 'token-x', requiere_cambio: true, usuario: usuarioActivo } as LoginResponse;
      vi.spyOn(http, 'post').mockReturnValue(of(respuesta));

      service.login('admin@universidad.edu', 'clave').subscribe(() => {
        expect(localStorage.getItem(REQUIERE_CAMBIO_KEY)).toBe('true');
        expect(service.requiereCambio()).toBe(true);
      });
    });

    it('no marca la bandera cuando el cambio no es obligatorio', () => {
      const http = TestBed.inject(HttpClient);
      const respuesta = { mensaje: 'ok', token: 'token-x', requiere_cambio: false, usuario: usuarioActivo } as LoginResponse;
      vi.spyOn(http, 'post').mockReturnValue(of(respuesta));

      service.login('admin@institucion.edu', 'clave').subscribe(() => {
        expect(localStorage.getItem(REQUIERE_CAMBIO_KEY)).toBeNull();
        expect(service.requiereCambio()).toBe(false);
      });
    });
  });

  describe('actualizarPassword', () => {
    it('llama al endpoint y limpia la bandera', () => {
      const http = TestBed.inject(HttpClient);
      const putSpy = vi.spyOn(http, 'put').mockReturnValue(of({ mensaje: 'Contraseña actualizada correctamente.' }));
      localStorage.setItem(REQUIERE_CAMBIO_KEY, 'true');

      service.actualizarPassword(5, 'nueva123').subscribe(() => {
        expect(putSpy).toHaveBeenCalledWith(
          expect.stringContaining('/credenciales/usuario/5/password'),
          { password: 'nueva123' }
        );
        expect(localStorage.getItem(REQUIERE_CAMBIO_KEY)).toBeNull();
        expect(service.requiereCambio()).toBe(false);
      });
    });
  });
});