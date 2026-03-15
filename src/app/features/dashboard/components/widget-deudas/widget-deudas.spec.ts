import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WidgetDeudas } from './widget-deudas';

describe('WidgetDeudas', () => {
  let component: WidgetDeudas;
  let fixture: ComponentFixture<WidgetDeudas>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WidgetDeudas],
    }).compileComponents();

    fixture = TestBed.createComponent(WidgetDeudas);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
