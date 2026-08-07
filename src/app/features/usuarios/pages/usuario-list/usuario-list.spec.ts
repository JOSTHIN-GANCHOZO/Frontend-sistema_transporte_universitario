import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Auth } from '../../../../core/services/auth';
import { Usuario } from '../../models/usuario.model';
import { UsuarioList } from './usuario-list';

const adminPrincipal: Usuario = {
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
  es_admin_principal: true,
};

const segundoAdmin: Usuario = {
  ...adminPrincipal,
  id_usuario: 2,
  identificacion: '1300000001',
  nombres: 'Carlos',
  apellidos: 'García',
  correo: 'carlos@universidad.edu',
  es_admin_principal: true,
};

const pasajero: Usuario = {
  id_usuario: 3,
  identificacion: '1300000002',
  nombres: 'Ana',
  apellidos: 'Rodríguez',
  correo: 'ana@universidad.edu',
  telefono: null,
  tipo_usuario: 'ESTUDIANTE',
  id_rol: 2,
  Rol: { id_rol: 2, nombre: 'PASAJERO' },
  Credencial: { estado: 'ACTIVA' },
};

describe('UsuarioList', () => {
  let component: UsuarioList;
  let fixture: ComponentFixture<UsuarioList>;
  let auth: Auth;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [UsuarioList],
      providers: [provideHttpClient(), provideRouter([])],
    }).compileComponents();

    auth = TestBed.inject(Auth);
    fixture = TestBed.createComponent(UsuarioList);
    component = fixture.componentInstance;
    component.loading.set(false);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('noGestionable', () => {
    it('bloquea la gestión de la propia cuenta', () => {
      auth.usuarioActual.set(adminPrincipal);
      component.usuarios.set([adminPrincipal, pasajero]);

      expect(component.noGestionable(adminPrincipal)).toBe(true);
    });

    it('bloquea al único administrador principal activo del sistema', () => {
      auth.usuarioActual.set(adminPrincipal);
      component.usuarios.set([adminPrincipal, pasajero]);

      expect(component.noGestionable(adminPrincipal)).toBe(true);
    });

    it('permite gestionar al otro administrador principal cuando hay al menos dos activos', () => {
      auth.usuarioActual.set(adminPrincipal);
      component.usuarios.set([adminPrincipal, segundoAdmin, pasajero]);

      expect(component.noGestionable(adminPrincipal)).toBe(true);
      expect(component.noGestionable(segundoAdmin)).toBe(false);
    });

    it('permite gestionar a un pasajero aunque sea el último usuario', () => {
      auth.usuarioActual.set(adminPrincipal);
      component.usuarios.set([adminPrincipal, pasajero]);

      expect(component.noGestionable(pasajero)).toBe(false);
    });
  });

  describe('renderizado del botón Eliminar', () => {
    it('no muestra el botón Eliminar para la propia cuenta', () => {
      auth.usuarioActual.set(adminPrincipal);
      component.usuarios.set([adminPrincipal]);
      fixture.detectChanges();

      const botonesEliminar = fixture.nativeElement.querySelectorAll(
        'button.btn--danger-soft',
      );
      expect(botonesEliminar.length).toBe(0);
    });

    it('muestra el botón Eliminar para los usuarios gestionables', () => {
      auth.usuarioActual.set(adminPrincipal);
      component.usuarios.set([adminPrincipal, pasajero]);
      fixture.detectChanges();

      const botonesEliminar = fixture.nativeElement.querySelectorAll(
        'button.btn--danger-soft',
      );
      expect(botonesEliminar.length).toBe(1);
    });
  });
});