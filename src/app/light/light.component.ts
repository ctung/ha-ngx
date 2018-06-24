import { Component, Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { HassService } from '../hass.service';
import { map, take, filter } from 'rxjs/operators';

@Component({
  selector: 'app-light',
  templateUrl: './light.component.html',
  styleUrls: ['./light.component.css']
})
export class LightComponent implements OnInit {
  brightness = new FormControl();

  @Input('light_ids') light_ids: string[];
  @Input('name') name: string;

  constructor(
    private hassService: HassService
  ) { }

  ngOnInit() {
    // initialize the slider value to match the average of all lights in this group
    this.hassService.states
      .pipe(
        map(entities => entities.filter(x => this.light_ids.indexOf(x.entity_id) !== -1)),
        take(1))
      .subscribe(entities => {
        if (entities.length === 0) {
          this.brightness.setValue(0, {emitEvent: false});
        } else {
          let sum = 0;
          entities.map(e => sum += e.attributes.brightness); // take the average of all light brightness
          this.brightness.setValue(Math.round(sum / entities.length), {emitEvent: false});
        }
      });

    // on state changes, set the slider to match the new state
    this.hassService.state_changed
      .pipe(filter(x => this.light_ids.indexOf(x.entity_id) !== -1))
      .subscribe(x => {
        if (x.new_state.attributes.brightness !== this.brightness.value) {
          this.brightness.setValue(x.new_state.attributes.brightness, {emitEvent: false});
        }
      });

    // When the user changes the slider, send that change to hass
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
