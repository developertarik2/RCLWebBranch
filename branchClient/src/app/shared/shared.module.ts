import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from './material/material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TextInputComponent } from './text-input/text-input.component';
//import {MatDatepickerModule} from '@angular/material/datepicker';
//import { DataTablesModule } from 'angular-datatables';



@NgModule({
  declarations: [
    TextInputComponent
  ],
  imports: [
    CommonModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    //MatDatepickerModule
  //  DataTablesModule
  ],
  exports:[
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
  //  DataTablesModule,
    TextInputComponent,
    //MatDatepickerModule
  ]
})
export class SharedModule { }
