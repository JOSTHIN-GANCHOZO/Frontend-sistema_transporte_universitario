import { TestBed } from '@angular/core/testing';

import { Autobus } from './autobus';

describe('Autobus', () => {
  let service: Autobus;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Autobus);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
