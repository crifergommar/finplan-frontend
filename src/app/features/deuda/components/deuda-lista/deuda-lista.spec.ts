import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeudaLista } from './deuda-lista';

describe('DeudaLista', () => {
  let component: DeudaLista;
  let fixture: ComponentFixture<DeudaLista>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeudaLista],
    }).compileComponents();

    fixture = TestBed.createComponent(DeudaLista);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
