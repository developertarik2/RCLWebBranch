import { Component } from '@angular/core';
import { ICheckRequisition } from './requisition';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { IloggedUser } from '../shared/models/loggedUser';
import { Observable } from 'rxjs';
import { CheckRequisitionService } from './check-requisition.service';
import { ToastrService } from 'ngx-toastr';
import { AccountService } from '../account/account.service';

@Component({
  selector: 'app-check-requisition',
  templateUrl: './check-requisition.component.html',
  styleUrls: ['./check-requisition.component.scss']
})
export class CheckRequisitionComponent {
  checks: ICheckRequisition[];
  inputForm:FormGroup;
  currentUser$:Observable<IloggedUser>;

  constructor(private checkService: CheckRequisitionService,private toster:ToastrService,private accountService:AccountService) { }

  ngOnInit(): void{
    
    this.currentUser$=this.accountService.currentUser$;

    
    this.createForm()
  }

  createForm(){
    this.inputForm=new FormGroup({
      code:new FormControl('',[Validators.required]),
    
    })
  }

  getData() {
    var inputValue = (<HTMLInputElement>document.getElementById('Client Code')).value;

    this.checkService.getRequisitions(inputValue).subscribe({
     next:(sales:ICheckRequisition[])=>{     
       this.checks=sales 
        console.log(this.checks)
            
     },
    // complete:()=>{},
     error:(err:any)=>{
       console.log(err)
       //this.charges=[]   
     }
    })
    

   }
   onSubmit(){

    
   
    this.getData()
    
    

  }
}
