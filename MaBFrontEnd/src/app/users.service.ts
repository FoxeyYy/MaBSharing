import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import { HttpClient } from '@angular/common/http';
import { User } from './User';
import { tap, catchError } from 'rxjs/operators';

@Injectable()
export class UsersService {

  private usersUrl = 'http://localhost:10011/user';

  constructor(
    private http: HttpClient
  ) {}

  /* Search users whose name contains search term */
  searchResources(term: string): Observable<User[]> {
    if (!term.trim()) {
      return of([]);
    }

    return this.http.post<User[]>(`${this.usersUrl}/search`, {term: term})
    .pipe(
      tap(heroes => heroes),
      catchError(error => of([]))
    );
  }

}
