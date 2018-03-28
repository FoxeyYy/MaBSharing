import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { AuthService } from './auth.service';
import { NavbarComponent } from './navbar/navbar.component';
import { AppRoutingModule } from './app-routing.module';
import { HomeComponent } from './home/home.component';
import { AuthGuard } from './_guards/auth.guard';
import { SignupComponent } from './signup/signup.component';
import { AuthInterceptor } from './_interceptors/auth.interceptor';
import { ResourcesService } from './resources.service';
import { UsersService } from './users.service';
import { SearchComponent } from './search/search.component';
import { WallComponent } from './wall/wall.component';
import { ResourceComponent } from './resource/resource.component';
import { ErrorComponent } from './error/error.component';
import { ReversePipe } from './_pipes/ReversePipe';
import { WishlistComponent } from './wishlist/wishlist.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    NavbarComponent,
    HomeComponent,
    SignupComponent,
    SearchComponent,
    WallComponent,
    ResourceComponent,
    ErrorComponent,
    ReversePipe,
    WishlistComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    AppRoutingModule
  ],
  providers: [
    AuthGuard,
    AuthService,
    ResourcesService,
    UsersService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
