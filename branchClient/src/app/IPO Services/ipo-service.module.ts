import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApplyIpoComponent } from './apply-ipo/apply-ipo.component';
import { UpcomingIpoComponent } from './upcoming-ipo/upcoming-ipo.component';



@NgModule({
  declarations: [
    ApplyIpoComponent,
    UpcomingIpoComponent
  ],
  imports: [
    CommonModule
  ]
})
export class IpoServiceModule { }
