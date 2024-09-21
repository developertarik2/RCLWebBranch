import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Iledger } from '../models/ledger';
import { map } from 'rxjs';
import { IPortfolioDetails } from '../models/plDetails';
import { IClientPortfolio } from '../models/portfolio';
import { IClientConfirmation } from '../models/clientConfirmation';
import { IClientTax } from '../models/clientTax';
import { IClientReciept } from '../models/clientReceipt';

@Injectable({
  providedIn: 'root'
})
export class ClientReportsService {

  baseUrl = environment.apiUrl;
  constructor(private http: HttpClient) { }

  getClientLedger(values:any) {
   // return this.http.get<any>(this.baseUrl + 'ClientReport/getLedger');
   const token =localStorage.getItem('token');

   let headers = new HttpHeaders();
   headers = headers.set('Authorization',`Bearer ${token}`);

    return this.http.post<Iledger[]>(this.baseUrl+'ClientReport/getLedger',values,{headers});
    
  }

   getPortFolioDetails(values:any) {
    // return this.http.get<any>(this.baseUrl + 'ClientReport/getLedger');
    const token =localStorage.getItem('token');

    let headers = new HttpHeaders();
    headers = headers.set('Authorization',`Bearer ${token}`);
 
     return this.http.post<IPortfolioDetails>(this.baseUrl+'ClientReport/getPlDetails',values,{headers});
     
   }

   getPortfolio(values:any){

    const token =localStorage.getItem('token');
    let headers = new HttpHeaders();
    headers = headers.set('Authorization',`Bearer ${token}`);

    return this.http.post<IClientPortfolio>(this.baseUrl+'ClientReport/getPortfolio',values,{headers});
   }

   getClientConfirmation(values:any){

    const token =localStorage.getItem('token');
    let headers = new HttpHeaders();
    headers = headers.set('Authorization',`Bearer ${token}`);

    return this.http.post<IClientConfirmation>(this.baseUrl+'ClientReport/getClientConfirmation',values,{headers});
   }
   getClientReceipt(values:any){

    const token =localStorage.getItem('token');
    let headers = new HttpHeaders();
    headers = headers.set('Authorization',`Bearer ${token}`);

    return this.http.post<IClientReciept[]>(this.baseUrl+'ClientReport/getClientReceipt',values,{headers});
   }

   getClientTax(values:any){

    const token =localStorage.getItem('token');
    let headers = new HttpHeaders();
    headers = headers.set('Authorization',`Bearer ${token}`);

    return this.http.post<IClientTax>(this.baseUrl+'ClientReport/getClientTax',values,{headers});
   }

   getPortfolioReport(values:any){
    const token =localStorage.getItem('token');
    let headers = new HttpHeaders();
    headers = headers.set('Authorization',`Bearer ${token}`);
   // return this.http.get('https://localhost:7153/Report/Result',{observe:'response',responseType:'blob'})
   return this.http.get(this.baseUrl+'ClientReport/getPortfolioReport?code='+values, {observe:'response',responseType:'blob', headers:headers})

   //   return this.http.get('https://localhost:8083/Reports/Result',{observe:'response',responseType:'blob'})
   }

   getLedgerReport(values:any){
    const token =localStorage.getItem('token');
    let headers = new HttpHeaders();
    headers = headers.set('Authorization',`Bearer ${token}`);
   // return this.http.get('https://localhost:7153/Report/Result',{observe:'response',responseType:'blob'})
   return this.http.get(this.baseUrl+'ClientReport/getLedgerReport',{observe:'response',params:values,  responseType:'blob', headers:headers})

   //   return this.http.get('https://localhost:8083/Reports/Result',{observe:'response',responseType:'blob'})
   }

   getValid(values:any){
    const token =localStorage.getItem('token');
    let headers = new HttpHeaders();
    headers = headers.set('Authorization',`Bearer ${token}`);

    return this.http.get<boolean>(this.baseUrl+'ClientReport/requestValid?code='+values,{headers});
   }
}
