import { TestBed } from '@angular/core/testing';

import { Auth } from './auth';
import { Usuario } from '../../features/usuarios/models/usuario.model';

const TOKEN_KEY = 'auth_token';
const USUARIO_KEY = 'auth_usuario';

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
    TestBed.configureTestingModule({});
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
  });
});
