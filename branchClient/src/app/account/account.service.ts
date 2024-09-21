import { Injectable } from '@angular/core';
import { ReplaySubject, map, of } from 'rxjs';
import { environment } from  'src/environments/environment';
import { IloggedUser } from '../shared/models/loggedUser';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { IUser } from '../shared/models/user';
@Injectable({
  providedIn: 'root'
})
export class AccountService {
  baseUrl=environment.apiUrl;

  private currentUserSource=new ReplaySubject<IloggedUser>(null);
  //private currentUserSource=new ReplaySubject<IloggedUser>(null);
  currentUser$=this.currentUserSource.asObservable();

  
  constructor(private http:HttpClient,private router:Router,private jwtHelper: JwtHelperService) { }

  getCurrentUserValue(){
    //  return this.currentUserSource.value;
    }

    loadCurrentUser(token:any){
      if(token === null){
        //console.log("expired")
        this.currentUserSource.next(null);
        return of(null);
      }

      if(this.jwtHelper.isTokenExpired(token)){
         console.log("expired")

         return of(null);
      }

      let headers = new HttpHeaders();
      headers = headers.set('Authorization',`Bearer ${token}`);
      //console.log(headers)


      return this.http.get<IloggedUser>(this.baseUrl+ 'account/getUser',{headers}).pipe(
        map((user:IloggedUser) => {
          if(user) {
            //localStorage.setItem('token',user.token);
            this.currentUserSource.next(user);
           // console.log(user)
          }
        })
      )
     }

     login(values:any) {
      return this.http.post<IUser>(this.baseUrl+'account/login',values).pipe(
        map((user:IUser) => {
        if(user){
          localStorage.setItem('token',user.token);
          //localStorage.setItem('refreshToken',user.refreshToken);
          this.currentUserSource.next(user);
          //console.log(this.currentUserSource)
        }
        
        })
      );
     }

     changePassword(values:any){
      const token =localStorage.getItem('token');

    let headers = new HttpHeaders();
    headers = headers.set('Authorization',`Bearer ${token}`);
    //  console.log(values)
      return this.http.post<any>(this.baseUrl+'account/passwordChange',values,{headers}).pipe(
        map((msg:any) => {
        if(msg){
          localStorage.removeItem('token');
          this.currentUserSource.next(null);
        }
        
        })
      );
     }

     logout(){
      localStorage.removeItem('token');
      this.currentUserSource.next(null);
     }
}
