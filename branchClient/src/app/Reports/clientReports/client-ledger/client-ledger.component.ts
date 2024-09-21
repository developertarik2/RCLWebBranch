import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Iledger } from '../../models/ledger';
import { ClientReportsService } from '../client-reports.service';
import { Subject } from 'rxjs';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { DataTableDirective } from 'angular-datatables';
import { IClientDetails } from 'src/app/shared/models/clientDetails';
import { ClientDetailsService } from 'src/app/shared/services/client-details.service';
import { formatDate } from '@angular/common';

var pdfMake = require('pdfmake/build/pdfmake.js');
var pdfFonts = require('pdfmake/build/vfs_fonts.js');
(<any>pdfMake).vfs = pdfFonts.pdfMake.vfs;

@Component({
  selector: 'app-client-ledger',
  templateUrl: './client-ledger.component.html',
  styleUrls: ['./client-ledger.component.scss']
})
export class ClientLedgerComponent implements OnDestroy, OnInit,AfterViewInit {
  @ViewChild(DataTableDirective, {static: false})
  dtElement: DataTableDirective;

  
  ledgers: Iledger[];
  inputForm:FormGroup;
  client:IClientDetails

  dtOptions: DataTables.Settings = {}
    
  dtTrigger: Subject<any> = new Subject<any>();

  constructor(private clientReportService: ClientReportsService,private toster:ToastrService,private clientService:ClientDetailsService) { }

  ngOnInit(): void {
   // this.getClient()
   this.dtOptions = {
      pagingType: 'full_numbers',
      paging:true,
      responsive:true,
      pageLength: 10,
      processing: true,
      deferRender:true,
      destroy:true
    };
    this.createForm()
   // this.getOrders()
  }

  getClient(){
    
    this.clientService.getClient(this.inputForm.get('code').value).subscribe({
     next:(client:IClientDetails)=>{
     
       this.client=client       
     },
    // complete:()=>{},
     error:(err:any)=>{
      this.client=null
       console.log(err)
       //this.ledgers=[]
      
     }
    })   
 }
  getOrders() {
   this.clientReportService.getClientLedger(this.inputForm.value).subscribe({
    next:(ledgers:Iledger[])=>{
    
      this.ledgers=ledgers
   
      this.dtTrigger.next(null);
    },
   // complete:()=>{},
    error:(err:any)=>{
      console.log(err)
      this.ledgers=[]
      this.dtTrigger.next(null);
    }
   })

  }

  createForm(){
    this.inputForm=new FormGroup({
      fromDate:new FormControl('',[Validators.required]),
      code:new FormControl('',[Validators.required]),
      toDate:new FormControl('',[Validators.required]),
    })
  }

