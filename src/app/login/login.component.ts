import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  form: FormGroup;
  private formSubmitAttempt: boolean;
  readystate: number;

  constructor(
    private fb: FormBuilder,
    public authService: AuthService
  ) { }

  ngOnInit() {
    this.form = this.fb.group({
      ws_url: ['', Validators.required],
      password: ['', Validators.required]
    });

    // bypass login screen if url and password found in localStorage
    this.authService.login({
      ws_url: localStorage.getItem('ws_url'),
      password: localStorage.getItem('api_password')
    });
  }

  isFieldInvalid(field: string) { // {6}
    return (
      (!this.form.get(field).valid && this.form.get(field).touched) ||
      (this.form.get(field).untouched && this.formSubmitAttempt)
    );
  }

  onSubmit() {
    if (this.form.valid) {
      this.authService.login(this.form.value); // {7}
    }
    this.formSubmitAttempt = true;             // {8}
  }


}
