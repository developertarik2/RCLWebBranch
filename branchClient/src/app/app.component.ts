import { Component, OnInit } from '@angular/core';
import { AccountService } from './account/account.service';
interface SideNavToggle {
  screenWidth: number;
  collapsed: boolean;
}
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit{
  title = 'branchClient';

  //dtOptions: DataTables.Settings = {};

  constructor(private accountService:AccountService){}
  ngOnInit(): void {
   // throw new Error('Method not implemented.');

   
    this.loadCurrentUser();
  }
  
  isSideNavCollapsed = false;
  screenWidth = 0;
  onToggleSideNav(data: SideNavToggle): void {
    this.screenWidth = data.screenWidth;
    this.isSideNavCollapsed = data.collapsed;
  }

  loadCurrentUser(){
    const token =localStorage.getItem('token');
    if(token){
      this.accountService.loadCurrentUser(token).subscribe({
        next:()=>{ 
         // console.log("loaded user")
         },
        error:(error:any)=>{
         // console.log(error);
        }
        
      
        
      })
    }
    }
}
