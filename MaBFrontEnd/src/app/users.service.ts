import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import { HttpClient } from '@angular/common/http';
import { User } from './User';
import { tap, catchError, map, concat } from 'rxjs/operators';
import { Resource } from './Resource';
import { Movie } from './Movie';
import { Book } from './Book';
import { resource } from 'selenium-webdriver/http';

@Injectable()
export class UsersService {

  //private usersUrl = 'http://localhost:10011/user';
  private usersUrl = 'http://192.168.98.3:10011/user';

  constructor(
    private http: HttpClient
  ) {}

  /**
   * Search users whose name contains search term.
   * @param term to search
   */
  searchUsers(term: string): Observable<User[]> {
    if (!term.trim()) {
      return of([]);
    }

    return this.http.post<User[]>(`${this.usersUrl}/search`, {term: term})
    .pipe(
      tap(user => user),
      catchError(error => of([]))
    );
  }

  getWishlist(): Observable<any[]> {
    return this.http.get<any[]>(`${this.usersUrl}/wishlist`).pipe(
        map(json => {

          var movies =new Array<Movie>();
          json['wishlist']['movies'].forEach(element => {
            movies.push(Object.assign(new Movie, element));
          }); 

          var books =new Array<Book>();
          json['wishlist']['books'].forEach(element => {
            books.push(Object.assign(new Book, element));
          });

          var result = new Array<Resource>();
          result = result.concat(books);
          result = result.concat(movies);  
          
          return result;
        })
      );
  }

}
