import { Component, OnInit } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { MatDialog } from '@angular/material';
import { ClimateDialogComponent } from './climate-dialog.component';


@Component({
  selector: 'app-climate',
  templateUrl: './climate.component.html',
  styleUrls: ['./climate.component.scss']
})
export class ClimateComponent implements OnInit {
  public state: BehaviorSubject<any> = new BehaviorSubject({});

  private _state = {
    away: false,
    has_leaf: false,
    hvac_state: 'cooling',
    ambient_temperature: 75.5,
    target_temperature: 70.5
  };

  options = {
    diameter: 400,
    minValue: 65,
    maxValue: 75,
    numTicks: 100,
  };


  constructor(
    public dialog: MatDialog
  ) { }

  ngOnInit() {
    this.state.next(this._state);
  }

  onDragBegin(e) {
    this.dialog.open(ClimateDialogComponent, {
      width: '300px',
      height: '300px',
      panelClass: 'climate-dialog-container',
      data: this.state
    });
    // console.log(e);
  }

  onDragEnd(e) {
    this.dialog.closeAll();
    // console.log(e);
  }

  onMove(e) {
    const temp = e[2] / window.innerWidth * (this.options.maxValue - this.options.minValue) + this.options.minValue;
    this._state.target_temperature = Math.round(temp * 2) / 2;
    if (this._state.target_temperature > this._state.ambient_temperature) {
      this._state.hvac_state = 'heating';
    } else {
      this._state.hvac_state = 'cooling';
    }
    this.state.next(this._state);
    // console.log(e);
  }
}
