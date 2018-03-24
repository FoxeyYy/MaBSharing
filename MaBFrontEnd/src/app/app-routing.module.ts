import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';
import { AuthGuard } from './_guards/auth.guard';
import { SignupComponent } from './signup/signup.component';
import { SearchComponent } from './search/search.component';
import { WallComponent } from './wall/wall.component';
import { SearchResolver } from './search/search-resolver.service';
import { ResourceComponent } from './resource/resource.component';
import { BookResolver } from './resource/book-resolver.service';
import { MovieResolver } from './resource/movie-resolver.service';
import { ErrorComponent } from './error/error.component';
import { UserComponent } from './user/user.component';
import { UserResolver } from './user/user-resolver.service';
import { NewResourceComponent } from './new-resource/new-resource.component';
import { CurrentUserResolver } from './navbar/current-user-resolver.service';
import { RequestsComponent } from './requests/requests.component';
import { RequestsResolver } from './requests/requests-resolver.service';

const routes: Routes = [
  { path: '',
   component: HomeComponent,
    canActivate: [AuthGuard],
    resolve: {
      results: CurrentUserResolver
    },
    children: [
      { path: '', component: WallComponent },
      { path: 'error', component: ErrorComponent},
      { path: 'resource/new', component: NewResourceComponent},
      { 
        path: 'search',
        component: SearchComponent,
        resolve: {
          results: SearchResolver
        }
      },
      { 
        path: 'requests',
        component: RequestsComponent,
        resolve: {
          results: RequestsResolver
        }
      },
      { 
        path: 'user/:id',
        component: UserComponent,
        resolve: {
          results: UserResolver
        }
      },
      { 
        path: 'book/:id',
        component: ResourceComponent,
        resolve: {
          results: BookResolver
        }
      },
      { 
        path: 'movie/:id',
        component: ResourceComponent,
        resolve: {
          results: MovieResolver
        }
      }
    ] },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ],
  providers: [
    SearchResolver,
    BookResolver,
    MovieResolver,
    UserResolver,
    CurrentUserResolver,
    RequestsResolver
  ]
})
export class AppRoutingModule {}