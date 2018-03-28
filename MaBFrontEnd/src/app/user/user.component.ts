import { Component, OnInit } from '@angular/core';
import { User } from '../User';
import { UsersService } from '../users.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit {

  private user: User
  private errMsg: string = '';
  private added: boolean = false;
  private currentUser: boolean = false;

  constructor(
    private userService: UsersService,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.route.data.subscribe(
      (data: { results: User }) => {
        this.user = data.results;
        this.currentUser = this.userService.getCurrentUserEmail() === this.user.email;
      }
    );
  }

  /**
   * Sends a friend request to the current user
   */
  sendFriendRequest() {
    this.errMsg = '';
    this.userService.createFriendshipRequest(this.user.id).subscribe(id => {
      if (id === -1) {
        this.errMsg = "Couldn't send request :(";
        return;
      }

      this.added = true;
    });
  }

}
