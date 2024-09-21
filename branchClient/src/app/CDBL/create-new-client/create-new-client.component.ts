import { Component } from '@angular/core';
import { CdblService } from '../cdbl.service';
import { ToastrService } from 'ngx-toastr';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-create-new-client',
  templateUrl: './create-new-client.component.html',
  styleUrls: ['./create-new-client.component.scss']
})
export class CreateNewClientComponent {
  newCode:string
  inputForm:FormGroup;

  msg:string

  constructor(private cdblService: CdblService,private toster:ToastrService){}

  ngOnInit(): void{
    this.createForm()
    this.cdblService.getnewClientCode().subscribe({
      next:(code:any)=>{     
        this.newCode=code.code
       
       // console.log(code.code)
       this.inputForm.controls['code'].setValue(this.newCode, {onlySelf: true});
      
      },
    
      error:(err:any)=>{
        console.log(err)
     
      }
     })
   
  }

  createForm(){    
      this.inputForm=new FormGroup({
        code:new FormControl(this.newCode),
        name:new FormControl('',[Validators.required]),
              
      })
    }

    onSubmit(){
      this.msg=null
      this.cdblService.createNewClient(this.inputForm.value).subscribe({
        next:(text:any)=>{
           this.msg=text.msg

         //  this.newCode=null
           
        },
        error:(err:any)=>{
          this.msg=null
          console.log(err)
        }
      })
    }

}
