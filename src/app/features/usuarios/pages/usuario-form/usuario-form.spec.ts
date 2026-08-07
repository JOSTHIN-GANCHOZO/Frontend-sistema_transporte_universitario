import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsuarioForm } from './usuario-form';

describe('UsuarioForm', () => {
  let component: UsuarioForm;
  let fixture: ComponentFixture<UsuarioForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsuarioForm],
      providers: [provideHttpClient(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(UsuarioForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
