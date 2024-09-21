import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { HomeComponent } from './home/home.component';
//import { LoginComponent } from './account/login/login.component';
import { AuthGuard } from './core/guards/auth.guard';
import { LedgerPdfComponent } from './Reports/clientReports/pdfs/ledger-pdf/ledger-pdf.component';
import { CheckRequisitionComponent } from './check-requisition/check-requisition.component';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { ServerErrorComponent } from './core/server-error/server-error.component';
import { NotFoundComponent } from './core/not-found/not-found.component';
import { LoginComponent } from './account/login/login.component';
import { TestWorksComponent } from './home/test-works/test-works.component';

const routes: Routes = [
  { path: '',pathMatch: 'full', component: LoginComponent },
  { path: 'login', component: LoginComponent },
  {path: 'dashboard', component: DashboardComponent},
  {path:'server-error',component:ServerErrorComponent,data:{breadcrumb:'Server Error'}},
  {path:'not-found',component:NotFoundComponent,data:{breadcrumb:'Not found'}},
  //{ path: 'reports', component: PdfTestComponent },
  { path: 'home', component: HomeComponent, canActivate: [AuthGuard],data:{breadcrumb:'HOME'},children:[
    {path: 'clientReports', canActivate: [AuthGuard],data:{breadcrumb:'CLIENT REPORTS'}, loadChildren: () => import('./Reports/clientReports/client-reports.module').then(mod => mod.ClientReportsModule)},
    {path: 'cdblReports', canActivate: [AuthGuard],data:{breadcrumb:'CDBL REPORTS'}, loadChildren: () => import('./Reports/cdblReports/cdbl-reports.module').then(mod => mod.CdblReportsModule)},
    {path: 'boReports', canActivate: [AuthGuard],data:{breadcrumb:'BO REPORTS'}, loadChildren: () => import('./Reports/boReports/bo-report.module').then(mod => mod.BoReportModule)},
    {path: 'cdbl', canActivate: [AuthGuard],data:{breadcrumb:'CDBL'}, loadChildren: () => import('./CDBL/cdbl.module').then(mod => mod.CdblModule)},
    {path:'CheckRequisition',canActivate:[AuthGuard],data:{breadcrumb:'CHECK REQUISITION'},component:CheckRequisitionComponent},
    {path:'changePassword',canActivate:[AuthGuard],data:{breadcrumb:'CHANGE PASSWORD'},component:ChangePasswordComponent},
    {path:'testing',canActivate:[AuthGuard],data:{breadcrumb:'Test'},component:TestWorksComponent}
  ] 
  },
  {path: 'pdf', component: LedgerPdfComponent},
  {path:'**',redirectTo:'not-found',pathMatch:'full'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
