import { Component, OnChanges, Input } from '@angular/core';
import { HassService } from '../hass.service';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-panel',
  templateUrl: './panel.component.html',
  styleUrls: ['./panel.component.css']
})
export class PanelComponent implements OnChanges {
  light_ids: string[];
  @Input('room') room: string;

  constructor(
    private hassService: HassService
  ) {
    this.light_ids = [];
  }

  ngOnChanges() {
    this.hassService.states
      .pipe(take(1))
      .subscribe(s => {
        const entity = s.find(x => x.entity_id === 'group.' + this.room);
        if (entity) {
          entity.attributes.entity_id.map(e => {
            if (e.startsWith('light.') && this.light_ids.indexOf(e) === -1) {
              this.light_ids.push(e);
            }
          });
        }
      });
  }

}
