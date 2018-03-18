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
import { Movie } from '../Movie';

@Injectable()
export class MovieResolver implements Resolve<Movie> {
    constructor(
        private resourceService: ResourcesService,
        private router: Router
    ) { }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Movie> {

        let id = +route.paramMap.get("id");

        let movieObservable = this.resourceService.getMovie(id);

        return movieObservable.map(movie => {
            
            if (Object.keys(movie).length > 0) {
                return movie;
            } else {
                this.router.navigate(['error']);
                return null;
            }
        });

    }
}