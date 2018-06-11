import { Component, OnInit, ViewChild} from '@angular/core';
import { MatDrawer } from '@angular/material';
import { HassService } from '../hass.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  room = 'Family Room';
  @ViewChild('drawer') drawer: MatDrawer;
  constructor(
    private hassService: HassService
  ) { }

  ngOnInit() {
  }

  parentMethod(e) {
    console.log(e);
    this.room = e;
    this.drawer.toggle();
  }
}
