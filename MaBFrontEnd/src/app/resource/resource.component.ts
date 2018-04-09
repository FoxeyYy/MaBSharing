import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Resource } from '../Resource';
import { Comment } from '../Comment';
import { ResourcesService } from '../resources.service';
import { UsersService } from '../users.service';

@Component({
  selector: 'app-resource',
  templateUrl: './resource.component.html',
  styleUrls: ['./resource.component.css']
})
export class ResourceComponent implements OnInit {

  private resource: Resource
  private errorSubmitting: boolean = false
  private errorMarking: boolean = false
  private comment: string = ""
  private comments: Comment[] = []

  constructor(
    private route: ActivatedRoute,
    private resourceService: ResourcesService,
    private userService: UsersService
  ) { }

  ngOnInit() {
    this.route.data.subscribe(
      (data: { results: Resource }) => {
        this.resource = data.results;
      }
    );

    this.resourceService.getComments(this.resource.id).subscribe(
      comments => {
        this.comments = comments;
      });
  }

  /**
   * Autoadjusts comment text area height based on content.
   */
  adjust(): void {
    let nativeElement = document.getElementById("commentArea")
    nativeElement.style.overflow = 'hidden';
    nativeElement.style.height = 'auto';
    nativeElement.style.height = nativeElement.scrollHeight + "px";
  }

  /**
   * Resets comment box height.
   */
  resetHeight(): void {
    let nativeElement = document.getElementById("commentArea")
    nativeElement.style.height = 'auto';
  }

  /**
   * Submit wishlist status to server.
   * @param active if to add, false otherwise.
   */
  wishlistResource(active: boolean) {
    this.errorMarking = false;

    this.userService.wishlistResource(this.resource, active).subscribe(
      result => {
        if (result < 0) {
          this.errorMarking = true;
          return;
        }

        this.resource.on_wishlist = active;
      }
    )
  }

  /**
   * Submit mark status to server.
   * @param active if to add, false otherwise.
   */
  markResource(active: boolean) {
    this.errorMarking = false;

    this.userService.markResource(this.resource, active).subscribe(
      result => {
        if (result < 0) {
          this.errorMarking = true;
          return;
        }

        this.resource.marked = active;
      }
    )
  }

  /**
   * Likes / Dislikes a resource.
   * @param liked true if liked, false otherwise.
   */
  likeResource(like: boolean) {
    this.errorMarking = false;

    if (like === this.resource.like_it) {
      return;
    }

    this.userService.likeResource(this.resource, like).subscribe(
      result => {
        if (result < 0) {
          this.errorMarking = true;
          return;
        }

        this.resource.like_it = like;
      }
    )
  }

  /**
   * Submits a comment to the server.
   * @param comment to submit.
   */
  submitComment(comment: string) {
    if (!comment.trim()) {
      return;
    }

    this.errorSubmitting = false;

    this.resourceService.postComment(this.resource.id, comment).subscribe(
      result => {
        if (result < 0) {
          this.errorSubmitting = true;
          return result;
        }

        this.comments.push({
          comment: comment,
          creation_date: new Date(),
          author_id: 1
        } as Comment);

        this.comment = '';
        this.resetHeight();
        return result;
      }
    )
  }

}
