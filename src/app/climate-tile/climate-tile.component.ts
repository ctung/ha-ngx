import { Component, OnInit, Inject, OnDestroy, ViewEncapsulation } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material';
import { BehaviorSubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

declare var Snap: any;

@Component({
  selector: 'app-climate-tile',
  templateUrl: './climate-tile.component.html',
  styleUrls: ['./climate-tile.component.css']
})
export class ClimateTileComponent implements OnInit, OnDestroy {
  data: BehaviorSubject<number> = new BehaviorSubject(0);
  temp: BehaviorSubject<number> = new BehaviorSubject(0);
  actTemp: any;
  setTemp: any;
  private unsub: Subject<any> = new Subject();

  constructor(public dialog: MatDialog) { }

  ngOnInit() {
    this.drawButton();
    this.temp
      .pipe(takeUntil(this.unsub))
      .subscribe(t => {
        console.log(t);
        if (t) {
          this.setTemp.attr({ text: t + '\u00B0' });
        } else {
          this.setTemp.attr({ text: 'OFF' });
        }
      });
  }

  ngOnDestroy() {
    this.unsub.next();
    this.unsub.complete();
  }

  drawButton() {
    const s = Snap('#svg-climate');
    // const shadow = s.filter(Snap.filter.shadow(0, 3, 0.5));
    s.attr({ viewBox: '0 0 100 100' });
    const bigCircle = s.circle(40, 60, 30);
    bigCircle.attr({ fill: '#808080' });
    this.actTemp = s.text(40, 72, '70\u00B0');
    this.actTemp.attr({ 'font-size': 28, 'fill': '#fff', 'text-anchor': 'middle' });
    const smallCircle = s.circle(70, 25, 20);
    smallCircle.attr({ fill: '#3f51b5' });
    this.setTemp = s.text(70, 32, '72\u00B0');
    this.setTemp.attr({ 'font-size': 18, fill: '#fff', 'text-anchor': 'middle' });
    const button = s.group(bigCircle, smallCircle, this.actTemp, this.setTemp);
    button.drag(
      this.onMove.bind(this),
      this.onStart.bind(this),
      this.onEnd.bind(this)
    );
  }

  onMove(dx, dy, x, y, e) { this.data.next(y); }
  onStart(x, y, e) {
    const dialogRef = this.dialog.open(ClimateDialogComponent, {
      width: '300px',
      height: '600px',
      panelClass: 'climate-dialog-container',
      data: this.data
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('closed');
      const offset = (window.innerHeight - 600) / 2;
      const i = Math.floor((500 - this.data.getValue() + offset) / 50);
      if (i >= 0 && i <= 9) {
        this.temp.next(i + 66);
      } else {
        this.temp.next(0);
      }
    });
  }
  onEnd(e) { this.dialog.closeAll(); }
}

@Component({
  selector: 'app-climate-dialog',
  template: `<svg id="svg-climate-dialog" width="100%" height="100%"></svg>`,
  styles: [` .climate-dialog-container .mat-dialog-container { padding: 0 } `],
  encapsulation: ViewEncapsulation.None
})
export class ClimateDialogComponent implements OnInit, OnDestroy {
  private setx = <any>[];
  private setx_t = <any>[];
  private colors = ['#3182bd', '#6baed6', '#bdd7e7', '#eff3ff', '#fff', '#ffffb2', '#fecc5c', '#fd8d3c', '#f03b20', '#bd0026'];
  private last_i = -1;
  private unsub: Subject<any> = new Subject();

  constructor(
    public dialogRef: MatDialogRef<ClimateDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit() {
    this.drawDial();
    this.data
      .pipe(takeUntil(this.unsub))
      .subscribe(y => {
        const offset = (window.innerHeight - 600) / 2;
        const i = Math.floor((500 - (y - offset)) / 50);
        if (i !== this.last_i && this.setx.length > i) {
          this.last_i = i;
          this.clearShadow();
          if (i >= 0) {
            this.setx[i].attr({ fill: this.colors[i] });
          }
        }
      });
  }

  ngOnDestroy() {
    this.unsub.next();
    this.unsub.complete();
  }

  clearShadow() {
    for (let i = 0; i < 10; i++) {
      this.setx[i].attr({ fill: '#808080' });
    }
  }

  drawDial() {
    const s = Snap('#svg-climate-dialog');
    // this.shadow = s.filter(Snap.filter.shadow(0, 0, 1));
    s.attr({ viewBox: '0 0 300 600' });
    const off = s.rect(0, 500, 300, 100);
    const def_font = {
      'font-size': 30,
      'fill': '#000',
      'font-family': 'Arial',
      'text-anchor': 'middle'
    };
    for (let i = 0; i < 10; i++) {
      this.setx[i] = s.rect(0, 450 - 50 * i, 300, 50);
      this.setx[i].attr({ fill: '#808080' });
      this.setx_t[i] = s.text(150, 485 - 50 * i, 66 + i + '\u00B0');
      this.setx_t[i].attr(def_font);
    }
    const off_t = s.text(150, 560, 'OFF');
    off_t.attr({
      'font-size': 30,
      'fill': '#fff',
      'font-family': 'Arial',
      'text-anchor': 'middle'
    });
  }

}
