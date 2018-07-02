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

  @Input('light_ids') light_ids: string[];
  @Input('name') name: string;

  constructor(
    private hassService: HassService,
    public snackBar: MatSnackBar
  ) { }

  ngOnInit() {
    this.hassService.states
      .pipe(takeUntil(this.unsub), map(entities => entities.filter(x => this.light_ids.indexOf(x.entity_id) !== -1)))
      .subscribe(entities => {
        // console.log(this.light_ids);
        // console.log(entities);
        let sum = 0;
        entities.map(e => sum += e.attributes.brightness); // take the average of all light brightness
        this.brightness = Math.round(sum / entities.length);
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
    this.light_ids.map(entity_id => {
      const service_data = { entity_id: entity_id };
      if (this.new_brightness < 0) {
        this.hassService.call('light', 'turn_off', service_data);
      } else {
        service_data['brightness'] = this.new_brightness;
        this.hassService.call('light', 'turn_on', service_data);
      }
    });
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
