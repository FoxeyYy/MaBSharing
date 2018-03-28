import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { UsersService } from '../users.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {

  username: string = "";
  password: string = "";

  errMsg: string;
  loading: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private userService: UsersService
  ) { }

  ngOnInit() {
  }

  register() {
    this.loading = true;
    this.errMsg = "";

    if(this.username === "" || this.password === "") {
      this.errMsg = "Both fields are mandatory";
      this.loading = false;
      return;
    }

    this.authService
      .signup(this.username, this.password)
      .subscribe(msg => {
        this.loading = false;
        if(msg === "error") {
          this.errMsg = "User already in use";
        } else {
          this.userService.saveCurrentUser(this.username);
          this.router.navigate(['/']);
        }
      });
  }

}
