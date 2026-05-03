import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { TransaccionLista } from './transaccion-lista';
import { TransaccionService } from '../../services/transaccion';
import { CategoriaService } from '../../../categoria/services/categoria';

describe('TransaccionLista', () => {
  let component: TransaccionLista;
  let fixture: ComponentFixture<TransaccionLista>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TransaccionLista],
      providers: [
        {
          provide: TransaccionService,
          useValue: {
            listar: () => of({ data: [], mensaje: 'OK', status: 200, timestamp: '' }),
            crear: () => of({ data: null, mensaje: 'OK', status: 201, timestamp: '' }),
            eliminar: () => of({ data: null, mensaje: 'OK', status: 200, timestamp: '' }),
          },
        },
        {
          provide: CategoriaService,
          useValue: {
            listar: () => of({ data: [], mensaje: 'OK', status: 200, timestamp: '' }),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TransaccionLista);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
