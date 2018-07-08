import { Component, OnChanges, Input, OnInit } from '@angular/core';
import { HassService } from '../hass.service';
import { take, first } from 'rxjs/operators';

@Component({
  selector: 'app-panel',
  templateUrl: './panel.component.html',
  styleUrls: ['./panel.component.css']
})
export class PanelComponent implements OnChanges, OnInit {
  light_ids: string[];
  @Input('room') room: string;

  constructor(
    private hassService: HassService
  ) {
  }

  ngOnInit() {
    this.update();
  }

  ngOnChanges() {
    this.update();
  }

  update() {
    this.hassService.getEntityIds('group.' + this.room)
      .subscribe(x => this.light_ids = x.filter(y => y.startsWith('light.')));
  }
}
