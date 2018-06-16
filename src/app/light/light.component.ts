import { Component, Input } from '@angular/core';
import { FormControl } from '@angular/forms';
import { HassService } from '../hass.service';

@Component({
  selector: 'app-light',
  templateUrl: './light.component.html',
  styleUrls: ['./light.component.css']
})
export class LightComponent {
  lights = new FormControl();
  @Input('light_ids') light_ids: string[];

  constructor(
    private hassService: HassService
  ) { }

  onclick(event: any) {
    const service = (event.value) ? 'turn_on' : 'turn_off';
    this.light_ids.map(entity_id => {
      const service_data = {entity_id: entity_id};
      if (event.value) { service_data['brightness'] = event.value; }
      this.hassService.call('light', service, service_data);
    });
  }

}
