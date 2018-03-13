import { Component, OnInit } from '@angular/core';
import { Route } from '@angular/compiler/src/core';
import { ActivatedRoute } from '@angular/router';
import { User } from '../User';
import { Book, isBook } from '../Book';
import { Movie, isMovie } from '../Movie';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit {

  private books: Book[] = [];
  private movies: Movie[] = [];
  private users: User[] = [];

  constructor(
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.route.data
      .subscribe((data: { results: Array<User | Book | Movie> }) => {
        this.books = [];
        this.movies = [];
        this.users = [];

        for (var element of data.results) {
          if (isBook(element)) {
            this.books.push(element);
          } else if (isMovie(element)) {
            this.movies.push(element);
          } else {
            this.users.push(element);
          }
        }
      });
  }

}
