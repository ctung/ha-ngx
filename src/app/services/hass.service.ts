import { Injectable, OnInit } from '@angular/core';
import { WebsocketService } from './websocket.service';
import { BehaviorSubject, Subject, Observable } from 'rxjs';
import { map, filter, find, take, first } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class HassService implements OnInit {
  // store callbacks that can be run on socket responses, if the id matches
  private id = 0;
  private msgHandler: any = {};

  // store the hass config and state
  // uses method from https://coryrylan.com/blog/angular-observable-data-services
  private _states: BehaviorSubject<any[]>;
  private _services: BehaviorSubject<any[]>;
  private _config: BehaviorSubject<any>;
  private _panels: BehaviorSubject<any>;
  private _state_changed: Subject<any>;
  private dataStore: {
    states: any[],
    services: any[],
    config: any,
    panels: any
  };

  constructor(
    private wsService: WebsocketService
  ) {
    this.dataStore = { states: [], services: [], config: {}, panels: {} };
    this._states = <BehaviorSubject<any[]>>new BehaviorSubject([]);
    this._services = <BehaviorSubject<any[]>>new BehaviorSubject([]);
    this._config = <BehaviorSubject<any>>new BehaviorSubject([]);
    this._panels = <BehaviorSubject<any>>new BehaviorSubject([]);
    this._state_changed = <Subject<any>>new Subject();
    this.socketHandler();
    this.load('states', this._states);
    this.load('services', this._services);
    this.load('config', this._config);
    this.load('panels', this._config);
    this.subscribe_state_changed();
    /*
    this.call('light', 'turn_off', {
      entity_id: 'light.ge_unknown_type5044_id3038_level',
      brightness: 0
    });
    */
  }

  ngOnInit() {
  }

  get states() { return this._states.asObservable(); }
  get services() { return this._services.asObservable(); }
  get config() { return this._config.asObservable(); }
  get panels() { return this._panels.asObservable(); }
  get state_changed() { return this._state_changed.asObservable(); }

  // initialize dataStore states, services and config
  private load(varName: string, bs: any) {
    const myId = (+ new Date()) * 1000 + this.id++ % 1000;
    const msg = { id: myId, type: 'get_' + varName };
    this.msgHandler[myId] = (data) => {
      this.dataStore[varName] = data.result;
      bs.next(Object.assign({}, this.dataStore)[varName]);
    };
    this.wsService.sendMessage(JSON.stringify(msg));
  }

  // subscribe to state_changed events
  private subscribe_state_changed() {
    const myId = (+ new Date()) * 1000 + this.id++ % 1000;
    const msg = { id: myId, type: 'subscribe_events', event_type: 'state_changed' };
    this.wsService.sendMessage(JSON.stringify(msg));
  }

  // call service
  call(domain: string, service: string, service_data?: any) {
    const myId = (+ new Date()) * 1000 + this.id++ % 1000;
    const msg = { id: myId, type: 'call_service', domain: domain, service: service };
    if (service_data) { msg['service_data'] = service_data; }
    // console.log(msg);
    this.wsService.sendMessage(JSON.stringify(msg));
  }

  // subscribe to the websocket and process incoming messages
  private socketHandler() {
    this.wsService.socket
      .pipe(map(data => JSON.parse(data)))
      .subscribe(data => {
        console.log(data);
        // run callbacks that match msgId
        if (this.msgHandler.hasOwnProperty(data.id)) { this.msgHandler[data.id](data); }
        // emit state_changed event, update dataStore and emit new states event
        if (data.type === 'event' && data.event.event_type === 'state_changed') {
          // console.log(data.event.data);
          this._state_changed.next(Object.assign({}, data.event).data);
          const state = this.dataStore.states.find(x => x.entity_id === data.event.data.entity_id);
          if (state) {
            state.attributes = data.event.data.new_state.attributes;
            state.state = data.event.data.new_state.state;
          }
          this._states.next(Object.assign({}, this.dataStore).states);
        }

      });
  }

  // return entity_ids for a particular group as an observable
  getEntityIds(group: string): Observable<string[]> {
    return this._states.asObservable()
      .pipe(
        filter(x => x.length > 0),
        map(x => x.find(y => y.entity_id === group)),
        map(x => x ? x.attributes.entity_id : null)
      );
  }

}
