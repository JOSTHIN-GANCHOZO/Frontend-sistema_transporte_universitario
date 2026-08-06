import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReservaForm } from './reserva-form';

describe('ReservaForm', () => {
  let component: ReservaForm;
  let fixture: ComponentFixture<ReservaForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReservaForm],
      providers: [provideHttpClient(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(ReservaForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});