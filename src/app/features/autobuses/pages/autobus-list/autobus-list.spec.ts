import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AutobusList } from './autobus-list';

describe('AutobusList', () => {
  let component: AutobusList;
  let fixture: ComponentFixture<AutobusList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AutobusList],
    }).compileComponents();

    fixture = TestBed.createComponent(AutobusList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
