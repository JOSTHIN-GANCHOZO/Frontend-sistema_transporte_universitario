import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Auth } from '../../../../core/services/auth';
import { Usuario } from '../../../usuarios/models/usuario.model';
import { Viaje } from '../../models/viaje.model';
import { ViajeDetail } from './viaje-detail';

const viajeProgramado: Viaje = {
  id_viaje: 1,
  fecha: '2026-08-10',
  hora_salida: '07:00:00',
  id_ruta: 1,
  id_autobus: 1,
  id_conductor: 1,
  estado: 'PROGRAMADO',
  cupos_disponibles: 10,
  Ruta: {
    id_ruta: 1,
    codigo: 'R-01',
    nombre: 'Campus → Centro',
    origen: 'Campus',
    destino: 'Centro',
  },
  Autobus: {
    id_autobus: 1,
    placa: 'ABC-1234',
    numero_interno: '1',
    marca: 'Yutong',
    modelo: 'ZK6128',
    capacidad_maxima: 40,
    estado: 'DISPONIBLE',
  },
  Conductor: {
    id_conductor: 1,
    identificacion: '1312345678',
    nombres: 'Juan',
    apellidos: 'Pérez',
    numero_licencia: 'L-001',
    fecha_vencimiento_licencia: '2030-01-01',
  },
  Reservas: [
    { id_reserva: 1, numero_asiento: 3, estado: 'CONFIRMADA', id_viaje: 1 },
    { id_reserva: 2, numero_asiento: 7, estado: 'CANCELADA', id_viaje: 1 },
  ],
};

const pasajero: Usuario = {
  id_usuario: 5,
  identificacion: '1300000001',
  nombres: 'Ana',
  apellidos: 'Rodríguez',
  correo: 'ana@universidad.edu',
  telefono: null,
  tipo_usuario: 'ESTUDIANTE',
  id_rol: 2,
  Rol: { id_rol: 2, nombre: 'PASAJERO' },
  Credencial: { estado: 'ACTIVA' },
};

const admin: Usuario = {
  ...pasajero,
  tipo_usuario: 'ADMINISTRATIVO',
  id_rol: 1,
  Rol: { id_rol: 1, nombre: 'ADMINISTRATIVO' },
};

describe('ViajeDetail', () => {
  let component: ViajeDetail;
  let fixture: ComponentFixture<ViajeDetail>;
  let auth: Auth;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [ViajeDetail],
      providers: [provideHttpClient(), provideRouter([])],
    }).compileComponents();

    auth = TestBed.inject(Auth);
    fixture = TestBed.createComponent(ViajeDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('puedeReservar', () => {
    it('permite reservar a un pasajero en un viaje PROGRAMADO con cupos', () => {
      auth.usuarioActual.set(pasajero);
      component.viaje.set(viajeProgramado);

      expect(component.puedeReservar()).toBe(true);
    });

    it('bloquea la reserva a un administrador', () => {
      auth.usuarioActual.set(admin);
      component.viaje.set(viajeProgramado);

      expect(component.puedeReservar()).toBe(false);
    });

    it('bloquea la reserva cuando el viaje no está PROGRAMADO', () => {
      auth.usuarioActual.set(pasajero);
      component.viaje.set({ ...viajeProgramado, estado: 'FINALIZADO' });

      expect(component.puedeReservar()).toBe(false);
    });

    it('bloquea la reserva cuando no quedan cupos', () => {
      auth.usuarioActual.set(pasajero);
      component.viaje.set({ ...viajeProgramado, cupos_disponibles: 0 });

      expect(component.puedeReservar()).toBe(false);
    });
  });

  describe('asientosOcupados', () => {
    it('cuenta solo las reservas activas', () => {
      component.viaje.set(viajeProgramado);

      expect(component.asientosOcupados()).toBe(1);
      expect(component.asientosOcupadosLista()).toEqual([3]);
    });

    it('devuelve lista vacía cuando no hay reservas activas', () => {
      component.viaje.set({
        ...viajeProgramado,
        Reservas: [{ id_reserva: 2, numero_asiento: 7, estado: 'CANCELADA', id_viaje: 1 }],
      });

      expect(component.asientosOcupados()).toBe(0);
      expect(component.asientosOcupadosLista()).toEqual([]);
    });
  });

  describe('panel de asientos', () => {
    it('genera tantos asientos como la capacidad del autobús', () => {
      component.viaje.set(viajeProgramado);

      expect(component.asientos().length).toBe(40);
    });

    it('marca como ocupado solo los asientos con reservas activas', () => {
      component.viaje.set(viajeProgramado);

      const asientos = component.asientos();
      expect(asientos.find((a) => a.numero === 3)?.ocupado).toBe(true);
      expect(asientos.find((a) => a.numero === 4)?.ocupado).toBe(false);
      expect(asientos.find((a) => a.numero === 1)?.ocupado).toBe(false);
    });

    it('no genera asientos cuando el autobús no tiene capacidad', () => {
      component.viaje.set({ ...viajeProgramado, Autobus: null });

      expect(component.asientos()).toEqual([]);
    });

    it('selecciona y deselecciona un asiento libre', () => {
      component.viaje.set(viajeProgramado);

      component.seleccionarAsiento(4);
      expect(component.asientoSeleccionado()).toBe(4);

      component.seleccionarAsiento(4);
      expect(component.asientoSeleccionado()).toBeNull();
    });

    it('cambia de asiento seleccionado a uno nuevo (uno solo)', () => {
      component.viaje.set(viajeProgramado);

      component.seleccionarAsiento(4);
      component.seleccionarAsiento(5);
      expect(component.asientoSeleccionado()).toBe(5);
    });

    it('ignora los asientos ocupados', () => {
      component.viaje.set(viajeProgramado);

      component.seleccionarAsiento(3);
      expect(component.asientoSeleccionado()).toBeNull();
    });

    it('muestra error si se envía sin seleccionar asiento', () => {
      component.viaje.set(viajeProgramado);

      expect(component.mostrarErrorAsiento()).toBe(false);
      component.onSubmit();
      expect(component.asientoSeleccionado()).toBeNull();
      expect(component.mostrarErrorAsiento()).toBe(true);
    });
  });

  describe('confirmación de la reserva', () => {
    it('parte sin reserva confirmada', () => {
      expect(component.reservaCreada()).toBeNull();
    });

    it('expone la reserva confirmada con sus datos clave', () => {
      component.reservaCreada.set({
        id_reserva: 42,
        fecha: '2026-08-10',
        numero_asiento: 3,
        estado: 'CONFIRMADA',
        id_viaje: 1,
      });

      const reserva = component.reservaCreada();
      expect(reserva?.id_reserva).toBe(42);
      expect(reserva?.numero_asiento).toBe(3);
      expect(reserva?.estado).toBe('CONFIRMADA');
    });
  });
});