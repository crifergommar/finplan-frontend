import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WidgetAlertas } from './widget-alertas';

describe('WidgetAlertas', () => {
  let component: WidgetAlertas;
  let fixture: ComponentFixture<WidgetAlertas>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WidgetAlertas],
    }).compileComponents();

    fixture = TestBed.createComponent(WidgetAlertas);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
