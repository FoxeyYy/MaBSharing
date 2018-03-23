import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import { HttpClient } from '@angular/common/http';
import { User } from './User';
import { tap, catchError, map } from 'rxjs/operators';

@Injectable()
export class UsersService {

  private usersUrl = 'http://localhost:10011/user';
  private currentEmail = '';

  constructor(
    private http: HttpClient
  ) { }

  /**
   * Saves current user's email.
   * @param email of the current user.
   */
  saveCurrentUser(email: string) {
    this.currentEmail = email;
  }

  /**
   * Retrieves current user's email.
   */
  getCurrentUserEmail(): string {
    return this.currentEmail;
  }

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

  /**
   * Retrieves current user from the server.
   */
  getCurrentUserFromServer(): Observable<User> {
    return this.http.get<User>(`${this.usersUrl}/profile`).pipe(
      map(user => user["user"]),
      catchError(error => of({} as User))
    )
  }

}
