import { Component, Input, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { HassService } from '../services/hass.service';
import { map, take, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { MatSnackBar } from '@angular/material';
import { SnackbarComponent } from '../snackbar/snackbar.component';
import { NickNamePipe } from '../custom.pipe';

declare var Snap: any;
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
  providers: [ NickNamePipe ],
  encapsulation: ViewEncapsulation.None
})
export class LightComponent implements OnInit, OnDestroy {
  brightness: number;
  private new_brightness: number;
  private unsub: Subject<any> = new Subject();
  private snackBarMsg: Subject<any> = new Subject();
  name: string;
  private svg_text: any;
  private svg: any;

  @Input('light_id') light_id: string;

  constructor(
    private hassService: HassService,
    public snackBar: MatSnackBar,
    private nickName: NickNamePipe
  ) { }

  ngOnInit() {
    this.drawButton();

    // initialize from states BehaviorSubject
    this.hassService.states
      .pipe(take(1), map(entities => entities.find(x => x.entity_id === this.light_id)))
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

  drawButton() {
    const s = Snap('#svg-light');
    s.attr({ viewBox: '0 0 36 36' });
    this.svg_text = s.text(18, 8, '');
    this.svg_text.attr({ 'font-size': 10, 'text-anchor': 'middle' });
    const g = s.group();
    Snap.load('../../assets/iconmonstr-light-bulb-16.svg', (f) => {
      this.svg = f;
      g.append(f).transform('t6,12');
    });
    s.drag(
      this.onMove.bind(this),
      this.onStart.bind(this),
      this.onEnd.bind(this)
    );
  }

  updateComponent(entity: any) {
    this.brightness = entity.attributes.brightness;
    this.name = entity.attributes.friendly_name;
    this.svg_text.attr({'text': this.nickName.transform(this.name)});
  }

  onStart(e) {
    this.snackBar.openFromComponent(SnackbarComponent, {
      panelClass: ['roboto-font'],
      data: this.snackBarMsg
    });
  }

  onEnd(e) {
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

  onMove(dx, dy, x, y, e) {
    if (dy < 0) {
      this.new_brightness = -1;
    } else {
      this.new_brightness = Math.min(Math.round(Math.sqrt(dx ** 2 + dy ** 2) / 2), 100);
    }
    const new_val = (this.new_brightness >= 0) ? this.new_brightness + '%' : 'off';
    this.snackBarMsg.next('Set ' + this.name + ' lights to ' + new_val);
  }

  ngOnDestroy() {
    this.unsub.next();
    this.unsub.complete();
  }

}
