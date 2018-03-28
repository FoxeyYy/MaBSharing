import 'rxjs/add/operator/map';
import 'rxjs/add/operator/take';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import {
    Router, Resolve, RouterStateSnapshot,
    ActivatedRouteSnapshot
} from '@angular/router';

import { WishlistComponent } from './wishlist.component';
import { UsersService } from '../users.service';
import { Movie } from '../Movie';
import { Book, isBook } from '../Book';
import { ResourcesService } from '../resources.service';
import { forkJoin } from 'rxjs/observable/forkJoin';
import { map } from 'rxjs/operators';
import { Resource } from '../Resource';

@Injectable()
export class WishlistResolver implements Resolve<Resource[]> {
    
    constructor(
        private userService: UsersService,
        private router: Router
    ) { }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Resource[]> {

        let observable = this.userService.getWishlist();

        return observable.map(wishlist => {
            if (wishlist.length && Object.keys(wishlist[0])) {
                return wishlist;
            } else {
                this.router.navigate(['error']);
                return null;
            }
        })

    }
}