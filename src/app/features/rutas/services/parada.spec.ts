import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';

import { ParadaService } from './parada';

describe('ParadaService', () => {
  let service: ParadaService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient()],
    });
    service = TestBed.inject(ParadaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});