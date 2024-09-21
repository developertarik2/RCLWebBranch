import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BoSaleReportComponent } from './bo-sale-report/bo-sale-report.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { BoSaleDetailComponent } from './bo-sale-detail/bo-sale-detail.component';
import { BoReportRoutingModule } from './bo-report-routing.module';



@NgModule({
  declarations: [
    BoSaleReportComponent,
    BoSaleDetailComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    BoReportRoutingModule
  ],
  exports:[
    BoSaleReportComponent
  ]
})
export class BoReportModule { }
