import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { TransaccionFormComponent } from './transaccion-form';
import { CategoriaService } from '../../../categoria/services/categoria';
import { TransaccionService } from '../../services/transaccion';
import { provideRouter } from '@angular/router';

describe('TransaccionFormComponent', () => {
  let component: TransaccionFormComponent;
  let fixture: ComponentFixture<TransaccionFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TransaccionFormComponent],
      providers: [
        provideRouter([]),
        {
          provide: CategoriaService,
          useValue: {
            listar: () => of([]),
          },
        },
        {
          provide: TransaccionService,
          useValue: {
            crear: () => of(null),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TransaccionFormComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
