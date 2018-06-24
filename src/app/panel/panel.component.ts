import { Component, OnChanges, Input, OnInit } from '@angular/core';
import { HassService } from '../hass.service';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-panel',
  templateUrl: './panel.component.html',
  styleUrls: ['./panel.component.css']
})
export class PanelComponent implements OnChanges, OnInit {
  light_groups: any;
  @Input('room') room: string;

  constructor(
    private hassService: HassService
  ) {
  }

  ngOnChanges() {
    this.updateControls(1);
  }

  ngOnInit() {
    this.updateControls(2); // take 2 because first one is before init of states
  }

  updateControls(cnt: number) {
    this.hassService.states
      .pipe(take(cnt))
      .subscribe(s => {
        this.light_groups = this.getEntityIds('group.' + this.room, s);
        console.log(this.light_groups);
      });
  }

  getEntityIds(group: string, states: any[]): any {
    // console.log(states);
    const entity = states.find(x => x.entity_id === group);
    const result = [];
    if (entity) {
      entity.attributes.entity_id.map(e => {
        if (e.startsWith('light.') && result.indexOf(e) === -1) {
          result.push(e);
        }
        if (e.startsWith('group.')) {
          result.push(this.getEntityIds(e, states));
        }
      });
      return {
        entity_id: entity.entity_id,
        name: entity.attributes.friendly_name,
        entities: result
      };
    }
  }
}
