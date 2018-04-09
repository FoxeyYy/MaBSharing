import { Component, OnInit } from '@angular/core';
import { Resource } from '../Resource';
import { UsersService } from '../users.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-wish-list',
  templateUrl: './wish-list.component.html',
  styleUrls: ['./wish-list.component.css']
})
export class WishListComponent implements OnInit {

  private resources: Resource[] = [];

  constructor(
    private userService: UsersService,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.route.data.subscribe(
      (data: { results: Resource[]}) => {
        this.resources = data.results;
      }
    );

  }
}
