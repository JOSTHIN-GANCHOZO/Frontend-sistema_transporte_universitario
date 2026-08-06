import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Mantenimiento } from '../../models/mantenimiento.model';
import { MantenimientoList } from './mantenimiento-list';

const listado: Mantenimiento[] = [
  {
    id_mantenimiento: 1,
    fecha_inicio: '2026-01-01',
    id_autobus: 2,
    estado: 'COMPLETADO',
    Autobus: {
      id_autobus: 2,
      placa: 'AUT-001',
      numero_interno: 'B-002',
      estado: 'EN_MANTENIMIENTO',
    } as never,
  } as unknown as Mantenimiento,
  {
    id_mantenimiento: 2,
    fecha_inicio: '2026-02-01',
    id_autobus: 4,
    estado: 'PENDIENTE',
    Autobus: {
      id_autobus: 4,
      placa: 'AUT-003',
      numero_interno: 'B-003',
      estado: 'DISPONIBLE',
    } as never,
  } as unknown as Mantenimiento,
];

function rutaPara(query: number | null): any {
  return {
    provide: ActivatedRoute,
    useValue: {
      snapshot: {
        paramMap: { get: () => undefined, has: () => false },
        queryParamMap: {
          get: (clave: string) => (clave === 'autobus' && query != null ? String(query) : null),
          has: (clave: string) => clave === 'autobus' && query != null,
        },
      },
    },
  };
}

describe('MantenimientoList', () => {
  let component: MantenimientoList;
  let fixture: ComponentFixture<MantenimientoList>;

  async function configurar(query: number | null): Promise<void> {
    await TestBed.configureTestingModule({
      imports: [MantenimientoList],
      providers: [provideHttpClient(), provideRouter([]), rutaPara(query)],
    }).compileComponents();

    fixture = TestBed.createComponent(MantenimientoList);
    component = fixture.componentInstance;
    component.mantenimientos.set(listado);
    component.loading.set(false);
    await fixture.whenStable();
  }

  it('should create', async () => {
    await configurar(null);
    expect(component).toBeTruthy();
  });

  it('sin query param no filtra la lista', async () => {
    await configurar(null);

    expect(component.autobusFiltro()).toBeNull();
    expect(component.mantenimientosFiltrados()).toEqual(listado);
  });

  it('con ?autobus= filtra solo los mantenimientos de ese autobús', async () => {
    await configurar(2);

    expect(component.autobusFiltro()).toBe(2);
    expect(component.mantenimientosFiltrados().length).toBe(1);
    expect(component.mantenimientosFiltrados()[0].id_autobus).toBe(2);
  });

  it('nombreAutobusFiltro muestra la placa del autobús filtrado', async () => {
    await configurar(2);

    expect(component.nombreAutobusFiltro()).toBe('AUT-001');
  });

  it('nombreAutobusFiltro muestra el fallback cuando el autobús no tiene registros', async () => {
    await configurar(9);

    expect(component.nombreAutobusFiltro()).toBe('Autobús #9');
  });
});