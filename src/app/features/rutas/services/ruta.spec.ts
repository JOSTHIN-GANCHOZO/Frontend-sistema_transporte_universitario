import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';

import { RutaService } from './ruta';

describe('RutaService', () => {
  let service: RutaService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient()],
    });
    service = TestBed.inject(RutaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});