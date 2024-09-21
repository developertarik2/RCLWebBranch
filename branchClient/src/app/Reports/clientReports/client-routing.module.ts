import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { PortfolioComponent } from './portfolio/portfolio.component';
import { ClientLedgerComponent } from './client-ledger/client-ledger.component';
import { PortfolioDetailsComponent } from './portfolio-details/portfolio-details.component';
import { ClientConfirmationComponent } from './client-confirmation/client-confirmation.component';
import { ClientTaxComponent } from './client-tax/client-tax.component';
import { ClientReceiptComponent } from './client-receipt/client-receipt.component';

const routes:Routes=[
  {path:'portfolio',data:{breadcrumb:'PORTFOLIO'}, component:PortfolioComponent},
  {path:'clientLedger',data:{breadcrumb:'CLIENT LEDGER'},component:ClientLedgerComponent},
  {path:'clientConfirmation',data:{breadcrumb:'CLIENT CONFIRMATION'},component:ClientConfirmationComponent},
  {path:'clientReceipt',data:{breadcrumb:'CLIENT RECEIPT'},component:ClientReceiptComponent},
  {path:'clientTax',data:{breadcrumb:'TAX REPORT'},component:ClientTaxComponent},
  {path:'portfolioDetails',data:{breadcrumb:'PORTFOLIO DETAILS'},component:PortfolioDetailsComponent},
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
export class ClientRoutingModule { }
