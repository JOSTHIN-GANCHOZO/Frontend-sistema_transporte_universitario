import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { CanActivateFn, provideRouter } from '@angular/router';

import { cambioPasswordGuard } from './cambio-password-guard';

describe('cambioPasswordGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => cambioPasswordGuard(...guardParameters));

  beforeEach(() => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_requiere_cambio');
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideRouter([])],
    });
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });

  it('redirige a /cambiar-password cuando se debe cambiar la contraseña', () => {
    localStorage.setItem('auth_token', 'token-de-prueba');
    localStorage.setItem('auth_requiere_cambio', 'true');

    const resultado = executeGuard({} as never, {} as never);

    expect(resultado).toBeInstanceOf(Object);
    expect((resultado as { toString: () => string }).toString()).toContain('cambiar-password');
  });

  it('permite el acceso cuando no se requiere cambio de contraseña', () => {
    localStorage.setItem('auth_token', 'token-de-prueba');

    expect(executeGuard({} as never, {} as never)).toBe(true);
  });
});