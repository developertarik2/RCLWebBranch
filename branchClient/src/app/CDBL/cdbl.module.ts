import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BoAckComponent } from './bo-ack/bo-ack.component';
import { SharedModule } from '../shared/shared.module';
import { CdblRoutingModule } from './cdbl-routing.module';
import { BoReceiveComponent } from './bo-receive/bo-receive.component';
import { CdblChargeReceiveComponent } from './cdbl-charge-receive/cdbl-charge-receive.component';
import { CreateNewClientComponent } from './create-new-client/create-new-client.component';



@NgModule({
  declarations: [
    BoAckComponent,
    BoReceiveComponent,
    CdblChargeReceiveComponent,
    CreateNewClientComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    CdblRoutingModule
  ],
  exports:[
    BoAckComponent,
    BoReceiveComponent
  ]
})
export class CdblModule { }
