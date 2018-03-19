import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import { HttpClient } from '@angular/common/http';
import { User } from './User';
import { tap, catchError, map } from 'rxjs/operators';

@Injectable()
export class UsersService {

  private usersUrl = 'http://localhost:10011/user';

  constructor(
    private http: HttpClient
  ) { }

  /**
   * Search users whose name contains search term.
   * @param term to search
   */
  searchUsers(term: string): Observable<User[]> {
    if (!term.trim()) {
      return of([]);
    }

    return this.http.post<User[]>(`${this.usersUrl}/search`, { term: term })
      .pipe(
        tap(user => user),
        catchError(error => of([]))
      );
  }

  /**
   * Retrieves an user from the server.
   * @param id of the user.
   */
  getUser(id: number): Observable<User> {
    return this.http.get<User>(`${this.usersUrl}/${id}`).pipe(
      map(user => user["user"]),
      catchError(error => of({} as User))
    )
  }

}
