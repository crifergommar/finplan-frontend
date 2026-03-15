import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PresupuestoTabla } from './presupuesto-tabla';

describe('PresupuestoTabla', () => {
  let component: PresupuestoTabla;
  let fixture: ComponentFixture<PresupuestoTabla>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PresupuestoTabla],
    }).compileComponents();

    fixture = TestBed.createComponent(PresupuestoTabla);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
