import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AutobusList } from './autobus-list';

describe('AutobusList', () => {
  let component: AutobusList;
  let fixture: ComponentFixture<AutobusList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AutobusList],
      providers: [provideHttpClient(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(AutobusList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});