import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map, catchError, tap } from 'rxjs/operators';
import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import { JwtHelper } from 'angular2-jwt';

export const TOKEN_NAME: string = 'jwt_token';

@Injectable()
export class AuthService {

    private authUrl = 'http://localhost:10011/auth';
    private jwtHelper: JwtHelper = new JwtHelper();

    constructor(private http: HttpClient) {

    }

    signup(user: string, password: string) {
        return this.http.post(`${this.authUrl}/signup`, { email: user, password: password })
            .pipe(
                tap(jwt => this.setSession(jwt)),
                catchError(err => {
                    console.log(err);
                    return of("error");
                })
            );
    }

    login(user: string, password: string) {
        return this.http.post(`${this.authUrl}/login`, { email: user, password: password })
            .pipe(
                tap(jwt => this.setSession(jwt)),
                catchError(error => {
                    console.log(error);
                    return of("error");
                })
            );
    }

    private setSession(authResult) {
        localStorage.setItem(TOKEN_NAME, JSON.stringify(authResult));
    }

    logout() {
        localStorage.removeItem(TOKEN_NAME);
    }

    public isLoggedIn() {
        const token = localStorage.getItem(TOKEN_NAME);
        return token && !this.jwtHelper.isTokenExpired(token);
    }

    isLoggedOut() {
        return !this.isLoggedIn();
    }

}
