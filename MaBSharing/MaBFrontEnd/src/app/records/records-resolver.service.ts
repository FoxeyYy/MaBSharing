import 'rxjs/add/operator/map';
import 'rxjs/add/operator/take';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import {
    Router, Resolve, RouterStateSnapshot,
    ActivatedRouteSnapshot
} from '@angular/router';
import { map } from 'rxjs/operators';
import { Resource } from '../Resource';
import { UsersService } from '../users.service';

@Injectable()
export class RecordsResolver implements Resolve<Resource[]> {
    
    constructor(
        private userService: UsersService,
        private router: Router
    ) {}

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Resource[]> {

        let observable = this.userService.getRecordslist();

        return observable.map(records => {
            if (records.length && Object.keys(records[0])) {
                return records;
            } else {
                this.router.navigate(['error']);
                return null;
            }
        })

    }
}