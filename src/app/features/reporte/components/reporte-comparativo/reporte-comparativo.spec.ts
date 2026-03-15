import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReporteComparativo } from './reporte-comparativo';

describe('ReporteComparativo', () => {
  let component: ReporteComparativo;
  let fixture: ComponentFixture<ReporteComparativo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReporteComparativo],
    }).compileComponents();

    fixture = TestBed.createComponent(ReporteComparativo);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
