import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { IActiveIPO } from './models/activeIPO';

@Injectable({
  providedIn: 'root'
})
export class IpoService {

  baseUrl = environment.apiUrl;
  constructor(private http: HttpClient) { }

  getAvailableIPO() {
 
    const token =localStorage.getItem('token');
 
    let headers = new HttpHeaders();
    headers = headers.set('Authorization',`Bearer ${token}`);
 
     return this.http.post<IActiveIPO[]>(this.baseUrl+'IPOService/getActiveIPO',{headers});
     
   }

   applyIPO(values:any){
    const token =localStorage.getItem('token');
 
    let headers = new HttpHeaders();
    headers = headers.set('Authorization',`Bearer ${token}`);
 
     return this.http.post<string>(this.baseUrl+'IPOService/applyIPO',values,{headers});
   }
}
