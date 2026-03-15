import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlertaLista } from './alerta-lista';

describe('AlertaLista', () => {
  let component: AlertaLista;
  let fixture: ComponentFixture<AlertaLista>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AlertaLista],
    }).compileComponents();

    fixture = TestBed.createComponent(AlertaLista);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
