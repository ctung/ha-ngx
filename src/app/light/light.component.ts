import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { HassService } from '../hass.service';
import { map, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-light',
  templateUrl: './light.component.html',
  styleUrls: ['./light.component.css']
})
export class LightComponent implements OnInit, OnDestroy {
  private brightness = new FormControl();
  private unsub: Subject<any> = new Subject();

  @Input('light_ids') light_ids: string[];
  @Input('name') name: string;

  constructor(
    private hassService: HassService
  ) { }

  ngOnInit() {
    this.hassService.states
      .pipe(takeUntil(this.unsub), map(entities => entities.filter(x => this.light_ids.indexOf(x.entity_id) !== -1)))
      .subscribe(entities => {
        // console.log(this.light_ids);
        // console.log(entities);
        let sum = 0;
        entities.map(e => sum += e.attributes.brightness); // take the average of all light brightness
        const new_brightness = Math.round(sum / entities.length);
        if (this.brightness.value !== new_brightness) { this.brightness.setValue(new_brightness, { emitEvent: false }); }
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

  ngOnDestroy() {
    this.unsub.next();
    this.unsub.complete();
  }

}
