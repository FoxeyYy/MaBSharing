import 'rxjs/add/operator/map';
import 'rxjs/add/operator/take';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import {
    Router, Resolve, RouterStateSnapshot,
    ActivatedRouteSnapshot
} from '@angular/router';

import { ResourcesService } from '../resources.service';
import { forkJoin } from 'rxjs/observable/forkJoin';
import { map } from 'rxjs/operators';
import { User } from '../User';
import { UsersService } from '../users.service';
import { FriendshipRequest } from '../FriendshipRequest';

@Injectable()
export class RequestsResolver implements Resolve<FriendshipRequest[]> {
    constructor(
        private userService: UsersService,
        private router: Router
    ) { }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<FriendshipRequest[]> {

        let observable = this.userService.getFriendShipRequests();

        return observable.map(requests => {
            if (!requests.length || requests.length && requests[0].authorId != -1) {
                return requests;
            } else {
                this.router.navigate(['error']);
                return null;
            }
        });

    }
}