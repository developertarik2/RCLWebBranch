import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DataTableDirective } from 'angular-datatables';
import { IClientPortfolio } from '../../models/portfolio';
import { Subject } from 'rxjs';
import { ClientReportsService } from '../client-reports.service';
import { ToastrService } from 'ngx-toastr';
import { IClientDetails } from 'src/app/shared/models/clientDetails';
import { ClientDetailsService } from 'src/app/shared/services/client-details.service';
import { formatDate } from '@angular/common';

var pdfMake = require('pdfmake/build/pdfmake.js');
var pdfFonts = require('pdfmake/build/vfs_fonts.js');
(<any>pdfMake).vfs = pdfFonts.pdfMake.vfs;

@Component({
  selector: 'app-portfolio',
  templateUrl: './portfolio.component.html',
  styleUrls: ['./portfolio.component.scss']
})
export class PortfolioComponent implements OnDestroy, OnInit,AfterViewInit {
  @ViewChild(DataTableDirective, {static: false})
  dtElement: DataTableDirective;

  portfolio: IClientPortfolio;
  client:IClientDetails
  inputForm:FormGroup;

  dtOptions: DataTables.Settings = {}
    
  dtTrigger: Subject<any> = new Subject<any>();

  constructor(private clientReportService: ClientReportsService,private toster:ToastrService,private clientService: ClientDetailsService) { }

