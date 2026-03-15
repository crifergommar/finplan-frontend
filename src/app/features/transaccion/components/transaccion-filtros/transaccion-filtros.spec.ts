import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransaccionFiltros } from './transaccion-filtros';

describe('TransaccionFiltros', () => {
  let component: TransaccionFiltros;
  let fixture: ComponentFixture<TransaccionFiltros>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TransaccionFiltros],
    }).compileComponents();

    fixture = TestBed.createComponent(TransaccionFiltros);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
