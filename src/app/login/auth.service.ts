import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { User } from './user';
import { WebsocketService } from '../websocket.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private loggedIn = new BehaviorSubject<boolean>(false);
  needs_api_password = false;
  connected = false;
  private api_password: string;

  get isLoggedIn() {
    return this.loggedIn.asObservable();
  }

  constructor(
    private router: Router,
    private wsService: WebsocketService
  ) { }


  socketHandler(data: string) {
    const resp = JSON.parse(data);
    this.connected = true;
    // console.log(data);
    switch (resp.type) {
      case 'auth_ok':
        this.loggedIn.next(true);
        this.router.navigate(['/']);
        break;
      case 'auth_required':
        if (this.api_password) {
          this.wsService.sendMessage(JSON.stringify({ type: 'auth', api_password: this.api_password }));
        } else {
          this.loggedIn.next(false);
          this.needs_api_password = true;
          this.router.navigate(['/login']);
        }
        break;
      case 'auth_invalid':
        alert(resp.message);
        localStorage.removeItem('api_password');
        this.connected = false;
        this.loggedIn.next(false);
        this.router.navigate(['/login']);
    }
  }

  login(user: User) {
    // console.log(user);
    if (user.ws_url != null && user.ws_url !== '' && (this.wsService.ws == null || this.wsService.ws.readyState !== 1)) {
      // console.log('connecting');
      localStorage.setItem('ws_url', user.ws_url);
      this.wsService.connect(user.ws_url).subscribe(data => this.socketHandler(data));
    }
    if (user.password != null && user.password !== '') {
      this.api_password = user.password;
      localStorage.setItem('api_password', user.password);
      this.wsService.sendMessage(JSON.stringify({ type: 'auth', api_password: user.password }));
    }
  }

  logout() {
    localStorage.removeItem('api_password');
    this.loggedIn.next(false);
    this.router.navigate(['/login']);
  }
}
