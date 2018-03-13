import 'rxjs/add/operator/map';
import 'rxjs/add/operator/take';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import {
    Router, Resolve, RouterStateSnapshot,
    ActivatedRouteSnapshot
} from '@angular/router';

import { SearchComponent } from './search.component';
import { Movie } from '../Movie';
import { Book } from '../Book';
import { User } from '../User';
import { UsersService } from '../users.service';
import { ResourcesService } from '../resources.service';
import { forkJoin } from 'rxjs/observable/forkJoin';
import { map } from 'rxjs/operators';

@Injectable()
export class SearchResolver implements Resolve<User[] |  Book[] | Movie[]> {
    constructor(
        private userService: UsersService,
        private resourceService: ResourcesService,
        private router: Router
    ) { }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<User[] |  Book[] | Movie[]> {

        let term = route.paramMap.get('term');

        let moviesBooks = this.resourceService.searchResources(term);
        let users = this.userService.searchUsers(term);

        let observable: Observable<User[] | Book[] | Movie[]> = forkJoin(moviesBooks, users).pipe(
            map(e => {
                const movies = e[0]["movies"];
                const books = e[0]["books"];
                const users = e[1]["users"];

                var result = [].concat(movies).concat(books).concat(users);

                return result;
            })
        );

        return observable.take(1).map(element => {

            if (element) {
                return element;
            } else {
                this.router.navigate(['/search/error']);
                return null;
            }
        });

    }
}