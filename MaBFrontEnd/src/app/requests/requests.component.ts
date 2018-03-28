import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FriendshipRequest } from '../FriendshipRequest';
import { UsersService } from '../users.service';

@Component({
  selector: 'app-requests',
  templateUrl: './requests.component.html',
  styleUrls: ['./requests.component.css']
})
export class RequestsComponent implements OnInit {

  private requests: FriendshipRequest[] = [];
  private errMsg: string = '';
  private errId: number = -1;

  constructor(
    private activeRoute: ActivatedRoute,
    private userService: UsersService
  ) { }

  ngOnInit() {
    this.activeRoute.data.subscribe(
      (data: { results: FriendshipRequest[] }) => {
        this.requests = data.results;
      }
    )
  }

  /**
   * Ignores a friend request.
   * @param id of the request's author to ignore.
   */
  ignoreRequest(id: number) {
    this.errMsg = '';

    this.userService.dispatchFriendshipRequest(id, false).subscribe(
      response => {
        if (response < 0) {
          this.errMsg = "Couldn't ignore request :(";
          this.errId = id;
          return;
        }

        this.removeRequest(id);
    });
  }

  /**
   * Accepts a friend request.
   * @param id of the request's author to accept.
   */
  acceptRequest(id: number) {
    this.errMsg = '';

    this.userService.dispatchFriendshipRequest(id, true).subscribe(
      response => {
        if (response < 0) {
          this.errMsg = "Couldn't accept request :(";
          this.errId = id;
          return;
        }

        this.removeRequest(id);
    });
  }

  /**
   * Removes a request from the intern requests array.
   * @param id of the request to remove.
   */
  private removeRequest(id: number) {
    let index = this.requests.map(r => r.authorId).indexOf(id);
    this.requests.splice(index, 1);
  }

}
