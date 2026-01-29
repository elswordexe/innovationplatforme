import { TestBed } from '@angular/core/testing';

import { Idea } from './idea';

describe('Idea', () => {
  let service: Idea;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Idea);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
