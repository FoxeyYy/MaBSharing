import 'rxjs/add/operator/map';
import 'rxjs/add/operator/take';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import {
    Router, Resolve, RouterStateSnapshot,
    ActivatedRouteSnapshot
} from '@angular/router';

import { Book } from '../Book';
import { ResourcesService } from '../resources.service';
import { forkJoin } from 'rxjs/observable/forkJoin';
import { map } from 'rxjs/operators';

@Injectable()
export class BookResolver implements Resolve<Book> {
    constructor(
        private resourceService: ResourcesService,
        private router: Router
    ) { }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Book> {

        let id = +route.paramMap.get("id");

        let bookObservable = this.resourceService.getBook(id);

        return bookObservable.map(book => {
            if (Object.keys(book).length > 0) {
                return book;
            } else {
                this.router.navigate(['error']);
                return null;
            }
        });

    }
}