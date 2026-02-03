import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Navbside } from './navbside';

describe('Navbside', () => {
  let component: Navbside;
  let fixture: ComponentFixture<Navbside>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Navbside]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Navbside);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
