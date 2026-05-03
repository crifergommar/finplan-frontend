import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { PresupuestoTabla } from './presupuesto-tabla';
import { PresupuestoService } from '../../services/presupuesto';
import { TransaccionService } from '../../../transaccion/services/transaccion';

describe('PresupuestoTabla', () => {
  let component: PresupuestoTabla;
  let fixture: ComponentFixture<PresupuestoTabla>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PresupuestoTabla],
      providers: [
        {
          provide: PresupuestoService,
          useValue: {
            obtenerPorAnio: () => of({ data: null, mensaje: 'OK', status: 200, timestamp: '' }),
          },
        },
        {
          provide: TransaccionService,
          useValue: {
            listar: () => of({ data: [], mensaje: 'OK', status: 200, timestamp: '' }),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PresupuestoTabla);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
