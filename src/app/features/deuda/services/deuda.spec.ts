import { TestBed } from '@angular/core/testing';

import { Deuda } from './deuda';

describe('Deuda', () => {
  let service: Deuda;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Deuda);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
