import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Auth } from '../../core/services/auth';
import { Autobus } from '../autobuses/models/autobus.model';
import { Usuario } from '../usuarios/models/usuario.model';
import { Viaje } from '../viajes/models/viaje.model';
import { Dashboard } from './dashboard';

const API = 'http://localhost:3000/api';

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

const autobusDisponible: Autobus = {
  id_autobus: 1,
  placa: 'PIT-123',
  numero_interno: 'A-01',
  capacidad_maxima: 40,
  estado: 'DISPONIBLE',
};

const autobusServicio: Autobus = {
  ...autobusDisponible,
  id_autobus: 2,
  placa: 'PIT-456',
  numero_interno: 'A-02',
  estado: 'EN_SERVICIO',
};

const viajeProgramado: Viaje = {
  id_viaje: 1,
  fecha: '2026-08-10',
  hora_salida: '07:30',
  id_ruta: 1,
  id_autobus: 1,
  id_conductor: 1,
  estado: 'PROGRAMADO',
  cupos_disponibles: 20,
  Ruta: {
    id_ruta: 1,
    codigo: 'RT-1',
    nombre: 'Campus Norte',
    origen: 'Centro',
    destino: 'Campus',
  },
  Autobus: autobusDisponible,
};

const viajeEnRecorrido: Viaje = {
  ...viajeProgramado,
  id_viaje: 2,
  estado: 'EN_RECORRIDO',
  cupos_disponibles: 5,
};

describe('Dashboard', () => {
  let component: Dashboard;
  let fixture: ComponentFixture<Dashboard>;
  let auth: Auth;
  let http: HttpTestingController;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [Dashboard],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    auth = TestBed.inject(Auth);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
  });

  function crearComponente(usuario: Usuario): void {
    auth.usuarioActual.set(usuario);
    fixture = TestBed.createComponent(Dashboard);
    component = fixture.componentInstance;
  }

  function responderPasajero(): void {
    http.expectOne(`${API}/viajes`).flush([]);
    http.expectOne(`${API}/reservas`).flush([]);
  }

  function responderAdmin(): void {
    http.expectOne(`${API}/viajes`).flush([viajeProgramado, viajeEnRecorrido]);
    http.expectOne(`${API}/reservas`).flush([]);
    http.expectOne(`${API}/autobuses`).flush([autobusDisponible, autobusServicio]);
    http.expectOne(`${API}/mantenimientos`).flush([]);
    http.expectOne(`${API}/usuarios`).flush([adminPrincipal, pasajero]);
    http.expectOne(`${API}/conductores`).flush([]);
    http.expectOne(`${API}/rutas`).flush([]);
  }

  it('should create y carga el resumen de un pasajero', () => {
    crearComponente(pasajero);
    fixture.detectChanges();
    responderPasajero();
    fixture.detectChanges();

    expect(component).toBeTruthy();
    expect(component.loading()).toBe(false);
  });

  it('un pasajero solo consulta viajes y sus reservas', () => {
    crearComponente(pasajero);
    fixture.detectChanges();
    responderPasajero();
    fixture.detectChanges();

    expect(component.autobuses().length).toBe(0);
    const texto = fixture.nativeElement.textContent as string;
    expect(texto).toContain('Mis reservas');
    expect(texto).toContain('Viajes disponibles');
    expect(texto).not.toContain('Estado de la flota');
    expect(texto).not.toContain('Últimos usuarios');
  });

  it('un administrador carga los endpoints administrativos', () => {
    crearComponente(adminPrincipal);
    fixture.detectChanges();
    responderAdmin();
    fixture.detectChanges();

    expect(component.autobuses().length).toBe(2);
    expect(component.usuarios().length).toBe(2);
    const texto = fixture.nativeElement.textContent as string;
    expect(texto).toContain('Estado de la flota');
    expect(texto).toContain('Mantenimientos en curso');
    expect(texto).toContain('Últimos usuarios');
  });

  it('calcula los conteos de viajes activos y próximos', () => {
    crearComponente(adminPrincipal);
    fixture.detectChanges();
    responderAdmin();
    fixture.detectChanges();

    expect(component.viajesActivos()).toBe(1);
    expect(component.viajesProgramados()).toBe(1);
    expect(component.viajesProximos().length).toBe(2);
    expect(component.proximaSalida()?.id_viaje).toBe(1);
  });

  it('calcula la composición de la flota', () => {
    crearComponente(adminPrincipal);
    fixture.detectChanges();
    responderAdmin();
    fixture.detectChanges();

    expect(component.flotaTotal()).toBe(2);
    expect(component.autobusesDisponibles()).toBe(1);
    expect(component.autobusesEnServicio()).toBe(1);
    expect(component.porcentajeFlota(1)).toBe(50);
    expect(component.flotaBarras().length).toBe(4);
  });

  it('muestra error cuando falla una consulta', () => {
    crearComponente(adminPrincipal);
    fixture.detectChanges();

    http.expectOne(`${API}/viajes`).flush([]);
    http.expectOne(`${API}/reservas`).flush([]);
    http.expectOne(`${API}/autobuses`).flush([]);
    http.expectOne(`${API}/mantenimientos`).flush([]);
    http.expectOne(`${API}/usuarios`).flush([]);
    http.expectOne(`${API}/conductores`).flush([]);
    http
      .expectOne(`${API}/rutas`)
      .flush({ mensaje: 'error' }, { status: 500, statusText: 'Error' });
    fixture.detectChanges();

    expect(component.loading()).toBe(false);
    expect(component.error()).toBeTruthy();
  });
});