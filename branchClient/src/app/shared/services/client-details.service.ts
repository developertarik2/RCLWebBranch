import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IClientDetails } from '../models/clientDetails';
import { environment } from 'src/environments/environment';
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ClientDetailsService {
  baseUrl=environment.apiUrl;

  constructor(private http:HttpClient) { }

  getClient(code:string){

    return this.http.get<IClientDetails>(this.baseUrl+'ClientReport/getClient?code='+code);


   /* return this.http.get<IClientDetails>(this.baseUrl+ 'ClientReport/getClient?code='+code,).pipe(
      map((user:IClientDetails) => {
        if(user) {
          //localStorage.setItem('token',user.token);
          //this.currentUserSource.next(user);
          console.log(user)
        }
      })
    ) */
   }
  
}
