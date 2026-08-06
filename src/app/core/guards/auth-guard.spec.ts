import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { CanActivateFn, provideRouter } from '@angular/router';

import { authGuard } from './auth-guard';

describe('authGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => authGuard(...guardParameters));

  beforeEach(() => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_usuario');
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideRouter([])],
    });
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });

  it('redirige a /login cuando no hay sesión', () => {
    const resultado = executeGuard({} as never, {} as never);

    expect(resultado).toBeInstanceOf(Object);
    expect((resultado as { toString: () => string }).toString()).toContain('login');
  });

  it('permite el acceso cuando existe un token', () => {
    localStorage.setItem('auth_token', 'token-de-prueba');

    expect(executeGuard({} as never, {} as never)).toBe(true);
  });
});
