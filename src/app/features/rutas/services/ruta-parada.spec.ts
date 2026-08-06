import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';

import { RutaParadaService } from './ruta-parada';

describe('RutaParadaService', () => {
  let service: RutaParadaService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient()],
    });
    service = TestBed.inject(RutaParadaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
