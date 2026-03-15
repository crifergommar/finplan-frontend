import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CuotaLista } from './cuota-lista';

describe('CuotaLista', () => {
  let component: CuotaLista;
  let fixture: ComponentFixture<CuotaLista>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CuotaLista],
    }).compileComponents();

    fixture = TestBed.createComponent(CuotaLista);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
