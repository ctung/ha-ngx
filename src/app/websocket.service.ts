import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  ws: WebSocket;
  socket: Observable<string>;

  constructor() { }

  connect(ws_url: string) {
    if (!this.socket) {
      this.socket = this.create(ws_url);
    }
  }

  private create(ws_url: string): Observable<string> {
    // console.log('wsService connecting');
    this.ws = new WebSocket(ws_url + '/api/websocket');
    const socket = new Observable<string>(observer => {
      // this.ws.onopen = (event) => console.log(event);
      this.ws.onmessage = (event) => observer.next(event.data);
      this.ws.onerror = (event) => observer.error(event);
      this.ws.onclose = (event) => observer.complete();
    });
    return socket;
  }

  sendMessage(message: any) {
    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(message);
      console.log('sending: ' + message);
    }
  }

}
