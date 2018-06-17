import { Component, Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { HassService } from '../hass.service';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-light',
  templateUrl: './light.component.html',
  styleUrls: ['./light.component.css']
})
export class LightComponent implements OnInit {
  brightness = new FormControl();

  @Input('light_ids') light_ids: string[];

  constructor(
    private hassService: HassService
  ) { }

  ngOnInit() {
    this.hassService.states
      .pipe(map(entities => entities.filter(entity => this.light_ids.indexOf(entity.entity_id) !== -1))) // get all lights for this room
      .subscribe(entities => {
        if (entities.length === 0) {
          this.brightness.setValue(0, {emitEvent: false});
        } else {
          let sum = 0;
          entities.map(e => sum += e.attributes.brightness); // take the average of all light brightness
          this.brightness.setValue(Math.round(sum / entities.length), {emitEvent: false});
        }
      });

    this.brightness.valueChanges.subscribe(val => {
      const service = (val) ? 'turn_on' : 'turn_off';
      this.light_ids.map(entity_id => {
        const service_data = { entity_id: entity_id };
        if (val) { service_data['brightness'] = val; }
        this.hassService.call('light', service, service_data);
      });
    });
  }

}
