import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router, ActivatedRoute } from '@angular/router';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  username: string;
  password: string;
  errMsg: string;
  returnUrl: string;
  loading: boolean;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  login () {
    this.errMsg = '';

    if (this.username && this.password) {
      this.loading = true;
      this.authService.login(this.username, this.password);
      this.router.navigate([this.returnUrl]);
    } else {
      this.errMsg = 'Both fields are mandatory';
    }
  }

}
