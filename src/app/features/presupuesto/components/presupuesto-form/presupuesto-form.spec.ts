import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PresupuestoForm } from './presupuesto-form';

describe('PresupuestoForm', () => {
  let component: PresupuestoForm;
  let fixture: ComponentFixture<PresupuestoForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PresupuestoForm],
    }).compileComponents();

    fixture = TestBed.createComponent(PresupuestoForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
