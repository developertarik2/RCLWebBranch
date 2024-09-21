import { Component } from '@angular/core';
import { IActiveIPO } from '../models/activeIPO';
import { IpoService } from '../ipo.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-apply-ipo',
  templateUrl: './apply-ipo.component.html',
  styleUrls: ['./apply-ipo.component.scss']
})
export class ApplyIpoComponent {
activeIpo:IActiveIPO[]

constructor(private ipoService:IpoService,private toster:ToastrService){}

ngOnInit(): void {
    
  this.getData()

}

getData() {
  this.ipoService.getAvailableIPO().subscribe({
   next:(ipo:IActiveIPO[])=>{
   
     this.activeIpo=ipo
  
   },
  // complete:()=>{},
   error:(err:any)=>{
     console.log(err)
     this.activeIpo=[]
    
   }
  })
 
 }

 onApply(){
  
 }
}
