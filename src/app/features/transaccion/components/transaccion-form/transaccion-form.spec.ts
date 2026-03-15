import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransaccionForm } from './transaccion-form';

describe('TransaccionForm', () => {
  let component: TransaccionForm;
  let fixture: ComponentFixture<TransaccionForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TransaccionForm],
    }).compileComponents();

    fixture = TestBed.createComponent(TransaccionForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
