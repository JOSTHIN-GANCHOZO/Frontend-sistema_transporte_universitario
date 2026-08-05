import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { Router } from '@angular/router';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { Navbar } from './navbar';
import { Auth } from '../../../core/services/auth';

describe('Navbar', () => {
  let component: Navbar;
  let fixture: ComponentFixture<Navbar>;
  let auth: Auth;
  let router: Router;

  beforeEach(async () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_usuario');
    await TestBed.configureTestingModule({
      imports: [Navbar],
      providers: [provideHttpClient(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(Navbar);
    component = fixture.componentInstance;
    auth = TestBed.inject(Auth);
    router = TestBed.inject(Router);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('solicitarCierre', () => {
    it('abre el diálogo de confirmación sin cerrar la sesión', () => {
      localStorage.setItem('auth_token', 'token-de-prueba');
      const logoutSpy = vi.spyOn(auth, 'logout');

      component.solicitarCierre();

      expect(component.dialogoVisible()).toBe(true);
      expect(logoutSpy).not.toHaveBeenCalled();
      expect(localStorage.getItem('auth_token')).not.toBeNull();
    });

    it('el botón Cerrar sesión muestra el diálogo y mantiene el token', () => {
      localStorage.setItem('auth_token', 'token-de-prueba');
      const boton = fixture.nativeElement.querySelector('button.navbar__logout');

      boton.click();
      fixture.detectChanges();

      expect(component.dialogoVisible()).toBe(true);
      expect(fixture.nativeElement.querySelector('app-confirm-dialog')).toBeTruthy();
      expect(localStorage.getItem('auth_token')).not.toBeNull();
    });
  });

  describe('confirmarCierre', () => {
    beforeEach(() => {
      vi.spyOn(router, 'navigate').mockResolvedValue(true);
    });

    it('elimina la sesión y navega a /login cuando se confirma', () => {
      localStorage.setItem('auth_token', 'token-de-prueba');
      const logoutSpy = vi.spyOn(auth, 'logout');

      component.dialogoVisible.set(true);
      component.confirmarCierre();

      expect(logoutSpy).toHaveBeenCalled();
      expect(router.navigate).toHaveBeenCalledWith(['/login']);
      expect(component.dialogoVisible()).toBe(false);
    });

    it('el botón de confirmar del diálogo limpia el token', () => {
      localStorage.setItem('auth_token', 'token-de-prueba');

      component.solicitarCierre();
      fixture.detectChanges();
      const botonConfirmar = fixture.nativeElement.querySelector('.btn--danger');

      botonConfirmar.click();

      expect(localStorage.getItem('auth_token')).toBeNull();
      expect(component.dialogoVisible()).toBe(false);
    });
  });

  describe('cancelarCierre', () => {
    it('oculta el diálogo sin cerrar la sesión', () => {
      localStorage.setItem('auth_token', 'token-de-prueba');
      const logoutSpy = vi.spyOn(auth, 'logout');

      component.dialogoVisible.set(true);
      component.cancelarCierre();

      expect(component.dialogoVisible()).toBe(false);
      expect(logoutSpy).not.toHaveBeenCalled();
    });
  });
});
