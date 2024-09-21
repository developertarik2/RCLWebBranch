import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { IBoSaleReport, IBoSaleReportDetails } from '../models/boSaleReport';
import { IBoReceipt } from 'src/app/CDBL/models/boReceipt';

@Injectable({
  providedIn: 'root'
})
export class BoReportService {

  

  baseUrl = environment.apiUrl;
  constructor(private http: HttpClient) { }

  getBoSaleReport(values:any) {
    // return this.http.get<any>(this.baseUrl + 'ClientReport/getLedger');
    const token =localStorage.getItem('token');

    let headers = new HttpHeaders();
    headers = headers.set('Authorization',`Bearer ${token}`);

    return this.http.post<IBoSaleReport[]>(this.baseUrl+'BOReport/getBoReport',values, {headers});
     
   }

   getBoSaleReportDetails(values:any) {
    // return this.http.get<any>(this.baseUrl + 'ClientReport/getLedger');
    const token =localStorage.getItem('token');

    let headers = new HttpHeaders();
    headers = headers.set('Authorization',`Bearer ${token}`);

    return this.http.post<IBoSaleReportDetails[]>(this.baseUrl+'BOReport/getBoReportDetails',values, {headers});
     
   }

   getBoSaleReportByMr(values:any) {
    // return this.http.get<any>(this.baseUrl + 'ClientReport/getLedger');
    const token =localStorage.getItem('token');

    let headers = new HttpHeaders();
    headers = headers.set('Authorization',`Bearer ${token}`);

    return this.http.get<IBoReceipt>(this.baseUrl+'BOReport/getBoReportByMr?mrno='+values, {headers});
     
   }
}
