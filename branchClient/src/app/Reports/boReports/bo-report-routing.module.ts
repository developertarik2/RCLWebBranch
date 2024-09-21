import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { BoSaleReportComponent } from './bo-sale-report/bo-sale-report.component';
import { BoSaleDetailComponent } from './bo-sale-detail/bo-sale-detail.component';

const routes:Routes=[
  {path:'boReport',data:{breadcrumb:'BO SALE REPORT'},component:BoSaleReportComponent},
  {path:'boSaleDetail',data:{breadcrumb:'BO SALE REPORT(DETAIL)'},component:BoSaleDetailComponent},

];

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ],
  exports:[
    RouterModule
  ]
})
export class BoReportRoutingModule { }
