import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import * as moment from 'moment';
import { map, catchError, tap } from 'rxjs/operators';
import { Observable } from 'rxjs/Observable';


export const TOKEN_NAME: string = 'jwt_token';

@Injectable()
export class AuthService {

  constructor(private http: HttpClient) {

  }

  login(user:string, password:string ) {
      return this.http.post('/api/login', {user, password})
        .subscribe(
          token => this.setSession(token),
          error => console.error("Failed to login")
        );
  }     
  private setSession(authResult) {
      const expiresAt = moment().add(authResult.expiresIn, 'second');

      localStorage.setItem('id_token', authResult.idToken);
      localStorage.setItem('expires_at', JSON.stringify(expiresAt.valueOf()) );
  }          

  logout() {
      localStorage.removeItem("id_token");
      localStorage.removeItem("expires_at");
  }

  public isLoggedIn() {
      return moment().isBefore(this.getExpiration());
  }

  isLoggedOut() {
      return !this.isLoggedIn();
  }

  getExpiration() {
      const expiration = localStorage.getItem('expires_at');
      const expiresAt = JSON.parse(expiration);
      return moment(expiresAt);
  }    
}
