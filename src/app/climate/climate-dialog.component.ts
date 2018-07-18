import { Component, OnInit, OnDestroy, Inject, ViewEncapsulation } from '@angular/core';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';

@Component({
  selector: 'app-climate-dialog',
  templateUrl: './climate-dialog.component.html',
  styleUrls: ['./climate-dialog.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ClimateDialogComponent implements OnInit, OnDestroy {
  private unsub: Subject<any> = new Subject();

  options = {
    diameter: 400,
    minValue: 55,
    maxValue: 80,
    numTicks: 150,
  };
/*
  state = {
    away: false,
    has_leaf: true,
    hvac_state: 'off',
    ambient_temperature: 15.5,
    target_temperature: 20.5
  };
  */
  constructor(
    public dialogRef: MatDialogRef<ClimateDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public state: any
  ) { }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.unsub.next();
    this.unsub.complete();
  }
}

/*
export class LightDialogComponent implements OnInit, OnDestroy {
  private unsub: Subject<any> = new Subject();
  private arc: any;
  private center: number;
  private radius: number;
  private s: any;
  percent: string;

  constructor(
    public dialogRef: MatDialogRef<LightDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit() {
    this.drawDial();
    this.data
      .pipe(takeUntil(this.unsub))
      .subscribe(y => {
        this.updateDial(y);
        this.percent = (y < 0) ? 'OFF' : y + '%';
      });
  }



  private drawDial() {
    const canvasSize = 200;
    this.center = canvasSize / 2;
    this.radius = canvasSize * 0.8 / 2;
    this.s = Snap('#svg-light-dialog');
    const path = '';
    this.arc = this.s.path(path);
  }

  private updateDial(percent: number) {
    const endpoint = Math.max(percent * 270 / 100, 0);
    this.arc.remove();
    const dr = endpoint + 135;
    const largeArc = endpoint > 180 ? 1 : 0;
    const path = 'M' + this.getXY(135) + 'A' + this.radius + ',' + this.radius + ' 0 ' + largeArc + ',1 ' + this.getXY(dr);
    this.arc = this.s.path(path);
    this.arc.attr({
      stroke: '#fff',
      fill: 'none',
      strokeWidth: 12
    });
  }

  private getXY(degrees: number) {
    const radians = Math.PI * degrees / 180;
    const x = this.center + this.radius * Math.cos(radians);
    const y = this.center + this.radius * Math.sin(radians);
    return x + ',' + y;
  }

}
*/
