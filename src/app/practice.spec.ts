import { TestBed } from '@angular/core/testing';

import { Practice } from './practice';

describe('Practice', () => {
  let service: Practice;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Practice);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
