import { Component, OnChanges, Input, OnInit } from '@angular/core';
import { HassService } from '../hass.service';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-panel',
  templateUrl: './panel.component.html',
  styleUrls: ['./panel.component.css']
})
export class PanelComponent implements OnChanges, OnInit {
  light_ids: string[];
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
        this.getEntityIds('group.' + this.room, s);
        // console.log(this.light_groups);
      });
  }

  getEntityIds(group: string, states: any[]): any {
    // console.log(states);
    const entity = states.find(x => x.entity_id === group);
    if (entity) {
      this.light_ids = entity.attributes.entity_id.filter((x: string) => x.startsWith('light.'));
      // add more component types here
      // this.component_type_ids = entity.attributes_id.filter((x:string) => x.startsWith('component_type'));

    }
  }
}
