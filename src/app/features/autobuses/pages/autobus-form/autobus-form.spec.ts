import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AutobusForm } from './autobus-form';

describe('AutobusForm', () => {
  let component: AutobusForm;
  let fixture: ComponentFixture<AutobusForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AutobusForm],
      providers: [provideHttpClient(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(AutobusForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});