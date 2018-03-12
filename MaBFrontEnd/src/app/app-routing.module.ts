import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';
import { AuthGuard } from './_guards/auth.guard';
import { SignupComponent } from './signup/signup.component';
import { SearchComponent } from './search/search.component';
import { WallComponent } from './wall/wall.component';

const routes: Routes = [
  { path: '',
   component: HomeComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', component: WallComponent },
      { path: 'search', component: SearchComponent }
    ] },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ]
})
export class AppRoutingModule {}