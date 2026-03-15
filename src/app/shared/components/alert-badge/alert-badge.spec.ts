import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlertBadge } from './alert-badge';

describe('AlertBadge', () => {
  let component: AlertBadge;
  let fixture: ComponentFixture<AlertBadge>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AlertBadge],
    }).compileComponents();

    fixture = TestBed.createComponent(AlertBadge);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
