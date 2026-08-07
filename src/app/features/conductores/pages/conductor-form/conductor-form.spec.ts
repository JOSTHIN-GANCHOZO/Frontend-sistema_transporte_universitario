import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConductorForm } from './conductor-form';

describe('ConductorForm', () => {
  let component: ConductorForm;
  let fixture: ComponentFixture<ConductorForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConductorForm],
      providers: [provideHttpClient(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(ConductorForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});