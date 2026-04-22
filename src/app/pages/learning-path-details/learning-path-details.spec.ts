import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LearningPathDetails } from './learning-path-details';

describe('LearningPathDetails', () => {
  let component: LearningPathDetails;
  let fixture: ComponentFixture<LearningPathDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LearningPathDetails],
    }).compileComponents();

    fixture = TestBed.createComponent(LearningPathDetails);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
