import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  ws: WebSocket;
  socket: Observable<string>;

  constructor() { }

  connect(): void {
    console.log('connecting');
    this.ws = new WebSocket(environment.ws_url);
    this.socket = new Observable(observer => {
      this.ws.onmessage = (event) => observer.next(event.data);
      this.ws.onerror = (event) => observer.error(event);
      this.ws.onclose = (event) => observer.complete();
    });
  }

  sendMessage(message: any) {
    this.ws.send(message);
    console.log('sending: ' + message);
  }

}
