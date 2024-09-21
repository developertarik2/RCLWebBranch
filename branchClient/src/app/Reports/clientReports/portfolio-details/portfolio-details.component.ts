import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { IPortfolioDetails } from '../../models/plDetails';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { ClientReportsService } from '../client-reports.service';
import { ToastrService } from 'ngx-toastr';
import { IClientDetails } from 'src/app/shared/models/clientDetails';
import { ClientDetailsService } from 'src/app/shared/services/client-details.service';
import { IPOShareList } from '../../models/ipoShare';
import { formatDate } from '@angular/common';

var pdfMake = require('pdfmake/build/pdfmake.js');
var pdfFonts = require('pdfmake/build/vfs_fonts.js');
(<any>pdfMake).vfs = pdfFonts.pdfMake.vfs;

@Component({
  selector: 'app-portfolio-details',
  templateUrl: './portfolio-details.component.html',
  styleUrls: ['./portfolio-details.component.scss']
})
export class PortfolioDetailsComponent implements  OnInit {
  @ViewChild(DataTableDirective, {static: false})
  dtElement: DataTableDirective;

  portfolioDetails: IPortfolioDetails;
  inputForm:FormGroup;
  client:IClientDetails


  constructor(private clientReportService: ClientReportsService,private toster:ToastrService,private clientService:ClientDetailsService) { }

  ngOnInit(): void {
   
     this.createForm()
 
   }

   createForm(){
    this.inputForm=new FormGroup({
      fromDate:new FormControl('',[Validators.required]),
      code:new FormControl('',[Validators.required]),
      toDate:new FormControl('',[Validators.required]),
    })
  }

