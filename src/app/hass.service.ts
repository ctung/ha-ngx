import { Injectable } from '@angular/core';
import { WebsocketService } from './websocket.service';

@Injectable({
  providedIn: 'root'
})
export class HassService {
  // store callbacks that can be run on socket responses, if the id matches
  private dataHandler = {};

  // store the hass config and state
  config: any;
  states: any;

  constructor(
    private wsService: WebsocketService
  ) {
    this.socketHandler();
    // initialize the config and states
    this.callService({ type: 'get_config' }, (resp: Object) => this.config = resp);
    this.callService({ type: 'get_states' }, (resp: Object) => this.states = resp);
    // TODO: add handlers for state changes
    // TODO: subscribe to state change events
  }

  // Observe all messages coming from the socket
  // If the response has a callback stored that matches the id, then call the callback on the response.results
  socketHandler() {
    this.wsService.getSocket()
      .subscribe(data => {
        const resp = JSON.parse(data);
        console.log(resp);
        if (resp.hasOwnProperty('id') && resp.type === 'result' && this.dataHandler.hasOwnProperty(resp.id)) {
          this.dataHandler[resp.id](resp.results);
          delete this.dataHandler[resp.id];
        }
      });
  }

  // call a service
  // msg is an object that is serialized and sent to hass
  // id is created based on the current timestamp and attached to the msg
  // callback is a function that should be run on the socket response that matches the id
  callService(msg: Object, callback: (resp: Object) => any) {
    msg['id'] = + new Date();
    this.dataHandler[msg['id']] = callback;
    this.wsService.sendMessage(JSON.stringify(msg));
  }

}
