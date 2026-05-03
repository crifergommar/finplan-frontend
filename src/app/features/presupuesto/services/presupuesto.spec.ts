import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';

import { PresupuestoService } from './presupuesto';

describe('PresupuestoService', () => {
  let service: PresupuestoService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient()],
    });
    service = TestBed.inject(PresupuestoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
