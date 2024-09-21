import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AccountService } from '../account/account.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';
import { IloggedUser } from '../shared/models/loggedUser';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent {
  inputForm:FormGroup;
  returnUrl:string;

  username:string

  msg:string

  currentUser$:Observable<IloggedUser>;

  constructor(private accountService:AccountService,private router:Router,
    private activatedRoute:ActivatedRoute,private toaster:ToastrService) { }

    ngOnInit(): void {
      this.returnUrl=this.activatedRoute.snapshot.queryParams['returnUrl'] ||'/home';
      
      this.createLoginForm();
      
      this.currentUser$=this.accountService.currentUser$;

      if(this.currentUser$){
        this.currentUser$.subscribe({
          next:(user:IloggedUser)=>{
            if(user){
              this.username=user.username
            }
           
            //this.branchCode=user.branchCode
          }
        })
      }

      
    }
  
    createLoginForm(){
      this.inputForm=new FormGroup({
        //:new FormControl('',[Validators.required,Validators.pattern('^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$')]),
        oldPassword:new FormControl('',[Validators.required]),
        newPassword:new FormControl('',[Validators.required]),
        newConfirmPassword:new FormControl('',[Validators.required]),
      })
    }

    onSubmit(){

      if(this.inputForm.get('newPassword').value != this.inputForm.get('newConfirmPassword').value){
       this.toaster.error('New and confirm password should be same')
       return false
      }
    
      //console.log(this.loginForm.value)
      this.accountService.changePassword(this.inputForm.value).subscribe(
        {
        next:(msg:any)=> {
        // console.log('success')
          this.msg='Password changed successfully!!You will be redirected to login page now.....'
          
          setTimeout(() => {
            this.router.navigate(['login']);
        }, 5000);
          //this.router.navigateByUrl(this.returnUrl);
        },
        error:(error)=>{
        //  console.log(error);
        }
        })
       
    }
}
