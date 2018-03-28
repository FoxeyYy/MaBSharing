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

<<<<<<< HEAD
          var books =new Array<Book>();
          json['wishlist']['books'].forEach(element => {
            books.push(Object.assign(new Book, element));
=======
  /**
   * Retrieves pending friendship requests for the logged user.
   */
  getFriendShipRequests(): Observable<FriendshipRequest[]> {
    return this.http.get<FriendshipRequest[]>(`${this.usersUrl}/friendship_requests`).pipe(
      map(response => {
        let requests: FriendshipRequest[] = [];
      
        for (let request of response["friendship_requests"]) {
          requests.push({
            authorId: +request["orig_author_id"],
            authorEmail: request["email"],
            creationDate: request["creation_date"]
>>>>>>> 4460ddbbe40b01753239975b6cb4a1ce35617ca2
          });

<<<<<<< HEAD
          var result = new Array<Resource>();
          result = result.concat(books);
          result = result.concat(movies);  
          
          return result;
        })
      );
=======
        return requests;
      }),
      catchError(error => of([{authorId: -1} as FriendshipRequest]))
    );
  }

  /**
   * Creates a new friend request.
   * @param userId of the target user.
   */
  createFriendshipRequest(userId: number): Observable<number> {
    return this.http.post<number>(`${this.usersUrl}/friendship_requests/`, {dest_user_id: userId}).pipe(
      map(response => response["id"]),
      catchError(error => of(-1))
    );
  }

  /**
   * Accepts or refueses a friend request.
   * @param authorId id of the user who created the request.
   * @param accept true to accept, false to refuse.
   */
  dispatchFriendshipRequest(authorId: number, accept: boolean): Observable<number> {
    return this.http.patch<number>(`${this.usersUrl}/friendship_requests/${authorId}`, {accepted: accept}).pipe(
      map(response => response["id"]),
      catchError(error => of(-1))
    );
>>>>>>> 4460ddbbe40b01753239975b6cb4a1ce35617ca2
  }

}
