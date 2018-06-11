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
    this.callService({ type: 'get_config' }, (resp: Object) => this.config = resp);
    this.callService({ type: 'get_states' }, (resp: Object) => this.states = resp);
  }

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

  callService(msg: Object, callback: (resp: Object) => any) {
    msg['id'] = + new Date();
    this.dataHandler[msg['id']] = callback;
    this.wsService.sendMessage(JSON.stringify(msg));
  }

}