  onSubmit(){
    if(Date.parse( this.inputForm.get('fromDate').value) > Date.parse( this.inputForm.get('toDate').value)){
      this.toster.error("From date can't be greater than To Date")
      //console.log("wrong")
      return false
    }
    //this.getOrders();
    /*this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
     // scrollX: true,
      processing: true,
      deferRender: true,
      destroy:true
    }; */

    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      // Destroy the table first
      dtInstance.destroy();
      // Call the dtTrigger to rerender again
     
      
    });
    this.getOrders()
    this.getClient()
    //  this.dtTrigger.next(null);
  }
  ngAfterViewInit(): void {
    this.dtTrigger.next(null);
  }
  ngOnDestroy(): void {
    // Do not forget to unsubscribe the event
    this.dtTrigger.unsubscribe();
  }

  async onPrint(){
    if(this.ledgers?.length ==0){
      //this.toster.error("Invalid Code!!!")
      return false
    }
   
    const str = new Date().toLocaleString('en-US', { timeZone: 'Asia/Dhaka' });
    console.log(str);
    const documentDefinition=await this.getDocumentDefinition();
       pdfMake.createPdf(documentDefinition).open();   
  }

  getBase64ImageFromURL(url:any) {
    return new Promise((resolve, reject) => {
      var img = new Image();
      img.setAttribute("crossOrigin", "anonymous");
  
      img.onload = () => {
        var canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
  
        var ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
  
        var dataURL = canvas.toDataURL("image/png");
  
        resolve(dataURL);
      };
  
      img.onerror = error => {
        reject(error);
      };
  
      img.src = url;
    });
  }


  async getDocumentDefinition(){
    const str = new Date().toLocaleString('en-US', { timeZone: 'Asia/Dhaka' });

    return {
      pageMargins: [ 30, 30, 30, 40 ],

      footer: (currentPage:any, pageCount:any) => {
        var t = {
          layout: "noBorders",
          fontSize: 8,
          margin: [15, 10, 15, 0],
          table: {
            widths: ["*", "*",'*'], 
            body: [
              [
               // { text: 'Print Date: '+ str.toString(), alignment: 'left',fontSize:8},
               { text: 'Print Date: '+ formatDate(str,'MMM dd, yyyy h:mm:ss a z','en_US'), alignment: 'left',fontSize:8},
                { text: 'This is a computer generated statement. No signature is required', alignment: 'center',fontSize:6 },
                { text: "Page  " + currentPage.toString() + " of " + pageCount,alignment: 'right' },
               
              ]
            ]
          }
        };
  
        return t;
      },
      content: [
        {
          columns:[
            [
              {
                image: await this.getBase64ImageFromURL(
                  "../../assets/images/rcl-logo.png"
                ),
                width: 150,
              }  
            ],
            [
              {
                text:'ROYAL CAPITAL LIMITED',
                alignment:'right',
                bold:true,
                color:'#0054a5',
                style:'',
                margin:[0,0,3,0],
              },
              {
                text:'DSEAnnexBuilding(2nd Floor)',
                alignment:'right',
                margin:[0,0,3,0],
                fontSize:10,
                style:''
              },
              {
                text:'9/E,MotijheelC/A,Dhaka-1000',
                alignment:'right',
                margin:[0,0,3,0],
                fontSize:10,
                style:''
              },
          
            ]
          ],
        },
        {
          canvas: [ { type: 'line', x1: 0, y1: 0, x2: 535, y2: 0, lineWidth: .5 } ],
          margin: [0, 10 ,0, 10],
          
        },
        {
           
                text:'Client Ledger',
                alignment:'center',
                margin: [0, 0 ,0, 0],          
        },
        {
          text:'From '+ formatDate(this.inputForm.get('fromDate').value,'dd MMMM, yyyy','en_US') +' to ' +
          formatDate(this.inputForm.get('toDate').value,'dd MMMM, yyyy','en_US')  ,alignment:'center'
        },
        {
          canvas: [ { type: 'line', x1: 0, y1: 0, x2: 535, y2: 0, lineWidth: .5 } ],
          margin: [0, 10 ,0, 10],
          
        },
        {
          layout: "noBorders",
          //fontSize: 8,
          margin: [10, 10, 0, 0],
          table: {
            widths: ["*", "*",'*','*','*'], 
            body: [
              [
                { text: 'Account Holder Name:' , alignment: 'left',fontSize:8},
                { text: this.client.aname, alignment: 'left',fontSize:8 },
                {},
                { text: 'Account No:',alignment: 'left',fontSize:8 ,margin:[5,0,0,0]},
                { text: this.client.acode, alignment: 'left',fontSize:8 },
               
              ], 
              [
                { text: 'Address:' , alignment: 'left',fontSize:8},
                {colSpan:2, text: this.client.address, alignment: 'left',fontSize:8 },{},
                { text: 'BOID:',alignment: 'left',fontSize:8,margin:[5,0,0,0] },
                { text: this.client.boid, alignment: 'left',fontSize:8 },
               
              ], 
            ]
          }
        },
        { 
          margin:[0,2,0,0],
          layout: 'noBorders',
         // alignment:'center',
          table:{
            headerRows: 1,
           // alignment:'center',
            style:'',
            fontSize:9.5,
           // lineWidth:.5,
          //  margin:[0,2,0,0],
           // heights: 15, 
            //padding:[0,10,0,0],
            widths: [ '8%', '12%', '9%','15%', '8%', '9%','10%', '8%', '10%','12%'],
            body: [
              [
               // {border: [false, false, false, false],},
                {text:'Voucher',style:'tableHeader'}, 
                {text:'Date',style:'tableHeader'}, 
                {text:'Type',style:'tableHeader',alignment:'left'}, 
                {text:'Instrument',style:'tableHeader',alignment:'left'}, 
                {text:'Quantity',style:'tableHeader'}, 
                {text:'Rate',style:'tableHeader2'}, 
                {text:'Debit',style:'tableHeader2'}, 
                {text:'Credit',style:'tableHeader2'}, 
                {text:'Comission',style:'tableHeader'}, 
                {text:'Balance',style:'tableHeader',alignment:'center' }
              ],
              ...this.ledgers.map(p => ([ 
                {text: p.vno,style:'valuesTable'} , 
                {text: formatDate(p.tdate,'MMM dd, yyyy','en_US'),style:'valuesTable'}, 
                {text: p.type,style:'valuesTable',alignment:'left'},
                {text: p.narr,style:'valuesTable',alignment:'left'},
                {text: p.quantity,style:'valuesTable',alignment:'right'},
                {text: Number(p.rate.toFixed(2)).toLocaleString(),style:'valuesTable',alignment:'right'},
                {text: Number(p.debit.toFixed(2)).toLocaleString(),style:'valuesTable',alignment:'right'},
                {text: p.credit.toFixed(2),style:'valuesTable',alignment:'right'},
                {text: Number(p.commission.toFixed(2)).toLocaleString(),style:'valuesTable',alignment:'right'},
                {text: Number((p.totalBalance).toFixed(2)).toLocaleString(), fontSize:9,
                  margin:[2,0,2,0],alignment:'right'} 
              
              ])
                ),
             // [{text: 'Total Amount', colSpan: 3}, {}, {}, this.invoice.products.reduce((sum, p)=> sum + (p.qty * p.price), 0).toFixed(2)]
            ]
          }
    
        },
        {
          canvas: [ { type: 'line', x1: 0, y1: 0, x2: 535, y2: 0, lineWidth: .5 } ],
          margin: [0, 10 ,0, 10],
          
        },
      ],
      styles:{
        tableHeader: {
          bold: true,
          fontSize: 9,
          color: 'white',
          fillColor: '#2d4154',
          alignment: 'left',
          margin:[2,0,0,0]
        },
        tableHeader2: {
          bold: true,
          fontSize: 9,
          color: 'white',
          fillColor: '#2d4154',
          alignment: 'right',
          margin:[2,0,0,0]
        },
        valuesTable:{
        fontSize:9,
        margin:[2,0,0,0],
        },
        balanceValues:{
          fontSize:9,
          margin:[0,5,0,0]
        },
        details:{
         fontSize:9,
         color:'#555555',
         margin:[0,0,0,0]
        },
        label:{
         fontSize:9,
         color:'#555555',
         margin:[20,0,0,0]
        },
        empLabel:{
         height:15
        },
        marginTop:{
         // margin-top:10px
        },
        headerSt:{
         fillColor: '#2d4154',
         color: 'blue',
         fontFamily:''
        }
      }
      
    }
    
  }

  getReport(){
    /* if(!this.portfolio){
       this.toster.error("Invalid Code!!!")
       return false
     } */
     let valid=false
     this.clientReportService.getValid(this.inputForm.get('code').value).subscribe({
       next:(res=>{
       //  console.log(res)
         if(res){
          valid=true
          if(valid){
           this.clientReportService.getLedgerReport(this.inputForm.value).subscribe({
             next:(res=>{
               let blob:Blob=res.body as Blob
               let url=window.URL.createObjectURL(blob)
               window.open(url)
             }),
             error:(err=>{
               console.log(err)
             })
           })
         }
         }
       }),
       error:(err=>{
        // console.log(err)
         return false
       })
     })
     console.log(valid)
   
    
   }
}
