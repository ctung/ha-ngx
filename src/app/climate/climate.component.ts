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
    ambient_temperature: 72.5,
    target_temperature: 70.5,
    inProgress: false
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
    setTimeout(() => {
      this._state.inProgress = true;
      this.state.next(this._state);
    }, 1000);
    // console.log(e);
  }

  onDragEnd(e) {
    this.dialog.closeAll();
    this._state.inProgress = false;
    this.state.next(this._state);
    // console.log(e);
  }

  onMove(e) {
    const temp = (window.innerHeight - e[3]) / window.innerHeight * (this.options.maxValue - this.options.minValue) + this.options.minValue;
    this._state.target_temperature = Math.round(temp * 2) / 2;
    if (this._state.target_temperature > this._state.ambient_temperature + 1) {
      this._state.hvac_state = 'heating';
    } else if (this._state.target_temperature < this._state.ambient_temperature - 1) {
      this._state.hvac_state = 'cooling';
    } else {
      this._state.hvac_state = 'off';
    }
    this.state.next(this._state);
    // console.log(e);
  }
}
