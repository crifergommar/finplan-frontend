import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeudaForm } from './deuda-form';

describe('DeudaForm', () => {
  let component: DeudaForm;
  let fixture: ComponentFixture<DeudaForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeudaForm],
    }).compileComponents();

    fixture = TestBed.createComponent(DeudaForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
