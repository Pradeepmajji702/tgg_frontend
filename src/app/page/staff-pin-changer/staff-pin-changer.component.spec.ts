import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StaffPinChangerComponent } from './staff-pin-changer.component';

describe('StaffPinChangerComponent', () => {
  let component: StaffPinChangerComponent;
  let fixture: ComponentFixture<StaffPinChangerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StaffPinChangerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StaffPinChangerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
