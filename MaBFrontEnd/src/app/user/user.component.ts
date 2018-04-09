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
  private pendingRequest = false;
  private isCurrentUser: boolean = false;

  constructor(
    private userService: UsersService,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.route.data.subscribe(
      (data: { results: User }) => {
        this.user = data.results;
        this.isCurrentUser = this.userService.getCurrentUserEmail() === this.user.email;
        this.pendingRequest = this.user.friendrequest_creation_date !== null && this.user.friendrequest_accepted === null;
        this.added = this.user.friendrequest_creation_date !== null && this.user.friendrequest_accepted;
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

      this.pendingRequest = true;
    });
  }

}
