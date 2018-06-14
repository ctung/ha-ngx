import { Component, OnInit, ViewChild} from '@angular/core';
import { MatDrawer } from '@angular/material';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  room = 'Family Room';
  @ViewChild('drawer') drawer: MatDrawer;
  constructor( ) { }

  ngOnInit() {
  }

  parentMethod(e) {
    console.log('selected ' + e);
    this.room = e;
    this.drawer.close();
  }
}
