import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { IChargeReceive } from '../models/chargeReceive';
import { IChargeReceiveDet } from '../models/chargeReceiveDet';
import { IChargeReceiveClient } from '../models/chargeReceiveClient';
import { ICdblChargeReceive } from 'src/app/CDBL/models/cdblChargeRecieve';

@Injectable({
  providedIn: 'root'
})
export class CdblReportsService {

  baseUrl = environment.apiUrl;
  constructor(private http: HttpClient) { }

  getChargeReceive(values:any) {
    // return this.http.get<any>(this.baseUrl + 'ClientReport/getLedger');
    const token =localStorage.getItem('token');

    let headers = new HttpHeaders();
    headers = headers.set('Authorization',`Bearer ${token}`);

    return this.http.post<IChargeReceive[]>(this.baseUrl+'CDBLReport/getCdblChargeR',values, {headers});
     
   }

   getChargeReceiveDet(values:any) {
    // return this.http.get<any>(this.baseUrl + 'ClientReport/getLedger');
    const token =localStorage.getItem('token');

    let headers = new HttpHeaders();
    headers = headers.set('Authorization',`Bearer ${token}`);

    return this.http.post<IChargeReceiveDet>(this.baseUrl+'CDBLReport/getCdblChargeD',values, {headers});
     
   }

   getChargeReceiveClient(values:any) {
    // return this.http.get<any>(this.baseUrl + 'ClientReport/getLedger');
    const token =localStorage.getItem('token');

    let headers = new HttpHeaders();
    headers = headers.set('Authorization',`Bearer ${token}`);

    return this.http.get<IChargeReceiveClient[]>(this.baseUrl+'CDBLReport/getCdblChargeClient?code='+values, {headers});
     
   }

   getCDBLReportByMr(values:any) {
    // return this.http.get<any>(this.baseUrl + 'ClientReport/getLedger');
    const token =localStorage.getItem('token');

    let headers = new HttpHeaders();
    headers = headers.set('Authorization',`Bearer ${token}`);

    return this.http.get<ICdblChargeReceive>(this.baseUrl+'CDBLReport/getChargeByMr?mr_no='+ values, {headers});
     
   }
 
}
