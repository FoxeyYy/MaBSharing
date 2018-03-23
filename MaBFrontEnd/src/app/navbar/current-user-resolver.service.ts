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

@Injectable()
export class CurrentUserResolver implements Resolve<User> {
    constructor(
        private userService: UsersService,
        private router: Router
    ) { }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<User> {

        let email = this.userService.getCurrentUserEmail();

        let observable = this.userService.getCurrentUserFromServer();

        return observable.map(user => {
            if (Object.keys(user).length > 0) {
                return user;
            } else {
                this.router.navigate(['error']);
                return null;
            }
        });

    }
}