import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Resource } from '../Resource';
import { Comment } from '../Comment';
import { ResourcesService } from '../resources.service';

@Component({
  selector: 'app-resource',
  templateUrl: './resource.component.html',
  styleUrls: ['./resource.component.css']
})
export class ResourceComponent implements OnInit {

  private resource: Resource
  private errorSubmitting: boolean = false
  private comment: string = ""
  private comments: Comment[]

  constructor(
    private route: ActivatedRoute,
    private resourceService: ResourcesService
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
          creationDate: new Date(),
          author_id: 1
        } as Comment);

        this.comment = '';
        this.resetHeight();
        return result;
      }
    )
  }

}
