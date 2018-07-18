import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { HassService } from '../services/hass.service';
import { map, take } from 'rxjs/operators';
declare var Snap: any;

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit {
  @Output() myEvent = new EventEmitter<any>();

  constructor(
    private hassService: HassService
  ) { }

  ngOnInit() {
    const s = Snap('#svgout');
    const g = s.group();
    Snap.load('../../assets/fplan.svg', (f) => {
      g.append(f); // draw svg
      this.hassService.states
        .pipe(take(2), map(entities => entities.filter(entity => entity.entity_id.startsWith('group.')))) // get groups
        .subscribe(entities => {
          entities.forEach(entity => {
            const name = entity.entity_id.replace('group.', '');
            const shape = s.select('g[inkscape\\:label="' + name + '"]');
            if (shape) {
              shape.click(() =>
                this.myEvent.emit({ name: name, friendly_name: entity.attributes.friendly_name }));
            } // add click event
          });
        });
    });
  }

  onClick(e) {
    this.hassService.states
    .pipe(take(1), map(entities => entities.filter(entity => entity.entity_id === 'group.' + e)))
    .subscribe(entities => {
      if (entities.length === 1) {
        // console.log(entities[0]);
        this.myEvent.emit({ name: e, friendly_name: entities[0].attributes.friendly_name});
      }
    });
  }

}
