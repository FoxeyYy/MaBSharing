import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { HttpClient } from '@angular/common/http';
import { Movie } from './Movie';
import { Book } from './Book';
import { of } from 'rxjs/observable/of';
import { catchError, tap } from 'rxjs/operators';

@Injectable()
export class ResourcesService {

  private resourcesUrl = 'http://localhost:10011/resources';

  constructor(
    private http: HttpClient
  ) { }

  /**
   * Search users whose name contains search term
   * @param term to search
   */
  searchResources(term: string): Observable<Movie[] | Book[]> {

    if (!term.trim()) {
      return of();
    }

    return this.http.post<any>(`${this.resourcesUrl}/search`, { term: term })
      .pipe(
        tap(json => {
          var movies = new Array<Movie>();
          json.movies.forEach(movie => {
            movies.push(Object.assign(new Movie, movie));
          });

          var books = new Array<Book>();
          json.books.forEach(book => {
            books.push(Object.assign(new Book, book));
          });

          var result: Array<Movie | Book> = [];
          result.concat(movies);
          result.concat(books);

          return result;
        }),
        catchError(error => {
          return of();
        })
      );
  }

}