  getData() {
    this.clientReportService.getPortFolioDetails(this.inputForm.value).subscribe({
     next:(portfolioDetails:IPortfolioDetails)=>{
     
       this.portfolioDetails=portfolioDetails
       console.log(this.portfolioDetails)
    
      
     },
    // complete:()=>{},
     error:(err:any)=>{
       console.log(err)
       this.portfolioDetails=null
      
     }
    })
 
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

   onSubmit(){
    if(Date.parse( this.inputForm.get('fromDate').value) > Date.parse( this.inputForm.get('toDate').value)){
      this.toster.error("From date can't be greater than To Date")
      //console.log("wrong")
      return false
    }
       
   
    this.getData()
    this.getClient()
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
  async onPrint(){
    if(!this.portfolioDetails){
      this.toster.error("Invalid Code!!!")
      return false
    }
    if(!this.portfolioDetails.iPOShareLists){
      this.portfolioDetails.iPOShareLists=[]
    }

    if(!this.portfolioDetails.bonusShareLists){
      this.portfolioDetails.bonusShareLists=[]
    }

    if(!this.portfolioDetails.rightShareLists){
      this.portfolioDetails.rightShareLists=[]
    }
    
    //var test: IPOShareList = {firmsnm1: 'abc', quantity:10, amount: 100,dat:'2023-09-11'};

   // this.portfolioDetails?.iPOShareLists.push(test)

   // this.portfolioDetails?.bonusShareLists.push(test)

   // this.portfolioDetails?.rightShareLists.push(test)


    const documentDefinition=await this.getDocumentDefinition();
       pdfMake.createPdf(documentDefinition).open();    
  }
  async getDocumentDefinition(){
    const str = new Date().toLocaleString('en-US', { timeZone: 'Asia/Dhaka' });

    let docDefinition=  {
      pageMargins: [ 15, 30, 15, 40 ],

      footer: (currentPage:any, pageCount:any) => {
        var t = {
          layout: "noBorders",
          fontSize: 8,
          margin: [15, 10, 15, 0],
          table: {
            widths: ["*", "*",'*'], 
            body: [
              [
                { text: 'Print Date: '+ formatDate(str,'dd MMM, yyyy h:mm:ss a z','en_US'), alignment: 'left',fontSize:8},
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

        }
    /*    {
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
           
                text:'Portfolio Details',
                alignment:'center',
                margin: [0, 0 ,0, 0],          
        },
        {
          text:'Transaction date ('+ this.inputForm.get('fromDate').value+' to ' +this.inputForm.get('toDate').value +')',alignment:'center'
        },
        {
          canvas: [ { type: 'line', x1: 0, y1: 0, x2: 535, y2: 0, lineWidth: .5 } ],
          margin: [0, 10 ,0, 10],
          
        },
        {
          layout: "noBorders",
       
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
     
          table:{
            headerRows: 1,
      
            style:'',
            fontSize:9.5,
        
            widths: [ 'auto', 'auto', 'auto','auto', 'auto', 'auto','auto', 'auto', 'auto','auto','auto','auto','auto'],
            body: [
              [
               // {border: [false, false, false, false],},
                {text:'SL#',style:'tableHeader'}, 
                {text:'Instrument',style:'tableHeader'}, 
                {text:'Bought Quantity',style:'tableHeader',alignment:'center'}, 
                {text:'Bought Cost',style:'tableHeader',alignment:'center'}, 
                {text:'Sold Quantity',style:'tableHeader'}, 
                {text:'Sold Cost',style:'tableHeader2'}, 
                {text:'Realised Gain/Loss',style:'tableHeader2'}, 
                {text:'Balance Quantity',style:'tableHeader2'}, 
                {text:'Balance Rate',style:'tableHeader2'}, 
                {text:'Balance Amount',style:'tableHeader',alignment:'center'}, 
                {text:'Market Rate',style:'tableHeader2'}, 
                {text:'Market Amount',style:'tableHeader',alignment:'center'}, 
                {text:'Unrealised Gain',style:'tableHeader',alignment:'center' }
              ],
              ...this.portfolioDetails?.plDetailList?.map(p => ([ 
                {text: p.sl,style:'valuesTable'} , 
                {text: p.firmsnm1,style:'valuesTable'}, 
                {text: p.buyQnty,style:'valuesTable',alignment:'right'},
                {text: p.buyAmount,style:'valuesTable',alignment:'right'},
                {text: p.saleQnt,style:'valuesTable',alignment:'right'},
                {text: Number(p.saleAmnt).toLocaleString(),style:'valuesTable',alignment:'right'},
                {text: Number(p.rg).toLocaleString(),style:'valuesTable',alignment:'right'},
                {text: p.bq,style:'valuesTable',alignment:'right'},
                {text: p.br,style:'valuesTable',alignment:'right'},
                {text: p.ba, fontSize:8,
                  margin:[2,0,10,0],alignment:'right'} ,
                {text: p.tmr,style:'valuesTable',alignment:'right'},
                  {text: Number(p.tma).toLocaleString(), fontSize:8,
                    margin:[2,0,10,0],alignment:'right'} ,
                {text: p.tug,style:'valuesTable',alignment:'right'},
              ])
                ),
                [
                 {
                  colSpan:13,canvas: [ { type: 'line', x1: 0, y1: 0, x2: 560, y2: 0, lineWidth: .5 } ],margin:[2,0,0,0]
                 },{},{},{},{},{},{},{},{},{},{},{},{}
                ],
                [
                  {text:this.portfolioDetails?.boughtCost.toFixed(2),colSpan:4,style:'valuesTable',alignment:'right'},{},{},{},
                  {text:this.portfolioDetails?.soldCost.toFixed(2),colSpan:2,style:'valuesTable',alignment:'right'},{},
                  {text:this.portfolioDetails?.realisedCapitalGainLoss.toFixed(2),style:'valuesTable',alignment:'right'},
                  {text:this.portfolioDetails?.balanceAmnt.toFixed(2),colSpan:3,style:'valuesTable',alignment:'right',margin:[0,0,6,0]},{},{},
                  {text:this.portfolioDetails?.marketAmnt.toFixed(2),colSpan:2,style:'valuesTable',alignment:'right',margin:[0,0,6,0]},{},
                  {text:this.portfolioDetails?.unrealisedGain.toFixed(2),style:'valuesTable',alignment:'right'}
                ]
           
            ]
          }
    
        },
   
        {

        },
        {
        
          margin: [10, 10, 0, 0],
          table: {
            widths: ["*", "*",'*'], 
            body: [
            [
              {},{},{}
            ]
            ]
          }
        }, */

      ],
      styles:{
        tableHeader: {
          bold: true,
          fontSize: 8,
          color: 'white',
          fillColor: '#2d4154',
          alignment: 'left',
          margin:[0,0,0,0]
        },
        tableHeader2: {
          bold: true,
          fontSize: 8,
          color: 'white',
          fillColor: '#2d4154',
          alignment: 'right',
          margin:[0,0,0,0]
        },
        valuesTable:{
        fontSize:8,
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

    docDefinition.content.push(
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
         
              text:'Portfolio Details',
              alignment:'center',
              margin: [0, 0 ,0, 0],          
      },
      {
        text:'Transaction date ('+ this.inputForm.get('fromDate').value+' to ' +this.inputForm.get('toDate').value +')',alignment:'center'
      },
      {
        canvas: [ { type: 'line', x1: 0, y1: 0, x2: 535, y2: 0, lineWidth: .5 } ],
        margin: [0, 10 ,0, 10],
        
      },
      {
        layout: "noBorders",
     
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
   
        table:{
          headerRows: 1,
    
          style:'',
          fontSize:9.5,
      
          widths: [ 'auto', 'auto', 'auto','auto', 'auto', 'auto','auto', 'auto', 'auto','auto','auto','auto','auto'],
          body: [
            [
             // {border: [false, false, false, false],},
              {text:'SL#',style:'tableHeader'}, 
              {text:'Instrument',style:'tableHeader'}, 
              {text:'Bought Quantity',style:'tableHeader',alignment:'center'}, 
              {text:'Bought Cost',style:'tableHeader',alignment:'center'}, 
              {text:'Sold Quantity',style:'tableHeader'}, 
              {text:'Sold Cost',style:'tableHeader2'}, 
              {text:'Realised Gain/Loss',style:'tableHeader2'}, 
              {text:'Balance Quantity',style:'tableHeader2'}, 
              {text:'Balance Rate',style:'tableHeader2'}, 
              {text:'Balance Amount',style:'tableHeader',alignment:'center'}, 
              {text:'Market Rate',style:'tableHeader2'}, 
              {text:'Market Amount',style:'tableHeader',alignment:'center'}, 
              {text:'Unrealised Gain',style:'tableHeader',alignment:'center' }
            ],
            ...this.portfolioDetails?.plDetailList?.map(p => ([ 
              {text: p.sl,style:'valuesTable'} , 
              {text: p.firmsnm1,style:'valuesTable'}, 
              {text: p.buyQnty,style:'valuesTable',alignment:'right'},
              {text: p.buyAmount,style:'valuesTable',alignment:'right'},
              {text: p.saleQnt,style:'valuesTable',alignment:'right'},
              {text: Number(p.saleAmnt).toLocaleString(),style:'valuesTable',alignment:'right'},
              {text: Number(p.rg).toLocaleString(),style:'valuesTable',alignment:'right'},
              {text: p.bq,style:'valuesTable',alignment:'right'},
              {text: p.br,style:'valuesTable',alignment:'right'},
              {text: p.ba, fontSize:8,
                margin:[2,0,10,0],alignment:'right'} ,
              {text: p.tmr,style:'valuesTable',alignment:'right'},
                {text: Number(p.tma).toLocaleString(), fontSize:8,
                  margin:[2,0,10,0],alignment:'right'} ,
              {text: p.tug,style:'valuesTable',alignment:'right'},
            ])
              ),
              [
               {
                colSpan:13,canvas: [ { type: 'line', x1: 0, y1: 0, x2: 560, y2: 0, lineWidth: .5 } ],margin:[2,0,0,0]
               },{},{},{},{},{},{},{},{},{},{},{},{}
              ],
              [
                {text:this.portfolioDetails?.boughtCost.toFixed(2),colSpan:4,style:'valuesTable',alignment:'right'},{},{},{},
                {text:this.portfolioDetails?.soldCost.toFixed(2),colSpan:2,style:'valuesTable',alignment:'right'},{},
                {text:this.portfolioDetails?.realisedCapitalGainLoss.toFixed(2),style:'valuesTable',alignment:'right'},
                {text:this.portfolioDetails?.balanceAmnt.toFixed(2),colSpan:3,style:'valuesTable',alignment:'right',margin:[0,0,6,0]},{},{},
                {text:this.portfolioDetails?.marketAmnt.toFixed(2),colSpan:2,style:'valuesTable',alignment:'right',margin:[0,0,6,0]},{},
                {text:this.portfolioDetails?.unrealisedGain.toFixed(2),style:'valuesTable',alignment:'right'}
              ]
         
          ]
        }
  
      },
      {
        canvas: [ { type: 'line', x1: 0, y1: 0, x2: 560, y2: 0, lineWidth: .5 } ],margin:[2,2,0,0]
      }
    )
    if(this.portfolioDetails.iPOShareLists?.length>0){
      docDefinition.content.push(
      {
        canvas: [ { type: 'line', x1: 0, y1: 0, x2: 560, y2: 0, lineWidth: .5 } ],
        margin: [0, 10 ,0, 10],
        
      },
      {
         
        text:'IPO Shares',
        alignment:'center',
        margin: [0, 0 ,0, 0],          
      },
      { 
        margin:[20,2,0,0],
        layout: 'noBorders',
       // alignment:'center',
        table:{
          headerRows: 1,
         // alignment:'center',
          style:'',
          fontSize:9.5,
      
          widths: [ '20%', '20%', '20%','20%'],
          body: [
            [
             // {border: [false, false, false, false],},
              //{text:'SL#',style:'tableHeader'}, 
              {text:'Instrument',style:'tableHeader'}, 
              {text:'Quantity',style:'tableHeader',alignment:'center'}, 
              {text:'Amount',style:'tableHeader',alignment:'center'}, 
              {text:'Date',style:'tableHeader',alignment:'center'},                
            ],
            ...this.portfolioDetails?.iPOShareLists?.map(p => ([ 
             // {text: p.sl,style:'valuesTable'} , 
              {text: p?.firmsnm1,style:'valuesTable'}, 
              {text: p?.quantity,style:'valuesTable',alignment:'center'},
              {text: p?.amount,style:'valuesTable',alignment:'center'},
              {text: p?.dat,style:'valuesTable',alignment:'center'},
            
            ])
              ),
             
          ]
        }
  
      },
     
     )
    }

    if(this.portfolioDetails.bonusShareLists?.length>0){
       docDefinition.content.push(
        {
          canvas: [ { type: 'line', x1: 0, y1: 0, x2: 535, y2: 0, lineWidth: .5 } ],
          margin: [0, 10 ,0, 10],
          
        },
       {
           
          text:'BONUS Shares',
          alignment:'center',
          margin: [20, 0 ,0, 0],          
        },
        { 
          margin:[20,2,0,0],
          layout: 'noBorders',
         // alignment:'center',
          table:{
            headerRows: 1,
           // alignment:'center',
            style:'',
            fontSize:9.5,
        
            widths: [ '20%', '20%', '20%','20%'],
            body: [
              [
               // {border: [false, false, false, false],},
                //{text:'SL#',style:'tableHeader'}, 
                {text:'Instrument',style:'tableHeader'}, 
                {text:'Quantity',style:'tableHeader',alignment:'center'}, 
                {text:'Amount',style:'tableHeader',alignment:'center'}, 
                {text:'Date',style:'tableHeader',alignment:'center'},                
              ],
              ...this.portfolioDetails?.bonusShareLists?.map(p => ([ 
               // {text: p.sl,style:'valuesTable'} , 
                {text: p.firmsnm1,style:'valuesTable'}, 
                {text: p.quantity,style:'valuesTable',alignment:'center'},
                {text: p.amount,style:'valuesTable',alignment:'center'},
                {text: p.dat,style:'valuesTable',alignment:'center'},
              
              ])
                ),
               
            ]
          }
    
        },
       )
    }
    if(this.portfolioDetails.rightShareLists?.length>0){
      docDefinition.content.push(
        {
          canvas: [ { type: 'line', x1: 0, y1: 0, x2: 535, y2: 0, lineWidth: .5 } ],
          margin: [0, 10 ,0, 10],
          
        },
        {
           
          text:'RIGHT Shares',
          alignment:'center',
          margin: [0, 0 ,0, 0],          
        },
        { 
          margin:[20,2,0,0],
          layout: 'noBorders',
         // alignment:'center',
          table:{
            headerRows: 1,
           // alignment:'center',
            style:'',
            fontSize:9.5,
        
            widths: [ '20%', '20%', '20%','20%'],
            body: [
              [
               // {border: [false, false, false, false],},
                //{text:'SL#',style:'tableHeader'}, 
                {text:'Instrument',style:'tableHeader'}, 
                {text:'Quantity',style:'tableHeader',alignment:'center'}, 
                {text:'Amount',style:'tableHeader',alignment:'center'}, 
                {text:'Date',style:'tableHeader',alignment:'center'},                
              ],
              ...this.portfolioDetails?.rightShareLists?.map(p => ([ 
               // {text: p.sl,style:'valuesTable'} , 
                {text: p.firmsnm1,style:'valuesTable'}, 
                {text: p.quantity,style:'valuesTable',alignment:'center'},
                {text: p.amount,style:'valuesTable',alignment:'center'},
                {text: p.dat,style:'valuesTable',alignment:'center'},
              
              ])
                ),
               
            ]
          }
    
        },
      )

    } 
   // if(this.portfolioDetails.openingShareBal){
      docDefinition.content.push(
        {
          layout: "noBorders",
          //fontSize: 8,
          margin: [10, 30, 0, 0],
          table: {
            widths: ['*', "*", "*",'*'], 
            body: [
              [
                {},
                { text: 'Opening Share Balance' , alignment: 'left',fontSize:8,margin:[5,0,0,0]},
                { text: this.portfolioDetails?.openingShareBal?.toFixed(2), alignment: 'right',fontSize:8 },
                {},           
              ], 
              [
                {},
                { text: 'Ledger Balance',alignment: 'left',fontSize:8 ,margin:[5,0,0,0]},
                { text: this.portfolioDetails?.ledgerBal?.toFixed(2), alignment: 'right',fontSize:8 },{}
              ],
              [
                {},
                { text: 'Portfolio Value Market Price',alignment: 'left',fontSize:8 ,margin:[5,0,0,0]},
                { text: this.portfolioDetails?.portfolioValueMarket?.toFixed(2), alignment: 'right',fontSize:8 },{}
              ],
              [ 
                {},
                { text: 'Portfolio Value Cost Price' , alignment: 'left',fontSize:8,margin:[5,0,0,0]},
                { text: this.portfolioDetails?.portfolioValueCost?.toFixed(2), alignment: 'right',fontSize:8 },
                {},           
              ], 
              [
                {},
                { text: 'Deposit',alignment: 'left',fontSize:8 ,margin:[5,0,0,0]},
                { text: this.portfolioDetails?.deposit?.toFixed(2), alignment: 'right',fontSize:8 },{}
              ],
              [
                {},
                { text: 'Withdrawn Amount',alignment: 'left',fontSize:8 ,margin:[5,0,0,0]},
                { text: this.portfolioDetails?.withdrawnAmount?.toFixed(2), alignment: 'right',fontSize:8 },{}
              ],
              [
                {},
                { text: 'Charges',alignment: 'left',fontSize:8 ,margin:[5,0,0,0]},
                { text: this.portfolioDetails?.charges?.toFixed(2), alignment: 'right',fontSize:8 },{}
              ],
              [
                {},
                { text: 'Net Deposit',alignment: 'left',fontSize:8 ,margin:[5,0,0,0]},
                { text: this.portfolioDetails?.netDeposit?.toFixed(2), alignment: 'right',fontSize:8 },{}
              ],
              [
                {},
                { text: 'Realised Capital Gain/Loss',alignment: 'left',fontSize:8 ,margin:[5,0,0,0]},
                { text: this.portfolioDetails?.realisedCapitalGainLoss?.toFixed(2), alignment: 'right',fontSize:8 },{}
              ]
            ]
          }
        },
      )
   // }
  
    return docDefinition;
  }
  
}
