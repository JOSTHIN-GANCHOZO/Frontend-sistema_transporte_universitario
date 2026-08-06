import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MainLayout } from './main-layout';

describe('MainLayout', () => {
  let component: MainLayout;
  let fixture: ComponentFixture<MainLayout>;

  beforeEach(async () => {
    localStorage.removeItem('sidebar-colapsado');
    await TestBed.configureTestingModule({
      imports: [MainLayout],
      providers: [provideHttpClient(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(MainLayout);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('menú móvil', () => {
    it('la hamburguesa abre el drawer', () => {
      const boton = fixture.nativeElement.querySelector('button.navbar__menu');

      boton.click();
      fixture.detectChanges();

      expect(component.sidebarAbierto()).toBe(true);
      expect(
        fixture.nativeElement
          .querySelector('app-sidebar aside.sidebar')
          .classList.contains('sidebar--abierto')
      ).toBe(true);
    });

    it('el clic en el fondo cierra el drawer', () => {
      component.sidebarAbierto.set(true);
      fixture.detectChanges();

      const fondo = fixture.nativeElement.querySelector('.sidebar__backdrop');
      expect(fondo).toBeTruthy();

      fondo.click();
      fixture.detectChanges();

      expect(component.sidebarAbierto()).toBe(false);
    });
  });
});