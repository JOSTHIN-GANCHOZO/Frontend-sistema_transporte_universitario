import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParadaForm } from './parada-form';

describe('ParadaForm', () => {
  let component: ParadaForm;
  let fixture: ComponentFixture<ParadaForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ParadaForm],
      providers: [provideHttpClient(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(ParadaForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
