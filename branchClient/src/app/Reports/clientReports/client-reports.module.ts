import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PortfolioComponent } from './portfolio/portfolio.component';
import { ClientLedgerComponent } from './client-ledger/client-ledger.component';
import { ClientRoutingModule } from './client-routing.module';
//import { DataTablesModule } from 'angular-datatables';
import { SharedModule } from 'src/app/shared/shared.module';
import { DataTablesModule } from 'angular-datatables';
import { LedgerPdfComponent } from './pdfs/ledger-pdf/ledger-pdf.component';
import { PortfolioDetailsComponent } from './portfolio-details/portfolio-details.component';
import { ClientConfirmationComponent } from './client-confirmation/client-confirmation.component';
import { ClientTaxComponent } from './client-tax/client-tax.component';
import { ClientReceiptComponent } from './client-receipt/client-receipt.component';



@NgModule({
  declarations: [
    PortfolioComponent,
    ClientLedgerComponent,
    LedgerPdfComponent,
    PortfolioDetailsComponent,
    ClientConfirmationComponent,
    ClientTaxComponent,
    ClientReceiptComponent
  ],
  imports: [
    CommonModule,
    ClientRoutingModule,
    SharedModule,
    DataTablesModule
  ],
  exports:[
    ClientLedgerComponent,
    PortfolioDetailsComponent
  ]
})
export class ClientReportsModule { }
