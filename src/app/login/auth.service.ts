import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { User } from './user';
import { WebsocketService } from '../websocket.service';

@Injectable()
export class AuthService {
  private loggedIn = new BehaviorSubject<boolean>(false); // {1}
  private api_password: string;

  get isLoggedIn() {
    return this.loggedIn.asObservable(); // {2}
  }

  constructor(
    private router: Router,
    private wsService: WebsocketService
  ) {
    this.api_password = localStorage.getItem('api_password');
    this.socketHandler();
  }

  socketHandler() {
    this.wsService.socket
      .subscribe(data => {
        const resp = JSON.parse(data);
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
    if (user.password !== '') { // {3}
      this.api_password = user.password;
      localStorage.setItem('api_password', user.password);
      this.wsService.sendMessage(JSON.stringify({ type: 'auth', api_password: user.password }));
    }
  }

  logout() {                            // {4}
    localStorage.removeItem('api_password');
    this.loggedIn.next(false);
    this.router.navigate(['/login']);
  }
}
