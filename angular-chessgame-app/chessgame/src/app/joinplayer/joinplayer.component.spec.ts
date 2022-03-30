import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JoinplayerComponent } from './joinplayer.component';

describe('JoinplayerComponent', () => {
  let component: JoinplayerComponent;
  let fixture: ComponentFixture<JoinplayerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ JoinplayerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(JoinplayerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
