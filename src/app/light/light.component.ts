import { Component, Input, OnInit, OnDestroy, Inject } from '@angular/core';
import { FormControl } from '@angular/forms';
import { HassService } from '../hass.service';
import { map, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { MatSnackBar } from '@angular/material';
import { SnackbarComponent } from '../snackbar/snackbar.component';


@Component({
  selector: 'app-light',
  templateUrl: './light.component.html',
  styleUrls: ['./light.component.css']
})
export class LightComponent implements OnInit, OnDestroy {
  brightness: number;
  private new_brightness: number;
  private unsub: Subject<any> = new Subject();
  private snackBarMsg: Subject<any> = new Subject();

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
      });

  }

  onDragBegin(e) {
    this.snackBar.openFromComponent(SnackbarComponent, { data: this.snackBarMsg });
  }
  onDragEnd(e) {
    // console.log(e);
    const service = (this.new_brightness) ? 'turn_on' : 'turn_off';
      this.light_ids.map(entity_id => {
        const service_data = { entity_id: entity_id };
        if (this.new_brightness) { service_data['brightness'] = this.new_brightness; }
        this.hassService.call('light', service, service_data);
      });
    this.snackBar.dismiss();
  }

  onMoving(e) {
    this.new_brightness = Math.min(Math.round(Math.sqrt(e.y ** 2 + e.x ** 2) / 2), 100);
    this.snackBarMsg.next('Set ' + this.name + ' to ' + this.new_brightness + '%');
  }

  ngOnDestroy() {
    this.unsub.next();
    this.unsub.complete();
  }

}
