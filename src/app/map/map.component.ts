import { Component, OnInit, Output, EventEmitter} from '@angular/core';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit {
  @Output() myEvent = new EventEmitter<string>();
  constructor() { }

  ngOnInit() {
  }

  click() {
    // console.log('click');
    this.myEvent.emit('Bathroom');
  }
}
