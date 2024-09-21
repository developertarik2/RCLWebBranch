import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ChargeReceiveComponent } from './charge-receive/charge-receive.component';
import { ChargeRecieveDetComponent } from './charge-recieve-det/charge-recieve-det.component';
import { ChargeReceiveClientComponent } from './charge-receive-client/charge-receive-client.component';

const routes:Routes=[
  {path:'cdblChargeRec',data:{breadcrumb:'CDBL CHARGE RECEIVE(REPORT)'},component:ChargeReceiveComponent},
  {path:'cdblChargeDet',data:{breadcrumb:'CDBL CHARGE RECEIVE(DETAILS)'},component:ChargeRecieveDetComponent},
  {path:'cdblChargeClient',data:{breadcrumb:'CDBL CHARGE RECEIVE(CLIENT)'},component:ChargeReceiveClientComponent},
 // {path:'clientLedger',component:ClientLedgerComponent},
 // {path:'portfolioDetails',component:PortfolioDetailsComponent},
  //{path:':id',component:ClientLedgerComponent,data:{breadcrumb: {alias:'productDetails'}}},
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
export class CdblReportRoutingModule { }