  ngOnInit(): void {
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
   createForm(){
    this.inputForm=new FormGroup({
      
      code:new FormControl('',[Validators.required]),
     
    })
  }

  onSubmit(){
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      // Destroy the table first
      dtInstance.destroy();
      // Call the dtTrigger to rerender again
           
    });
    this.getData()
  }

  getData(){
    this.clientReportService.getPortfolio(this.inputForm.value).subscribe({
      next:(port:IClientPortfolio)=>{
      
        this.portfolio=port
        this.getClient();
     
        this.dtTrigger.next(null);
      },
     // complete:()=>{},
      error:(err:any)=>{
        console.log(err)
        this.portfolio=null
        this.dtTrigger.next(null);
      }
     })
  }
  ngAfterViewInit(): void {
    this.dtTrigger.next(null);
  }
  ngOnDestroy(): void {
    // Do not forget to unsubscribe the event
    this.dtTrigger.unsubscribe();
  }

  async onPrint(){
    if(!this.portfolio){
      this.toster.error("Invalid Code!!!")
      return false
    }
   
    const str = new Date().toLocaleString('en-US', { timeZone: 'Asia/Dhaka' });
    console.log(str);
    const documentDefinition=await this.getDocumentDefinition();
       pdfMake.createPdf(documentDefinition).open();    
  }
  async getDocumentDefinition(){
    const str = new Date().toLocaleString('en-US', { timeZone: 'Asia/Dhaka' });

    return   { 
      pageMargins: [ 20, 30, 20, 40 ],
      //header: 'simple text',
     /* footer: {
       margin:[10,0,10],
       columns: [
         //{ text: str,fontSize:9},
         [
          { text: 'Print Date: '+ str.toString(), alignment: 'left',fontSize:8 }
         ],
         [
          { text: ' This is a computer generated statement. No signature is required', alignment: 'center',fontSize:6 }
         ],
         [
          {text:'Page: ',fontSize:8,alignment: 'right'}
         ]
        
       
       ]
     }, */
    /*  background: [
       {
           //image: 'data:image/jpeg;base64,/9j/4QAY...',
           image: await this.getBase64ImageFromURL(
             "../../assets/images/royal.png"
           ),
           width: 680
       }
     ],*/
     footer: (currentPage:any, pageCount:any) => {
      var t = {
        layout: "noBorders",
        fontSize: 8,
        margin: [15, 10, 15, 0],
        table: {
          widths: ["*", "*",'*'], 
          body: [
            [
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
          margin: [0, 5 ,0, 5],
          
        },
        {
           
                text:'Portfolio',
                alignment:'center',
                margin: [0, 0 ,0, 0],          
        },
        {
          canvas: [ { type: 'line', x1: 0, y1: 0, x2: 535, y2: 0, lineWidth: .5 } ],
          margin: [0, 5 ,0, 5],
          
        },
        {
          layout: "noBorders",
          //fontSize: 8,
          margin: [10, 5, 0, 0],
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
   /*     {
          columns:[
           [
              {
                text: 'Account Holder Name : '+this.client.aname,
                fontSize:9
              },
              {
                text: 'Address : '+this.client.address,fontSize:9,margin:[0,1,0,0]
                
               },
           ],
           [
            {
              text: 'Account No : '+this.client.acode,
              fontSize:9, alignment:'center',
             },
             {
              text: 'BOID : '+this.client.boid,fontSize:9, alignment:'center',margin:[21,1,0,0]
             },
            
           ]
          ],
          margin:[0,2,0,2],
     }, */
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
        widths: [ '4%', '*', '8%','8%', '5%', '10%','12%', '11%', '12%','12%'],
        body: [
          [
           // {border: [false, false, false, false],},
            {text:'SL#',style:'tableHeader'}, 
            {text:'Instrument',style:'tableHeader'}, 
            {text:'Total',style:'tableHeader',alignment:'right'}, 
            {text:'Free',style:'tableHeader',alignment:'right'}, 
            {text:'Lock',style:'tableHeader'}, 
            {text:'Avg-Price',style:'tableHeader',alignment:'center'}, 
            {text:'Total Cost',style:'tableHeader',alignment:'center'}, 
            {text:'Market Rate',style:'tableHeader'}, 
            {text:'Market Value',style:'tableHeader'}, 
            {text:'Gain/Loss',style:'tableHeader',alignment:'center' }
          ],
          ...this.portfolio?.companyLists.map(p => ([ 
            {text: p.sl,style:'valuesTable'} , 
            {text: p.firmsnm1,style:'valuesTable'}, 
            {text: Number(p.quantity.toFixed(2)).toLocaleString(),style:'valuesTable',alignment:'right'},
            {text: p.slbqty,style:'valuesTable',alignment:'right'},
            {text: p.pldqty,style:'valuesTable'},
            {text: Number(p.rate.toFixed(2)).toLocaleString(),style:'valuesTable',alignment:'right'},
            {text: Number(p.amount.toFixed(2)).toLocaleString(),style:'valuesTable',alignment:'right'},
            {text: p.mktrt.toFixed(2),style:'valuesTable',alignment:'right'},
            {text: Number(p.mktamt.toFixed(2)).toLocaleString(),style:'valuesTable',alignment:'right'},
            {text: Number((p.mktamt - p.amount).toFixed(2)).toLocaleString(), fontSize:9,
              margin:[2,0,2,0],alignment:'right'} 
          
          ])
            ),
            [
              {colSpan:10, canvas: [ { type: 'line', x1: 0, y1: 0, x2: 550, y2: 0, lineWidth: .5 } ],margin: [0, 2 ,0, 2], },
              {},{},{},{},{},{},{},{},{}
            ],
            [
              {colSpan:2,text:'Grand-Total',fontSize:9, alignment:'right'},{},
              {colSpan:5,text: Number(this.portfolio?.totalBuyCost?.toFixed(2)).toLocaleString(),style:'valuesTable',bold:true, alignment:'right'},{},{},{},{},
              {colSpan:2,text: Number(this.portfolio?.marketVal?.toFixed(2)).toLocaleString(),style:'valuesTable',bold:true, alignment:'right'},{},{}
            ],
            
         // [{text: 'Total Amount', colSpan: 3}, {}, {}, this.invoice.products.reduce((sum, p)=> sum + (p.qty * p.price), 0).toFixed(2)]
        ]
      }

    },
    {
      canvas: [ { type: 'line', x1: 0, y1: 0, x2: 550, y2: 0, lineWidth: .5 } ],
      margin: [0, 10 ,0, 10],
      
    },
  /*  {
      columns:[
        [
          {text:'Matured Fund' },{text:'Receivable Sales',style:'balanceValues'},{text:'Ledger Balance',style:'balanceValues'}//{text:'Accrued Charges'}
        ],
        [
            {text:(this.portfolio.maturedBal.toFixed(2)).toLocaleString() },
            {text:(this.portfolio.saleRec.toFixed(2)).toLocaleString() ,style:'balanceValues'},{text:(this.portfolio.ledgerBal.toFixed(2)).toLocaleString() ,style:'balanceValues'}
        ],
        [
          {text:'Market Value' },{text:'Equity (All Instrument)',style:'balanceValues'},{text:'Equity (Marginable Instrument)',style:'balanceValues'}
        ],
        [
          {text:(Number(this.portfolio.marketVal.toFixed(2))).toLocaleString(),alignment:'center' },
          {text:(Number(this.portfolio.equityBal.toFixed(2))).toLocaleString() ,style:'balanceValues',alignment:'center'},
          {text:(this.portfolio.equityBal.toFixed(2)).toLocaleString() ,style:'balanceValues',alignment:'center'}
        ]
      ],
      margin:[10,5,0,0],fontSize:9
    },
  //  {
     // text:'Capital Gain/ (Loss)',alignment:'center',fontSize:9, margin:[100,10,0,0],bold:true
 //   },
  /*  {
      columns:[
        [
          {text:'Accrued Charges' },{text:'Charges & Fees',style:'balanceValues'}
        ],
        [
            {text:(this.portfolio.accruedBal.toFixed(2)).toLocaleString() },
            {text:(this.portfolio.chargeFee.toFixed(2)).toLocaleString() ,style:'balanceValues'},           
        ],
        [
          {text:'Realised', margin:[0,0,0,0]},{text:'Un Realised',style:'balanceValues'},{text:'Total Capital Gain/ (Loss)',style:'balanceValues'}
        ],
        [
          {text:(Number(this.portfolio.rglBal.toFixed(2))).toLocaleString(),alignment:'center' },
          {text:(Number(this.portfolio.unrealiseBal.toFixed(2))).toLocaleString() ,style:'balanceValues',alignment:'center'},
          {text:(this.portfolio.totalCapital.toFixed(2)).toLocaleString() ,style:'balanceValues',alignment:'center'}
        ]
      ],
      margin:[10,5,0,0],fontSize:9
    },*/
    {
      layout: "noBorders",
      //fontSize: 8,
      margin: [15, 10, 15, 0],
      table: {
        widths: ["*", "*",'*','*'], 
        body: [
          [
            { text: 'Total Buy Cost' , alignment: 'left',fontSize:8},
            {text: Number(this.portfolio.totalBuyCost.toFixed(2)).toLocaleString(), alignment: 'right',fontSize:8,margin:[0,0,30,0]}, 
           
            { text: 'Market Value',alignment: 'left',fontSize:8 },
            { text: (Number(this.portfolio.marketVal.toFixed(2))).toLocaleString(), alignment: 'center',fontSize:8 },
           
          ], 
          [
            { text: 'Matured Fund' , alignment: 'left',fontSize:8},
            { text: Number(this.portfolio.maturedBal.toFixed(2)).toLocaleString(), alignment: 'right',fontSize:8,margin:[0,0,30,0] },
          
            { text: 'Equity (All Instrument)',alignment: 'left',fontSize:8 },
            { text: (Number(this.portfolio.equityBal.toFixed(2))).toLocaleString(), alignment: 'center',fontSize:8 },
           
          ],
          [
            { text: 'Receivable Sales' , alignment: 'left',fontSize:8},
            { text: (this.portfolio.saleRec.toFixed(2)).toLocaleString(), alignment: 'right',fontSize:8,margin:[0,0,30,0] },
          
            { text: 'Equity (Marginable Instrument)',alignment: 'left',fontSize:8 },
            { text: (Number(this.portfolio.equityBal.toFixed(2))).toLocaleString(), alignment: 'center',fontSize:8 },
           
          ],
          [
            { text: 'Ledger Balance' , alignment: 'left',fontSize:8},
            { text: (this.portfolio.ledgerBal.toFixed(2)).toLocaleString(), alignment: 'right',fontSize:8,margin:[0,0,30,0] },
          
            {text:'Capital Gain/ (Loss)',alignment:'left',fontSize:9,bold:true,margin:[5,5,0,2]},{}
          ],
          [
            { text: 'Accrued Charges' , alignment: 'left',fontSize:8},
            { text: Number(this.portfolio.accruedBal.toFixed(2)).toLocaleString(), alignment: 'right',fontSize:8,margin:[0,0,30,0] },
            { text: 'Realised',alignment: 'left',fontSize:8 },
            { text: (Number(this.portfolio.rglBal.toFixed(2))).toLocaleString(), alignment: 'center',fontSize:8 },
           
          ], 
          [
            { text: 'Charges & Fees' , alignment: 'left',fontSize:8},
            { text: (this.portfolio.chargeFee.toFixed(2)).toLocaleString(), alignment: 'right',fontSize:8,margin:[0,0,30,0] },
            { text: 'Un Realised',alignment: 'left',fontSize:8 },
            { text: (this.portfolio.unrealiseBal.toFixed(2)).toLocaleString(), alignment: 'center',fontSize:8 },
           
          ], 
          [
            { },
            { },
           // {},
            {colSpan:2, canvas: [ { type: 'line', x1: 0, y1: 0, x2: 120, y2: 0, lineWidth: .5 } ],color:'#f2f0e9', margin: [0, 0 ,20, 0],alignment:'right'},
            {text:''}
           
          ], 
          [
            { },
            { },
            { text: 'Total Capital Gain/ (Loss)',alignment: 'left',fontSize:8 },
            { text: (Number(this.portfolio.totalCapital.toFixed(2))).toLocaleString(), alignment: 'center',fontSize:8 },
           
          ], 
        ]
      }
    }
       
    ],
    margin: [0, 0 ,0, 0],
  styles:{
    tableHeader: {
      bold: true,
      fontSize: 9,
      color: 'white',
      fillColor: '#2d4154',
      alignment: 'left',
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
          this.clientReportService.getPortfolioReport(this.inputForm.get('code').value).subscribe({
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

  getDownloadReport(){
    
    this.clientReportService.getPortfolioReport(this.inputForm.get('code').value).subscribe({
      next:(res=>{
        let blob:Blob=res.body as Blob
        let url=window.URL.createObjectURL(blob)

        let a =document.createElement('a')
        let fileName=this.inputForm.get('code').value+'_portfolio'
        a.download=fileName
        a.href=url
        a.click()
      //  window.open(url)
      }),
      error:(err=>{
        console.log(err)
      })
    })
  }

}
