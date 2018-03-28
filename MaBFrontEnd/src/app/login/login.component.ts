import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { UsersService } from '../users.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  username: string;
  password: string;

  errMsg: string;
  loading: boolean;

  constructor(
    private router: Router,
    private authService: AuthService,
    private userService: UsersService
  ) { }

  ngOnInit() {
  }

  login() {
    this.errMsg = '';

    if (this.username && this.password) {
      this.loading = true;
      this.authService.login(this.username, this.password)
        .subscribe(msg => {
          this.loading = false;
          if (msg === "error") {
            this.errMsg = 'Wrong credentials';
          } else {
            this.userService.saveCurrentUser(this.username);
            this.router.navigate(["/"]);
          }
        });
    } else {
      this.errMsg = 'Both fields are mandatory';
    }
  }

}
