import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VotedIdeaCardComponent } from './voted-idea-card.component';

describe('VotedIdeaCardComponent', () => {
  let component: VotedIdeaCardComponent;
  let fixture: ComponentFixture<VotedIdeaCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VotedIdeaCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VotedIdeaCardComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
