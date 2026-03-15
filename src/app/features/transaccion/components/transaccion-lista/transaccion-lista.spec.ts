import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransaccionLista } from './transaccion-lista';

describe('TransaccionLista', () => {
  let component: TransaccionLista;
  let fixture: ComponentFixture<TransaccionLista>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TransaccionLista],
    }).compileComponents();

    fixture = TestBed.createComponent(TransaccionLista);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
