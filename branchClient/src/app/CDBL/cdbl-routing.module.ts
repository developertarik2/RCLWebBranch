import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { BoAckComponent } from './bo-ack/bo-ack.component';
import { BoReceiveComponent } from './bo-receive/bo-receive.component';
import { CdblChargeReceiveComponent } from './cdbl-charge-receive/cdbl-charge-receive.component';
import { CreateNewClientComponent } from './create-new-client/create-new-client.component';

const routes:Routes=[
  {path:'boAckowledgement',data:{breadcrumb:'BO ACKNOWLEDGEMENT'},component:BoAckComponent},
  {path:'boReceive',data:{breadcrumb:'BO Sale'},component:BoReceiveComponent},
  {path:'cdblChargeReceive',data:{breadcrumb:'CDBL Charge Receive'},component:CdblChargeReceiveComponent},
  {path:'createNew',data:{breadcrumb:'Create New Client'},component:CreateNewClientComponent},
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
export class CdblRoutingModule { }
