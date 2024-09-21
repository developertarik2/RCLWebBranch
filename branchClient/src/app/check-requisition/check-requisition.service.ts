import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ICheckRequisition } from './requisition';

@Injectable({
  providedIn: 'root'
})
export class CheckRequisitionService {
  baseUrl = environment.apiUrl;
  constructor(private http: HttpClient) { }
  
  getRequisitions(values:any) {
    // return this.http.get<any>(this.baseUrl + 'ClientReport/getLedger');
    const token =localStorage.getItem('token');

    let headers = new HttpHeaders();
    headers = headers.set('Authorization',`Bearer ${token}`);

    return this.http.get<ICheckRequisition[]>(this.baseUrl+'EFTService/checkRequisition?code='+values, {headers});
     
   }
}
