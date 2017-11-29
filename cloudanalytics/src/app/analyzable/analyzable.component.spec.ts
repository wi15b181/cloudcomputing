import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AnalyzableComponent } from './analyzable.component';

describe('AnalyzableComponent', () => {
  let component: AnalyzableComponent;
  let fixture: ComponentFixture<AnalyzableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AnalyzableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AnalyzableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
