import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WidgetResumenMes } from './widget-resumen-mes';

describe('WidgetResumenMes', () => {
  let component: WidgetResumenMes;
  let fixture: ComponentFixture<WidgetResumenMes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WidgetResumenMes],
    }).compileComponents();

    fixture = TestBed.createComponent(WidgetResumenMes);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
