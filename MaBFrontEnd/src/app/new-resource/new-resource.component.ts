import { Component, OnInit } from '@angular/core';
import { ResourcesService } from '../resources.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-new-resource',
  templateUrl: './new-resource.component.html',
  styleUrls: ['./new-resource.component.css']
})
export class NewResourceComponent implements OnInit {

  private today = new Date().toJSON().split('T')[0];
  private type;
  private types = ['Book', 'Movie'];

  private errMsg;

  private title: string = '';
  private releaseDate: Date;
  private edition: number;
  private author: string = '';

  constructor(
    private resourceService: ResourcesService,
    private router: Router
  ) { }

  ngOnInit() {
  }

  /**
   * Checks if filled form is valid.
   */
  private isValidForm(): boolean {
    switch(this.type) {
      case this.types[0]: {
        return this.title.length > 0 && this.releaseDate && this.edition && this.author.length > 0;
      } default: {
        return this.title.length > 0 && this.releaseDate && this.author.length > 0;
      }
    }
  }

  /**
   * Creates the resource on the server side.
   */
  create(): void {
    var resource;
    this.errMsg = '';

    if (!this.isValidForm()) {
      this.errMsg = 'Fields cannot be empty!';
      return;
    }

    switch (this.type) {
      case this.types[0]: {
        resource = {
          name: this.title,
          release_date: this.releaseDate,
          edition: this.edition,
          writer: this.author
        };

        this.resourceService.createBook(resource).subscribe(response => {
          if (response !== -1) {
            this.router.navigate([`book/${response}`]);
          } else {
            this.errMsg = "Couldn't create element :(";
          }
        });

        break;
      } default: {
        resource = {
          name: this.title,
          release_date: this.releaseDate,
          director: this.author
        };

        this.resourceService.createMovie(resource).subscribe(response => {
          if (response !== -1) {
            this.router.navigate([`movie/${response}`]);
          } else {
            this.errMsg = "Couldn't create element :(";
          }
        });

        break;
      }
    }




  }

}
