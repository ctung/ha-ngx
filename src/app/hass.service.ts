import { Injectable } from '@angular/core';
import { WebsocketService } from './websocket.service';

@Injectable({
  providedIn: 'root'
})
export class HassService {
  private dataHandler = {};
  config: any;
  states: any;

  constructor(
    private wsService: WebsocketService
  ) {
    this.socketHandler();
    this.getConfig();
    this.getStates();
  }

  socketHandler() {
    this.wsService.getSocket()
      .subscribe(data => {
        const obj = JSON.parse(data);
        console.log(obj);
        if (obj.hasOwnProperty('id') && this.dataHandler.hasOwnProperty(obj.id)) {
          this.dataHandler[obj.id](obj.results);
          delete this.dataHandler[obj.id];
        }
      });
  }

  callService(msg: Object, callback: (obj: Object) => void) {
    msg['id'] = + new Date();
    this.dataHandler[msg['id']] = callback;
    this.wsService.sendMessage(JSON.stringify(msg));
  }

  getConfig() {
    this.callService(
      { type: 'get_config' },
      function (obj: Object) {
        this.config = obj;
      });
  }

  getStates() {
    this.callService(
      { type: 'get_states' },
      function (obj: Object) {
        this.states = obj;
      });
  }

}
