import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';

import { AutobusService } from './autobus';

describe('AutobusService', () => {
  let service: AutobusService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient()],
    });
    service = TestBed.inject(AutobusService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});