import { Component, OnInit } from '@angular/core';
import { UsersService } from '../users.service';

@Component({
  selector: 'app-wall',
  templateUrl: './wall.component.html',
  styleUrls: ['./wall.component.css']
})
export class WallComponent implements OnInit {

  private events: any[] = [];
  private eventsError = '';

  constructor(
    private userService: UsersService,
  ) { }

  ngOnInit() {
    this.userService.getFriendsEvents().subscribe( result => {
      if (result.length && result[0] === -1) {
        this.eventsError = "Couldn't retrieve events :(";
        return;
      }
      
      this.events = result;
    });
  }

}
