import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AccountService } from '../account.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm:FormGroup;
  returnUrl:string;

  constructor(private accountService:AccountService,private router:Router,
    private activatedRoute:ActivatedRoute,private toaster:ToastrService) { }

  ngOnInit(): void {
    this.returnUrl=this.activatedRoute.snapshot.queryParams['returnUrl'] ||'/home';
    this.createLoginForm();
    //this.toaster.error("Hello")
  }

  createLoginForm(){
    this.loginForm=new FormGroup({
      //:new FormControl('',[Validators.required,Validators.pattern('^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$')]),
      username:new FormControl('',[Validators.required]),
      password:new FormControl('',[Validators.required]),
    })
  }
  onSubmit(){
    
    //console.log(this.loginForm.value)
    this.accountService.login(this.loginForm.value).subscribe(
      {
      next:()=> {
        //console.log('userlogged in')
        this.router.navigateByUrl(this.returnUrl);
      },
      error:(error)=>{console.log(error);}
      })
      /*console.log('userlogged in');
      this.router.navigateByUrl(this.returnUrl); //'/shop'//
    },error => {
      console.log(error);*/
    //})
   // console.log(this.loginForm.value);
  }

}
