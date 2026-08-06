import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { Sidebar } from './sidebar';

describe('Sidebar', () => {
  let component: Sidebar;
  let fixture: ComponentFixture<Sidebar>;

  beforeEach(async () => {
    localStorage.removeItem('sidebar-colapsado');
    await TestBed.configureTestingModule({
      imports: [Sidebar],
      providers: [provideHttpClient(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(Sidebar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('plegado', () => {
    it('pliega al pulsar el botón y persiste el estado', () => {
      const boton = fixture.nativeElement.querySelector('button.sidebar__toggle');

      boton.click();
      fixture.detectChanges();

      expect(component.colapsado()).toBe(true);
      expect(localStorage.getItem('sidebar-colapsado')).toBe('true');
      expect(
        fixture.nativeElement
          .querySelector('aside.sidebar')
          .classList.contains('sidebar--colapsado')
      ).toBe(true);
    });
  });

  describe('drawer móvil', () => {
    it('muestra el fondo oscuro cuando está abierto', () => {
      fixture.componentRef.setInput('abierto', true);
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('.sidebar__backdrop')).toBeTruthy();
    });

    it('el clic en el fondo emite la petición de cierre', () => {
      const emitSpy = vi.spyOn(component.navegado, 'emit');
      fixture.componentRef.setInput('abierto', true);
      fixture.detectChanges();

      fixture.nativeElement.querySelector('.sidebar__backdrop').click();

      expect(emitSpy).toHaveBeenCalled();
    });
  });
});