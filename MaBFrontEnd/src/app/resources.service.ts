import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { HttpClient } from '@angular/common/http';
import { Movie } from './Movie';
import { Book } from './Book';
import { of } from 'rxjs/observable/of';
import { catchError, tap, map } from 'rxjs/operators';
import { Resource } from './Resource';
import { Comment } from './Comment';

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

  /**
   * Retrieves a book from the server.
   * @param id of the book.
   */
  getBook(id: number): Observable<Book> {
    return this.http.get<Book>(`${this.resourcesUrl}/book/${id}`).pipe(
      map(result => {
        var book: Book = result["book"];
        if (result["book"]["like_it"]){
          book.like_it = result["book"]["like_it"] === "0" ? false : true;
        }
        return book;
      }),
      catchError(error => of({} as Book))
    )
  }

  /**
   * Creates a book on the server.
   * @param book to be created.
   */
  createBook(book: Book): Observable<number> {
    return this.http.post<number>(`${this.resourcesUrl}/book`, {
      name: book.name,
      release_date: book.release_date,
      writer: book.writer,
      edition: book.edition,
    }).pipe(
      map(id => id["resource_id"]),
      catchError(error => of(-1))
    )
  }

  /**
   * Retrieves a movie from the server.
   * @param id of the movie.
   */
  getMovie(id: number): Observable<Movie> {
    return this.http.get<Movie>(`${this.resourcesUrl}/movie/${id}`).pipe(
      map(result => {
        var movie: Movie = result["movie"];
        if (result["movie"]["like_it"]){
          movie.like_it = result["movie"]["like_it"] === "0" ? false : true;
        }
        return result["movie"];
      }),
      catchError(error => of({} as Movie))
    )
  }

  /**
   * Creates a movie on the server.
   * @param movie to be created.
   */
  createMovie(movie: Movie): Observable<number> {
    return this.http.post<number>(`${this.resourcesUrl}/movie`, {
      name: movie.name,
      release_date: movie.release_date,
      director: movie.director,
    }).pipe(
      map(id => id["resource_id"]),
      catchError(error => of(-1))
    )
  }

  /**
   * Gets the list of comments of a resource.
   * @param id of the resource.
   */
  getComments(id: number): Observable<Comment[]> {
    return this.http.get<Comment[]>(`${this.resourcesUrl}/${id}/comments`).pipe(
      map(comments => comments["comments"]),
      catchError(error => of(['error']))
    )
  }

  /**
   * Posts a comment to a resource, returning the ID if successful, -1 otherwise.
   * @param id of the resource.
   * @param comment the comment to post.
   */
  postComment(id: number, comment: string): Observable<number> {
    return this.http.post<any>(`${this.resourcesUrl}/${id}/comments`, { comment: comment }).pipe(
      map(id => id),
      catchError(error => of(-1))
    )
  }

}
