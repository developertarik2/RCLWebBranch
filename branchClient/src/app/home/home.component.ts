import { Component, HostListener, OnInit } from '@angular/core';
import { AccountService } from '../account/account.service';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { IUser } from '../shared/models/user';
import { IloggedUser } from '../shared/models/loggedUser';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  navbarCollapsed = true;

  toggleNavbarCollapsing() {
    this.navbarCollapsed = !this.navbarCollapsed;
  }

small:boolean=false;
currentUser$:Observable<IloggedUser>;

@HostListener('window:resize', ['$event'])
onResize(event:any) {
   if(window.innerWidth <=800){
    this.small=true;
   }
   if(window.innerWidth > 800){
    this.small=false;
    }
}

  constructor(private accountService:AccountService,private router:Router) { }

  ngOnInit(): void {
    if(window.innerWidth <= 800){
    this.small=true;
    }
    if(window.innerWidth > 800){
      this.small=false;
      }
      this.currentUser$=this.accountService.currentUser$;
  }


  title = 'rclWebBranchClient';

   //sidebar = document.querySelector(".sidebar");
  // sidebarBtn = document.querySelector(".fa-bars");
   status: boolean = false;
   status2: boolean = false;
  openBar(){
    //this.sidebar.classList.toggle("close");
    this.status = !this.status;  
  }

  arrow(){
    this.status2 = !this.status2;  
  }

  logout(){
    this.accountService.logout();
    this.router.navigate(['login']);
  }

}
