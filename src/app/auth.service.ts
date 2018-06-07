import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { User } from './user';
import { WebsocketService } from './websocket.service';

@Injectable()
export class AuthService {
  private loggedIn = new BehaviorSubject<boolean>(false); // {1}
  messageFromServer: any;

  get isLoggedIn() {
    return this.loggedIn.asObservable(); // {2}
  }

  constructor(
    private router: Router,
    private wsService: WebsocketService
  ) {
    this.wsService.createObservableSocket()
      .subscribe(data => {
        this.messageFromServer = JSON.parse(data);
        console.log(data);
      });
  }

  login(user: User) {
    if (user.password !== '' && this.messageFromServer.type === 'auth_required') { // {3}
      this.wsService.ws.onmessage = (message) => {
        const obj = JSON.parse(message.data);
        console.log(message.data);
        if (obj.type === 'auth_ok') {
          localStorage.setItem('api_password', user.password);
          this.loggedIn.next(true);
          this.router.navigate(['/']);
        } else {
          alert(obj.message);
          this.logout();
        }
      };
      this.wsService.sendMessage(JSON.stringify({ type: 'auth', api_password: user.password }));
    }
  }



  logout() {                            // {4}
    localStorage.removeItem('api_password');
    this.loggedIn.next(false);
    this.router.navigate(['/login']);
  }
}
