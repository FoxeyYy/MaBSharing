import { Component, OnInit } from '@angular/core';
import {AuthService} from '../auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  username: string = "";
  password: string = "";
  error_msg: string;

  constructor(private authService: AuthService) { }

  ngOnInit() {
  }

  clear () {
    this.username = "";
    this.password = "";
  }

  login () {
    if (this.username && this.password) {
      this.authService.login(this.username, this.password);
    }
  }

}
