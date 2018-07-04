import { Component, Input, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { HassService } from '../hass.service';
import { map, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { MatSnackBar } from '@angular/material';
import { SnackbarComponent } from '../snackbar/snackbar.component';


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

    this.hassService.states
      .pipe(
        takeUntil(this.unsub),
        map(entities => entities.find(x => x.entity_id === this.light_id))
      )
      .subscribe(entity => {
        console.log(entity);
        this.brightness = entity.attributes.brightness;
        this.name = entity.attributes.friendly_name;
        if (this.brightness) {
          this.class = 'mat-fab mat-elevation-z7 lit';
        } else {
          this.class = 'mat-fab mat-elevation-z7';
        }
      });

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
      this.hassService.call('light', 'turn_on', service_data); // some hacky workaround for websocket not triggering status change
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
