import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LogLista } from './log-lista';

describe('LogLista', () => {
  let component: LogLista;
  let fixture: ComponentFixture<LogLista>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LogLista],
    }).compileComponents();

    fixture = TestBed.createComponent(LogLista);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
