import { Component, Input, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { HassService } from '../services/hass.service';
import { map, take, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { MatSnackBar } from '@angular/material';
import { SnackbarComponent } from '../snackbar/snackbar.component';

// Note for Z-Wave, I needed to set the following to see state_changed events on lights:
// zwave:
//   usb_path: /dev/ttyACM0
//   device_config_domain:
//     light:
//       refresh_value: true
//       delay: 1

@Component({
  selector: 'app-light',
  templateUrl: './light.component.html',
  styleUrls: ['./light.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class LightComponent implements OnInit, OnDestroy {
  brightness: number;
  private new_brightness: number;
  private unsub: Subject<any> = new Subject();
  private snackBarMsg: Subject<any> = new Subject();
  class: string;
  name: string;

  @Input('light_id') light_id: string;

  constructor(
    private hassService: HassService,
    public snackBar: MatSnackBar
  ) { }

  ngOnInit() {
    // initialize from states BehaviorSubject, take 2 because first is null
    this.hassService.states
      .pipe(take(2), map(entities => entities.find(x => x.entity_id === this.light_id)))
      .subscribe(entity => this.updateComponent(entity));

    // listen to state_changed events, unsubscribe when the component is destroyed
    this.hassService.state_changed
      .pipe(takeUntil(this.unsub))
      .subscribe(event => {
        if (event.entity_id === this.light_id) {
          this.updateComponent(event.new_state);
        }
      });
  }

  updateComponent(entity: any) {
    this.brightness = entity.attributes.brightness;
    this.name = entity.attributes.friendly_name;
    this.class = 'mat-fab mat-elevation-z7' + (this.brightness ? ' lit' : '');
  }

  onDragBegin(e) {
    this.snackBar.openFromComponent(SnackbarComponent, {
      panelClass: ['roboto-font'],
      data: this.snackBarMsg
    });
  }

  onDragEnd(e) {
    // console.log(e);
    const service_data = { entity_id: this.light_id };
    if (this.new_brightness < 0) {
      this.hassService.call('light', 'turn_off', service_data);
    } else {
      service_data['brightness'] = this.new_brightness;
      this.hassService.call('light', 'turn_on', service_data);
    }
    this.snackBar.dismiss();
  }

  onMoving(e) {
    if (e.y < 0) {
      this.new_brightness = -1;
    } else {
      this.new_brightness = Math.min(Math.round(Math.sqrt(e.y ** 2 + e.x ** 2) / 2), 100);
    }
    const new_val = (this.new_brightness >= 0) ? this.new_brightness + '%' : 'off';
    this.snackBarMsg.next('Set ' + this.name + ' lights to ' + new_val);
  }

  ngOnDestroy() {
    this.unsub.next();
    this.unsub.complete();
  }

}
