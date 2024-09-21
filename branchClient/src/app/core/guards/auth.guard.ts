import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Observable, map, of } from 'rxjs';
import { AccountService } from 'src/app/account/account.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard  {

  baseUrl=environment.apiUrl;

  constructor(private accountService:AccountService,private router:Router,
    private jwtHelper: JwtHelperService,private http:HttpClient){}
  
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): 
    Observable<boolean> 
     {

      const token =localStorage.getItem('token');
      //console.log(token)
      //return true;
      if(this.jwtHelper.isTokenExpired(token)){
       // console.log("noooooooooo")
        this.router.navigate(['login'],{queryParams:{returnUrl: state.url}});
        return of(false)
      }

      if( !this.jwtHelper.isTokenExpired(token)){
      // return of(true)
      }

      if (token && !this.jwtHelper.isTokenExpired(token)){
          this.accountService.currentUser$.pipe(
          map(auth=> {
            if(auth){
            //  console.log("authhhhhhhhh")
              return of(true);
            }
            /*else{
              this.router.navigate(['login'])
            }*/
           // console.log("authhhhhhhhh")
            //console.log(auth)
            this.router.navigate(['account/login'],{queryParams:{returnUrl: state.url}});
            //this.router.navigate(['login']);
            //return false
          })
        );
      }
      //return of(false);
  }
  
}
