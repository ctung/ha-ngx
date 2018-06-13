import { Component, OnInit, Output, EventEmitter } from '@angular/core';

declare var Snap: any;

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit {
  @Output() myEvent = new EventEmitter<string>();
  constructor() { }

  ngOnInit() {
    const s = Snap('#svgout');
    const g = s.group();
    const fplan = Snap.load('../../assets/cape_fplan2.svg', (f) => {
        g.append(f);
        s.select('#rect5204').click(() => this.myEvent.emit('kitchen') );
    });
  }

}
