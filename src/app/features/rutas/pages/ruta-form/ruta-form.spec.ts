import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RutaForm } from './ruta-form';

describe('RutaForm', () => {
  let component: RutaForm;
  let fixture: ComponentFixture<RutaForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RutaForm],
      providers: [provideHttpClient(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(RutaForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
