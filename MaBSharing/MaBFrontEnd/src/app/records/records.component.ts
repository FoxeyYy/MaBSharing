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
  selector: 'app-recordslist',
  templateUrl: './records.component.html',
  styleUrls: ['./records.component.css']
})


export class RecordsComponent implements OnInit {

  private resources: Resource[] = [];

  constructor(private userService: UsersService,
    private route: ActivatedRoute) { }

  ngOnInit() {
    this.route.data.subscribe(
      (data: { results: Resource[] }) => {
        this.resources = data.results;
      }
    );
  }
}
