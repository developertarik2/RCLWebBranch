import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
//import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HomeComponent } from './home/home.component';
import { SideNavComponent } from './side-nav/side-nav.component';
import { BodyComponent } from './body/body.component';
import { SublevelMenuComponent } from './side-nav/sublevel-menu.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AccountModule } from './account/account.module';
import { MatToolbarModule } from '@angular/material/toolbar';
import { DropDownDirective } from './drop-down.directive';
//import {MatButtonModule} from '@angular/material/button';
import { SharedModule } from './shared/shared.module';
import { NgxSpinnerModule } from 'ngx-spinner';
import { CoreModule } from './core/core.module';
import { JwtInterceptor, JwtModule } from '@auth0/angular-jwt';
import { ErrorInterceptor } from './core/interceptors/error.interceptor';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { LoadingInterceptor } from './core/interceptors/loading.interceptor';
import { DataTablesModule } from 'angular-datatables';
import { ClientReportsModule } from './Reports/clientReports/client-reports.module';
import { CdblReportsModule } from './Reports/cdblReports/cdbl-reports.module';
import { BoReportModule } from './Reports/boReports/bo-report.module';
import { CheckRequisitionComponent } from './check-requisition/check-requisition.component';
import { CdblModule } from './CDBL/cdbl.module';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TestWorksComponent } from './home/test-works/test-works.component';
//import { ChargeReceiveComponent } from './Reports/cdblReports/charge-receive/charge-receive.component';
//import { PortfolioDetailsComponent } from './Reports/portfolio-details/portfolio-details.component';

export function tokenGetter() { 
  return localStorage.getItem("jwt"); 
}

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    SideNavComponent,
    BodyComponent,
    SublevelMenuComponent,
    DashboardComponent,
    DropDownDirective,
    CheckRequisitionComponent,
    ChangePasswordComponent,
    TestWorksComponent
   // ChargeReceiveComponent,
    //PortfolioDetailsComponent,
  ],
  imports: [
    BrowserModule,
    FontAwesomeModule,
    AppRoutingModule,
    HttpClientModule,
   // NgbModule,
    BrowserAnimationsModule,
    AccountModule,
    NgxSpinnerModule,
    ClientReportsModule,
    CdblReportsModule,
    BoReportModule,
    CdblModule,
   // MatToolbarModule,
   // MatButtonModule,
    SharedModule,
    CoreModule,
    DataTablesModule,
    JwtModule.forRoot({
      config: {
        tokenGetter: tokenGetter,
        allowedDomains: ["localhost:5001"],
        disallowedRoutes: []
      }
    })
  ],
  providers: [
    {provide:HTTP_INTERCEPTORS,useClass:ErrorInterceptor,multi:true},
    {provide:HTTP_INTERCEPTORS,useClass:LoadingInterceptor,multi:true},
    {provide:HTTP_INTERCEPTORS,useClass:JwtInterceptor,multi:true}
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
