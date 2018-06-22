import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { User } from './user';
import { WebsocketService } from '../websocket.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private loggedIn = new BehaviorSubject<boolean>(false);

  get isLoggedIn() {
    return this.loggedIn.asObservable();
  }

  constructor(
    private router: Router,
    private wsService: WebsocketService
  ) { }

  socketHandler(ws_url: string, api_password: string) {
    this.wsService.connect(ws_url)
      .subscribe(data => {
        const resp = JSON.parse(data);
        // console.log(data);
        switch (resp.type) {
          case 'auth_ok':
            this.loggedIn.next(true);
            this.router.navigate(['/']);
            break;
          case 'auth_required':
            if (api_password) {
              this.wsService.sendMessage(JSON.stringify({ type: 'auth', api_password: api_password }));
            } else {
              this.loggedIn.next(false);
              this.router.navigate(['/login']);
            }
            break;
          case 'auth_invalid':
            alert(resp.message);
            localStorage.removeItem('api_password');
            this.loggedIn.next(false);
            this.router.navigate(['/login']);
        }
      });
  }

  login(user: User) {
    if (user.password !== '' && user.server !== '') {
      localStorage.setItem('api_password', user.password);
      localStorage.setItem('server', user.server);
      this.auth();
    }
  }

  auth(): void {
    const server = localStorage.getItem('server');
    const api_password = localStorage.getItem('api_password');
    if (server) {
      this.socketHandler(server, api_password);
    }
  }

  logout() {                            // {4}
    localStorage.removeItem('api_password');
    this.loggedIn.next(false);
    this.router.navigate(['/login']);
  }
}
