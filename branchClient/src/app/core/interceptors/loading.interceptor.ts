import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable, delay, finalize } from 'rxjs';
import { BusyService } from '../services/busy.service';

@Injectable()
export class LoadingInterceptor implements HttpInterceptor {
  timer: NodeJS.Timeout;

  constructor(private busyService:BusyService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    
  //  this.timer = setTimeout(() => this.busyService.busy(), 1000);
   // return next.handle(request);

   if(request.method==='POST' && request.url.includes('getPlDetails')){
    
    this.busyService.busy();
    return next.handle(request).pipe(
    //  delay(1000),
      finalize(() => {
      
      this.busyService.idle();
      
    }));
  }

  if(request.method==='POST' && request.url.includes('getClientTax')){
    
    this.busyService.busy();
    return next.handle(request).pipe(
    //  delay(1000),
      finalize(() => {
      
      this.busyService.idle();
      
    }));
  }


   if(request.method === 'POST'){
    return next.handle(request)
  }
  
  if(request.method === 'DELETE'){
    return next.handle(request)
  }

  if(request.url.includes('POST')){
    return next.handle(request)
  }

  

  this.busyService.busy();
  return next.handle(request).pipe(
   // delay(1000),
    finalize(()=> {
        this.busyService.idle();
    })

  );
  }
}
