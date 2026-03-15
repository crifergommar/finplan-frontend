import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CategoriaSelector } from './categoria-selector';

describe('CategoriaSelector', () => {
  let component: CategoriaSelector;
  let fixture: ComponentFixture<CategoriaSelector>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategoriaSelector],
    }).compileComponents();

    fixture = TestBed.createComponent(CategoriaSelector);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
