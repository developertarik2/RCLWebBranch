import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastrModule } from 'ngx-toastr';
import { BreadcrumbModule } from 'xng-breadcrumb';
import { SectionHeaderComponent } from './section-header/section-header.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { ServerErrorComponent } from './server-error/server-error.component';



@NgModule({
  declarations: [
    SectionHeaderComponent,
    NotFoundComponent,
    ServerErrorComponent
  ],
  imports: [
    CommonModule,
    BreadcrumbModule,
    ToastrModule.forRoot({
      positionClass:'toast-top-right',
      preventDuplicates:true,
    })
  ],
  exports:[
    SectionHeaderComponent
  ]
})
export class CoreModule { }
