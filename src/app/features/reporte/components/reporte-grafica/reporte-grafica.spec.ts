import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReporteGrafica } from './reporte-grafica';

describe('ReporteGrafica', () => {
  let component: ReporteGrafica;
  let fixture: ComponentFixture<ReporteGrafica>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReporteGrafica],
    }).compileComponents();

    fixture = TestBed.createComponent(ReporteGrafica);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
