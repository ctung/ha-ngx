import { Injectable } from '@angular/core';
import { WebsocketService } from './websocket.service';
import { BehaviorSubject } from 'rxjs';
import { filter, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class HassService {
  // store callbacks that can be run on socket responses, if the id matches
  private id = 0;

  // store the hass config and state
  // uses method from https://coryrylan.com/blog/angular-observable-data-services
  config: any;
  private _states: BehaviorSubject<any[]>;
  private dataStore: {
    states: any[]
  };

  constructor(
    private wsService: WebsocketService
  ) {
    this.dataStore = { states: [] };
    this._states = <BehaviorSubject<any[]>>new BehaviorSubject([]);
    this.loadStates();
  }

  get states() {
    return this._states.asObservable();
  }

  loadStates() {
    const myId = this.getId();
    this.wsService.socket
      .pipe(map(data => JSON.parse(data)), filter(json => json.id === myId), map(data => data.result))
      .subscribe(data => {
        // console.log(data);
        this.dataStore.states = data;
        this._states.next(Object.assign({}, this.dataStore).states);
      }, error => console.log('Could not load states'));
    this.wsService.sendMessage(JSON.stringify({ id: myId, type: 'get_states' }));
  }

  getId() {
    return (+ new Date()) * 1000 + this.id++ % 1000;
  }

}
