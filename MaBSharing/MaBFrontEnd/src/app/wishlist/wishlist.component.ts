import { Component, OnInit } from '@angular/core';
import { Route } from '@angular/compiler/src/core';
import {
  Router, Resolve, RouterStateSnapshot,
  ActivatedRouteSnapshot, ActivatedRoute
} from '@angular/router';

import { Movie, isMovie } from '../Movie';
import { Book, isBook } from '../Book';
import { UsersService } from '../users.service';
import { Resource } from '../Resource';

@Component({
  selector: 'app-wishlist',
  templateUrl: './wishlist.component.html',
  styleUrls: ['./wishlist.component.css']
})
export class WishlistComponent implements OnInit {

  private resources: Resource[] = [];

  constructor(
    private userService: UsersService,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.route.data.subscribe(
      (data: { results: Resource[]}) => {
        console.log(data);
        this.resources = data.results;
      }
    );
  }
}