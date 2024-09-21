import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClientReportsModule } from '../Reports/clientReports/client-reports.module';
import { TestWorksComponent } from './test-works/test-works.component';



@NgModule({
  declarations: [
   // TestWorksComponent
  ],
  imports: [
    CommonModule,
    ClientReportsModule,
  ],
})
export class HomeModule { }
