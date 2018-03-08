import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class ResourcesService {

  private resourcesUrl = 'http://localhost:10011/resources';

  constructor(
    private http: HttpClient
  ) { }

}
