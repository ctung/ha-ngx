import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-light-tile',
  templateUrl: './light-tile.component.html',
  styleUrls: ['./light-tile.component.css']
})
export class LightTileComponent implements OnInit {
  @Input('light_ids') light_ids: string[];
  colspan = 3;
  rowspan = 1;

  constructor() { }

  ngOnInit() {
    // console.log(this.light_ids);
  }

  get diagnostic() {
    return JSON.stringify(this.light_ids);
  }

}
