import { Component, OnInit, ViewChild} from '@angular/core';
import { MatDrawer, MatButton } from '@angular/material';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  room = 'Family Room';
  @ViewChild('drawer') drawer: MatDrawer;
  @ViewChild('home') homeButton: MatButton;
  constructor() { }

  ngOnInit() {
  }

  parentMethod(e) {
    console.log(e);
    this.room = e;
    this.drawer.toggle();
  }
}
