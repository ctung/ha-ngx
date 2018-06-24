import { Component, OnInit, ViewChild} from '@angular/core';
import { MatDrawer } from '@angular/material';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  @ViewChild('drawer') drawer: MatDrawer;
  room: string;
  friendly_name: string;
  constructor( ) { }

  ngOnInit() {
    this.room = localStorage.getItem('room');
    this.friendly_name = localStorage.getItem('friendly_name');
    if (this.room == null) {
      this.drawer.open();
    }
  }

  parentMethod(e) {
    console.log('selected ' + e.friendly_name);
    this.room = e.name;
    this.friendly_name = e.friendly_name;
    localStorage.setItem('room', e.name);
    localStorage.setItem('friendly_name', e.friendly_name);
    this.drawer.close();
  }
}
