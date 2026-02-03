import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Dashb } from './dashb';

describe('Dashb', () => {
  let component: Dashb;
  let fixture: ComponentFixture<Dashb>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Dashb]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Dashb);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
