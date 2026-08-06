import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';

import { ConductorService } from './conductor';

describe('ConductorService', () => {
  let service: ConductorService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient()],
    });
    service = TestBed.inject(ConductorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});