import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChargeReceiveComponent } from './charge-receive/charge-receive.component';
import { CdblReportRoutingModule } from './cdbl-report-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { ChargeRecieveDetComponent } from './charge-recieve-det/charge-recieve-det.component';
import { ChargeReceiveClientComponent } from './charge-receive-client/charge-receive-client.component';



@NgModule({
  declarations: [
    ChargeReceiveComponent,
    ChargeRecieveDetComponent,
    ChargeReceiveClientComponent
  ],
  imports: [
    CommonModule,
    CdblReportRoutingModule,
    SharedModule
  ],
  exports:[
    ChargeReceiveComponent,
    ChargeRecieveDetComponent,
    ChargeReceiveClientComponent
  ]
})
export class CdblReportsModule { }
