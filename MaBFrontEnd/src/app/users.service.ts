import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import { HttpClient, HttpParams } from '@angular/common/http';
import { User } from './User';
import { tap, catchError, map } from 'rxjs/operators';
import { FriendshipRequest } from './FriendshipRequest';
import { Movie } from './Movie';
import { Book } from './Book';
import { Resource } from './Resource';
import { RequestOptions } from '@angular/http';

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
      map(user => {
        var result: User = user["user"];
        result.creation_date = user["user"]["user_creation_date"];
        if (user["user"]["friendrequest_accepted"]) {
          result.friendrequest_accepted = user["user"]["friendrequest_accepted"] === "0" ? false : true;
        }
        return result;
      }),
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
          });
        }

        return requests;
      }),
      catchError(error => of([{ authorId: -1 } as FriendshipRequest]))
    );
  }

  /**
   * Creates a new friend request.
   * @param userId of the target user.
   */
  createFriendshipRequest(userId: number): Observable<number> {
    return this.http.post<number>(`${this.usersUrl}/friendship_requests/`, { dest_user_id: userId }).pipe(
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
    return this.http.patch<number>(`${this.usersUrl}/friendship_requests/${authorId}`, { accepted: accept }).pipe(
      map(response => response["id"]),
      catchError(error => of(-1))
    );
  }

  /**
   * Retrieves current logged user's records list from server.
   */
  getRecordslist(): Observable<Resource[]> {
    return this.http.get<any[]>(`${this.usersUrl}/marked`).pipe(
      map(json => {

        var movies = new Array<Movie>();
        json['marked']['movies'].forEach(element => {
          movies.push(Object.assign(new Movie, element));
        });

        var books = new Array<Book>();
        json['marked']['books'].forEach(element => {
          books.push(Object.assign(new Book, element));
        });

        var result = new Array<Resource>();
        result = result.concat(books);
        result = result.concat(movies);

        return result;
      })
    );
  }

  /**
   * Retrieves current logged user's wishlist from server.
   */
  getWishlist(): Observable<any[]> {
    return this.http.get<any[]>(`${this.usersUrl}/wishlist`).pipe(
      map(json => {

        var movies = new Array<Movie>();
        json['wishlist']['movies'].forEach(element => {
          movies.push(Object.assign(new Movie, element));
        });

        var books = new Array<Book>();
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

  /**
   * Adds / Removes a resource from user's whislist.
   * @param resource to add/remove.
   * @param state true if to add, false otherwise.
   */
  wishlistResource(resource: Resource, state: boolean): Observable<number> {
    if (state) {
      return this.http.post<number>(`${this.usersUrl}/wishlist`, { id: resource.id }).pipe(
        map(result => result),
        catchError(error => of(-1))
      );
    } else {
      return this.http.delete<number>(`${this.usersUrl}/wishlist/${resource.id}`).pipe(
        map(result => result),
        catchError(error => of(-1))
      );
    }
  }

  /**
   * Adds / Removes a resource from user's marked list.
   * @param resource to add/remove.
   * @param state true if to add, false otherwise.
   */
  markResource(resource: Resource, state: boolean): Observable<number> {
    if (state) {
      return this.http.post<number>(`${this.usersUrl}/marked`, { id: resource.id }).pipe(
        map(result => result),
        catchError(error => of(-1))
      );
    } else {
      return this.http.delete<number>(`${this.usersUrl}/marked/${resource.id}`).pipe(
        map(result => result),
        catchError(error => of(-1))
      );
    }
  }

  /**
   * Likes / Dislikes a resource.
   * @param resource to like/dislike.
   * @param like true if liked, false otherwise.
   */
  likeResource(resource: Resource, like: boolean): Observable<number> {
    return this.http.post<number>(`${this.usersUrl}/ratings`, { id: resource.id, liked: like }).pipe(
      map(result => result),
      catchError(error => of(-1))
    );
  }

  /**
   * Retrieves an user's events.
   * @param id of the user.
   */
  getUserEvents(id: number): Observable<any[]> {
    return this.http.get(`${this.usersUrl}/events/${id}`).pipe(
      map(result => result["events"]),
      catchError(error => of([-1] as any))
    );
  }

  /**
   * Retrieves all friends events.
   * @param id of the user.
   */
  getFriendsEvents(): Observable<any[]> {
    return this.http.get(`${this.usersUrl}/events`).pipe(
      map(result => result["events"]),
      catchError(error => of([-1] as any))
    );
  }
}
