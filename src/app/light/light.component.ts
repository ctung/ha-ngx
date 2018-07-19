import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { HassService } from '../services/hass.service';
import { map, take, takeUntil } from 'rxjs/operators';
import { BehaviorSubject, Subject } from 'rxjs';
import { NickNamePipe } from '../custom.pipe';
import { MatDialog } from '@angular/material';
import { LightDialogComponent } from './light-dialog.component';


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
  styleUrls: ['./light.component.scss'],
  providers: [NickNamePipe]
})
export class LightComponent implements OnInit, OnDestroy {
  private brightness: BehaviorSubject<number> = new BehaviorSubject(-1);
  private unsub: Subject<any> = new Subject();
  private svg_text: any;
  private svg: any;

  @Input('light_id') light_id: string;

  constructor(
    private hassService: HassService,
    public dialog: MatDialog,
    // public snackBar: MatDialog,
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
    this.svg_text.attr({ 'font-size': 9, 'text-anchor': 'middle' });
    const g = s.group();
    Snap.load('../../assets/iconmonstr-light-bulb-16.svg', (f) => {
      this.svg = g.append(f).transform('t6,10');
      this.updateSvg(this.brightness.getValue());
    });
    s.drag(
      this.onMove.bind(this),
      this.onStart.bind(this),
      this.onEnd.bind(this)
    );
  }

  updateSvg(brightness: number) {
    if (this.svg) {
      this.svg.attr({ 'fill': (brightness > 0) ? '#ffe600' : '#808080' });
    }
  }

  updateComponent(entity: any) {
    this.brightness.next(entity.attributes.brightness);
    this.updateSvg(entity.attributes.brightness);
    this.svg_text.attr({ 'text': this.nickName.transform(entity.attributes.friendly_name) });
  }

  onStart(e) {
    this.dialog.open(LightDialogComponent, {
      width: '248px',
      height: '248px',
      panelClass: 'light-dialog-container',
      data: this.brightness
    });
  }

  onEnd(e) {
    const brightness = this.brightness.getValue();
    this.updateSvg(brightness);
    const service_data = { entity_id: this.light_id };
    if (brightness < 0) {
      this.hassService.call('light', 'turn_off', service_data);
    } else {
      service_data['brightness'] = brightness;
      this.hassService.call('light', 'turn_on', service_data);
    }
    this.dialog.closeAll();
  }

  onMove(dx, dy, x, y, e) {
    // console.log([y, window.innerHeight * 0.8 - y]);
    this.brightness.next( Math.min(Math.round(100 * (window.innerHeight * 0.7 - y) / (window.innerHeight * 0.4)), 100));
    // this.brightness.next(dy < 0 ? -1 : Math.min(Math.round(Math.sqrt(dx ** 2 + dy ** 2) / 2), 100));
  }

  ngOnDestroy() {
    this.unsub.next();
    this.unsub.complete();
  }

}


