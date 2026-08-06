import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParadaList } from './parada-list';

describe('ParadaList', () => {
  let component: ParadaList;
  let fixture: ComponentFixture<ParadaList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ParadaList],
      providers: [provideHttpClient(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(ParadaList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
