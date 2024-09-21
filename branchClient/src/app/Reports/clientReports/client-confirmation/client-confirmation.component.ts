import { Component } from '@angular/core';
import { IClientConfirmation } from '../../models/clientConfirmation';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { IClientDetails } from 'src/app/shared/models/clientDetails';
import { ClientReportsService } from '../client-reports.service';
import { ToastrService } from 'ngx-toastr';
import { ClientDetailsService } from 'src/app/shared/services/client-details.service';
import { formatDate, formatNumber } from '@angular/common';

var pdfMake = require('pdfmake/build/pdfmake.js');
var pdfFonts = require('pdfmake/build/vfs_fonts.js');
(<any>pdfMake).vfs = pdfFonts.pdfMake.vfs;

@Component({
  selector: 'app-client-confirmation',
  templateUrl: './client-confirmation.component.html',
  styleUrls: ['./client-confirmation.component.scss']
})
export class ClientConfirmationComponent {
  confirmations: IClientConfirmation;
  inputForm:FormGroup;
  client:IClientDetails

  constructor(private clientReportService: ClientReportsService,private toster:ToastrService,private clientService:ClientDetailsService) { }

  ngOnInit(): void {
    
     this.createForm()
   
   }
   createForm(){
    this.inputForm=new FormGroup({
      date:new FormControl('',[Validators.required]),
      code:new FormControl('',[Validators.required]),
      
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
  
  this.getData()
  this.getClient()
 
}
getData() {
  this.clientReportService.getClientConfirmation(this.inputForm.value).subscribe({
   next:(confirmation:IClientConfirmation)=>{
   
     this.confirmations=confirmation
  
   },
  // complete:()=>{},
   error:(err:any)=>{
     console.log(err)
     this.confirmations=null
    
   }
  })

 }

 async onPrint(){
  if(this.confirmations.confirmationDetailsList.length ==0){
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
         
              text:'Client Confirmation',
              alignment:'center',
              margin: [0, 0 ,0, 0],          
      },
      {
        text:'Trade date ('+ formatDate(this.inputForm.get('date').value,'dd MMMM, yyyy','en_US') +')',alignment:'center'
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
          headerRows: 2,
         // alignment:'center',
          style:'',
          fontSize:9.5,
         // lineWidth:.5,
        //  margin:[0,2,0,0],
         // heights: 15, 
          //padding:[0,10,0,0],
          widths: [ 'auto', 'auto', 'auto','auto', 'auto', 'auto','auto', 'auto', 'auto','auto','auto','*'],
          body: [
            [
             // {border: [false, false, false, false],},
              {text:'Exch',style:'tableHeader'}, 
              {text:'Code',style:'tableHeader'}, 
              {text:'Instrument',style:'tableHeader',alignment:'center'}, 
              {text:'Buy Quantity',style:'tableHeader',alignment:'center'}, 
              {text:'Buy Rate',style:'tableHeader2'}, 
              {text:'Buy Amount',style:'tableHeader2'}, 
              {text:'Sale Quantity',style:'tableHeader2'}, 
              {text:'Sale Rate',style:'tableHeader2'}, 
              {text:'Sale Amount',style:'tableHeader'}, 
              {text:'Balance Quantity',style:'tableHeader',alignment:'center' },
              {text:'Com (B+S)',style:'tableHeader'}, 
              {text:'Balance',style:'tableHeader',alignment:'center' }
            ],
            ...this.confirmations.confirmationDetailsList.map(p => ([ 
              {text: p.exch,style:'valuesTable'} , 
              {text: p.code,style:'valuesTable'}, 
              {text: p.instrument,style:'valuesTable',alignment:'left'},
              {text: p.buyQty,style:'valuesTable',alignment:'right'},
              {text: p.buyRate,style:'valuesTable',alignment:'right'},
              {text: Number(p.buyAmt).toLocaleString(),style:'valuesTable',alignment:'right'},
              {text: Number(p.saleQty).toLocaleString(),style:'valuesTable',alignment:'right'},
              {text: Number(p.saleRate).toFixed(2),style:'valuesTable',alignment:'right'},
              {text: Number(p.saleAmt).toLocaleString(),style:'valuesTable',alignment:'right'},
              {text: p.balQty,style:'valuesTable',alignment:'right'},
              {text: Number(p.com_B_S).toLocaleString(),style:'valuesTable',alignment:'right'},
              {text: Number(p.balance).toFixed(2).toLocaleString(), fontSize:9,
                margin:[2,0,0,0],alignment:'right'} 
            
            ])
              ),
           // [{text: 'Total Amount', colSpan: 3}, {}, {}, this.invoice.products.reduce((sum, p)=> sum + (p.qty * p.price), 0).toFixed(2)]
          ]
        }
  
      },
      {
        canvas: [ { type: 'line', x1: 0, y1: 0, x2: 540, y2: 0, lineWidth: .5 } ],
        margin: [0, 10 ,0, 1],
        
      },
      {
        text:Number(this.confirmations.netAmountTrading).toFixed(2).toLocaleString(),fontSize:9,alignment:'right',bold:true
      },
      {
        layout: "noBorders",
        //fontSize: 8,
        margin: [10, 10, 0, 0],
        table: {
          widths: ["*", "*",'*'], 
          body: [
            [
              { text: 'Ledger balance before trading' , alignment: 'left',fontSize:9},
              { text: (Number(this.confirmations.ledger).toFixed(2)).toLocaleString(), alignment: 'right',fontSize:9 },   
              {}         
            ], 
            [
              { text: 'Add: Receipt' , alignment: 'left',fontSize:9},
              { text: Number(this.confirmations.reciept).toFixed(2), alignment: 'right',fontSize:9 },  {}          
            ], 
            [
              { text: 'Less: Payment' , alignment: 'left',fontSize:9},
              { text: Number(this.confirmations.payment).toFixed(2), alignment: 'right',fontSize:9 },  {}          
            ], 
            [
              { text: 'Net Amount of Trading' , alignment: 'left',fontSize:9},
              { text: Number(this.confirmations.netAmountTrading).toFixed(2), alignment: 'right',fontSize:9 }, {}           
            ], 
            [
              { text: 'Closing Balance of the day' , alignment: 'left',fontSize:9},
              { text: Number(this.confirmations.closingBalance).toFixed(2), alignment: 'right',fontSize:9 },       {}     
            ], 
          ]
        }
      }
    ],
    styles:{
      tableHeader: {
        bold: true,
        fontSize: 10,
        color: 'white',
        fillColor: '#2d4154',
        alignment: 'left',
        margin:[2,0,0,0]
      },
      tableHeader2: {
        bold: true,
        fontSize: 10,
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

 

}
