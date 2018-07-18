import { Component, Inject, ViewEncapsulation } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';

@Component({
  selector: 'app-climate-dialog',
  templateUrl: './climate-dialog.component.html',
  styleUrls: ['./climate-dialog.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ClimateDialogComponent {

  options = {
    diameter: 400,
    minValue: 65,
    maxValue: 75,
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

}

