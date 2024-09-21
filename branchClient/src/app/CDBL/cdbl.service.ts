import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { IBoClient } from './models/boClient';
import { IBoReceipt } from './models/boReceipt';
import { ICdblChargeYear } from './models/chargeYearList';
import { IBoStatus } from './models/clinetBoStatus';
import { IChargeReceiveClient } from '../Reports/models/chargeReceiveClient';
import { ICdblChargeReceive } from './models/cdblChargeRecieve';


@Injectable({
  providedIn: 'root'
})
export class CdblService {

  baseUrl = environment.apiUrl;
  constructor(private http: HttpClient) { }

  getClientDetails(values:any) {
    const token =localStorage.getItem('token');

    let headers = new HttpHeaders();
    headers = headers.set('Authorization',`Bearer ${token}`);
 
     return this.http.get<IBoClient>(this.baseUrl+'cdbl/boAck?code='+values,{headers});
     
   }

   getBoCharge(){
    const token =localStorage.getItem('token');

    let headers = new HttpHeaders();
    headers = headers.set('Authorization',`Bearer ${token}`);
 
     return this.http.get<number>(this.baseUrl+'cdbl/getBoCharge',{headers});
   }

   getBoChargeTest(){
    const token =localStorage.getItem('token');

    let headers = new HttpHeaders();
    headers = headers.set('Authorization',`Bearer ${token}`);
 
     return this.http.get<IBoReceipt>(this.baseUrl+'cdbl/getBoChargeTest',{headers});
   }

   boSale(values:any){
    const token =localStorage.getItem('token');

    let headers = new HttpHeaders();
    headers = headers.set('Authorization',`Bearer ${token}`);
 
     return this.http.post<IBoReceipt>(this.baseUrl+'cdbl/boSale',values, {headers});
   }

   getCdblCharge(){
    const token =localStorage.getItem('token');

    let headers = new HttpHeaders();
    headers = headers.set('Authorization',`Bearer ${token}`);
 
     return this.http.get<number>(this.baseUrl+'cdbl/getCdblCharge',{headers});
   }

   getCdblYear(){
    const token =localStorage.getItem('token');

    let headers = new HttpHeaders();
    headers = headers.set('Authorization',`Bearer ${token}`);
 
     return this.http.get<ICdblChargeYear>(this.baseUrl+'cdbl/getFromMonth',{headers});
   }

   getBoStatus(values:any){
    const token =localStorage.getItem('token');

    let headers = new HttpHeaders();
    headers = headers.set('Authorization',`Bearer ${token}`);
 
     return this.http.get<IBoStatus>(this.baseUrl+'cdbl/getBoStatus?code='+values,{headers});
   }

   getPreviousPayments(values:any){
    const token =localStorage.getItem('token');

    let headers = new HttpHeaders();
    headers = headers.set('Authorization',`Bearer ${token}`);

    return this.http.get<IChargeReceiveClient[]>(this.baseUrl+'CDBLReport/getCdblChargeClient?code='+values, {headers});
   }

   collectCdblCharge(values:any){
    const token =localStorage.getItem('token');

    let headers = new HttpHeaders();
    headers = headers.set('Authorization',`Bearer ${token}`);

    return this.http.post<ICdblChargeReceive>(this.baseUrl+'CDBL/collect',values, {headers});
   }

   getCdblChargeTest(){
    const token =localStorage.getItem('token');

    let headers = new HttpHeaders();
    headers = headers.set('Authorization',`Bearer ${token}`);
 
     return this.http.get<ICdblChargeReceive>(this.baseUrl+'cdbl/getCdblChargeTest',{headers});
   }

   getnewClientCode(){
    const token =localStorage.getItem('token');

    let headers = new HttpHeaders();
    headers = headers.set('Authorization',`Bearer ${token}`);
 
     return this.http.get<any>(this.baseUrl+'cdbl/newClientCode',{headers});
   }

   createNewClient(values:any){
    const token =localStorage.getItem('token');

    let headers = new HttpHeaders();
    headers = headers.set('Authorization',`Bearer ${token}`);

    return this.http.post<any>(this.baseUrl+'CDBL/createNewClient',values, {headers});
   }

   getLastFiscal(values:any){
    const token =localStorage.getItem('token');

    let headers = new HttpHeaders();
    headers = headers.set('Authorization',`Bearer ${token}`);

    return this.http.get<IChargeReceiveClient>(this.baseUrl+'CDBL/getLastFiscal?code='+ values, {headers});
   }
}
