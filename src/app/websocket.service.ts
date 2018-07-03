import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { BehaviorSubject } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  ws: WebSocket;
  socket: Observable<string>;
  private _readystate: BehaviorSubject<any>;

  constructor() {
    this._readystate = <BehaviorSubject<any>>new BehaviorSubject([]);
  }

  connect() {
    if (!this.socket || this.ws.readyState !== WebSocket.OPEN) {
      this.socket = this.create();
    }
  }

  private create(): Observable<string> {
    // console.log('wsService connecting');
    this.ws = new WebSocket(environment.ws_url);
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
