import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';

import { ViajeService } from './viaje';

describe('ViajeService', () => {
  let service: ViajeService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient()],
    });
    service = TestBed.inject(ViajeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});