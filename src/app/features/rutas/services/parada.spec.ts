import { TestBed } from '@angular/core/testing';

import { Parada } from './parada';

describe('Parada', () => {
  let service: Parada;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Parada);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
