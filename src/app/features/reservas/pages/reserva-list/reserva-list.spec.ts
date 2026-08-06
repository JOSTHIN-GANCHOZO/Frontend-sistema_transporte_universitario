import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReservaList } from './reserva-list';

describe('ReservaList', () => {
  let component: ReservaList;
  let fixture: ComponentFixture<ReservaList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReservaList],
      providers: [provideHttpClient(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(ReservaList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});