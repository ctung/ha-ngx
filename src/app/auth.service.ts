import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { User } from './user';
import { WebsocketService } from './websocket.service';


export const TOKEN_NAME = 'api_password';

@Injectable()
export class AuthService  {
  private loggedIn = new BehaviorSubject<boolean>(false); // {1}

  get isLoggedIn() {
    return this.loggedIn.asObservable(); // {2}
  }

  constructor(
    private router: Router,
    private wsService: WebsocketService
  ) { }

  login(user: User) {
    if (user.password !== '') { // {3}
      this.wsService.getSocket()
      .subscribe(data => {
        const resp = JSON.parse(data);
        console.log(data);
        if (resp.type === 'auth_ok') {
          localStorage.setItem('api_password', user.password);
          this.loggedIn.next(true);
          this.router.navigate(['/']);
        } else {
          alert(resp.message);
          localStorage.removeItem('api_password');
          this.loggedIn.next(false);
          this.router.navigate(['/login']);
        }
      });
      this.wsService.sendMessage(JSON.stringify({ type: 'auth', api_password: user.password }));
    }
  }


  logout() {                            // {4}
    localStorage.removeItem('api_password');
    this.loggedIn.next(false);
    this.router.navigate(['/login']);
  }
}
