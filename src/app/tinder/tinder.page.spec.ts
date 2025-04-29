import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TinderPage } from './tinder.page';

describe('TinderPage', () => {
  let component: TinderPage;
  let fixture: ComponentFixture<TinderPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(TinderPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
