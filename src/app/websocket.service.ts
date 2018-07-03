import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BehaviorSubject } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  ws: WebSocket;
  socket: Observable<string>;
  private _readystate = new BehaviorSubject<number>(0);

  constructor() { }

  connect(ws_url: string): Observable<string> {
    if (!this.socket || !this.ws || this.ws.readyState !== WebSocket.OPEN) {
      this.socket = this.create(ws_url);
    }
    return this.socket;
  }

  private create(ws_url: string): Observable<string> {
    // console.log('wsService connecting');
    this.ws = new WebSocket(ws_url + '/api/websocket');
    this._readystate.next(this.ws.readyState);
    const socket = new Observable<string>(observer => {
      this.ws.onopen = () => this._readystate.next(this.ws.readyState);
      this.ws.onmessage = (event) => observer.next(event.data);
      this.ws.onerror = (event) => observer.error(event);
      this.ws.onclose = () => {
        this._readystate.next(this.ws.readyState);
        observer.complete();
      };
    });
    return socket;
  }

  get readystate() { return this._readystate.asObservable(); }

  sendMessage(message: any) {
    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(message);
      // console.log('sending: ' + message);
    }
  }

}
