import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../auth.service';
import { User } from '../User';
import { Observable } from 'rxjs/Observable';
import { forkJoin } from "rxjs/observable/forkJoin";
import { Subject } from 'rxjs/Subject';
import { debounceTime, distinctUntilChanged, switchMap, tap, map } from 'rxjs/operators';
import { UsersService } from '../users.service';
import { ResourcesService } from '../resources.service';
import { Book, isBook } from '../Book';
import { Movie, isMovie } from '../Movie';
import { of } from 'rxjs/observable/of';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {

  private static readonly SEARCH_MIN = 4;

  private results$: Observable<User[] | Book[] | Movie[]>;
  private searchTerms = new Subject<string>();
  private showSearches: boolean = false;
  private user: User;
  private requestsNum: number = 0;

  constructor(
    private router: Router,
    private activeRoute: ActivatedRoute,
    private authService: AuthService,
    private userService: UsersService,
    private resourceService: ResourcesService
  ) { }

  ngOnInit() {

    this.activeRoute.data.subscribe(
      (data: {results: User}) => {
        this.user = data.results;
      }
    );

    this.userService.getFriendShipRequests().subscribe(
      requests => {
        this.requestsNum = requests.length;
      }
    );

    this.results$ = this.searchTerms.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((term: string) => {
        if (term.length < NavbarComponent.SEARCH_MIN) {
          return of([]);
        }

        const moviesBooks = this.resourceService.searchResources(term);
        const users = this.userService.searchUsers(term);

        const observable: Observable<User[] | Book[] | Movie[]> = forkJoin(moviesBooks, users).pipe(
          map(e => {
            const movies = e[0]["movies"];
            const books = e[0]["books"];
            const users = e[1]["users"];

            var result = [].concat(movies).concat(books).concat(users);
            return result;
          })
        );

        return observable;
      }),
    );

  }

  /**
   * Searchs a term to be displayed in the navbar itself.
   * @param term to search
   */
  quickSearch(term: string) {
    this.searchTerms.next(term);
  }

/**
 * Searchs an item to be displayed in the search component.
 * @param term to search.
 */
  search(term: string) {
    this.router.navigate(['/search', {term: term}]);
    this.showSearches = false;
  }

  /**
   * Logouts the user, removing its credentials from the browser.
   */
  logout() {
    this.authService.logout();
    this.router.navigate(["/login"])
  }

}
