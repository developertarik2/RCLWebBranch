import { Component } from '@angular/core';
import { IClientTax } from '../../models/clientTax';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { IClientDetails } from 'src/app/shared/models/clientDetails';
import { ClientReportsService } from '../client-reports.service';
import { ToastrService } from 'ngx-toastr';
import { ClientDetailsService } from 'src/app/shared/services/client-details.service';
import { formatDate } from '@angular/common';

var pdfMake = require('pdfmake/build/pdfmake.js');
var pdfFonts = require('pdfmake/build/vfs_fonts.js');
(<any>pdfMake).vfs = pdfFonts.pdfMake.vfs;

@Component({
  selector: 'app-client-tax',
  templateUrl: './client-tax.component.html',
  styleUrls: ['./client-tax.component.scss']
})
export class ClientTaxComponent {
  tax: IClientTax;
  inputForm:FormGroup;
  client:IClientDetails

  fromDate:Date
  toDate:Date

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
  this.fromDate=this.inputForm.get('fromDate').value;
  this.toDate=this.inputForm.get('toDate').value
 this.getData()
 this.getClient()

}
getData() {
 this.clientReportService.getClientTax(this.inputForm.value).subscribe({
  next:(tax:IClientTax)=>{
  
    this.tax=tax
 
  },
 // complete:()=>{},
  error:(err:any)=>{
    console.log(err)
    this.tax=null
   
  }
 })

}

async onPrint(){
  if(!this.tax){
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
              { text: 'Print Date: '+ formatDate(str,'dd MMM, yyyy h:mm:ss a z','en_US') , alignment: 'left',fontSize:8},
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
         
              text:'To Whom It May Concern',
              alignment:'center',
              margin: [0, 0 ,0, 0],          
      },
      {
      //  text:'Transaction date ('+ this.inputForm.get('date').value+')',alignment:'center'
      },
      {
        canvas: [ { type: 'line', x1: 0, y1: 0, x2: 535, y2: 0, lineWidth: .5 } ],
        margin: [0, 10 ,0, 10],
        
      },
      {
         text:['This is to certify that Mr./Mrs. ', {text:this.client.aname.trim(),bold:true}  , ' Client Code : ',{text:this.client.acode,bold:true} , 
         ' BO ID: ' ,{text:this.client.boid,bold:true},
         ' has been maintaining an Account with our Brokerage House. His/ Her detail information are given bellow:'],fontSize:9
      },
    
      {
         text:'Transaction Period: '+
         formatDate(this.fromDate,'dd MMMM, yyyy','en_US') +' to '+ formatDate(this.toDate,'dd MMMM, yyyy','en_US')
         ,alignment:'center',margin:[0,3,0,0]
      },
      {
        layout: "noBorders",
        //fontSize: 8,
        margin: [10, 10, 0, 0],
        table: {
          widths: ["*", "*",'*'], 
          body: [
            [
              { text: "Father's/Husband's Name:" , alignment: 'left',fontSize:8},
              { text: this.client.faname, alignment: 'left',fontSize:8 },
              {},           
            ], 
            [
              { text: "Mother's Name:" , alignment: 'left',fontSize:8},
              { text: this.client.moname, alignment: 'left',fontSize:8 },
              {},           
            ], 
            [
              { text: "Address:" , alignment: 'left',fontSize:8},
              { text: this.client.address, alignment: 'left',fontSize:8,colSpan:2 },
              {},           
            ], 
          ]
        }
      },
      {
      //  layout: "noBorders",
        //fontSize: 8,
        margin: [10, 10, 0, 0],
        table: {
          widths: ["*", "*",'*','*'], 
          body: [
            [
              { text: "Opening Equity" , alignment: 'left',fontSize:8},
              { text: Number(this.tax.openingEquity.toFixed(2)).toLocaleString(), alignment: 'right',fontSize:8 },
              { text: "Closing Equity" , alignment: 'left',fontSize:8},
              { text: Number(this.tax.closingEquity.toFixed(2)).toLocaleString(), alignment: 'right',fontSize:8 }, 
            ], 
            [
              { text: "Deposit During This Period" , alignment: 'left',fontSize:8},
              { text: Number(this.tax.deposit.toFixed(2)).toLocaleString(), alignment: 'right',fontSize:8 },
              { text: "Withdrawal" , alignment: 'left',fontSize:8},
              { text: this.tax.withdraw.toFixed(2), alignment: 'right',fontSize:8 }, 
            ], 
            [
              { text: "Securities Deposit" , alignment: 'left',fontSize:8},
              { text: this.tax.sd.toFixed(2), alignment: 'right',fontSize:8 },
              { text: "Securities Withdrawal" , alignment: 'left',fontSize:8},
              { text: this.tax.sw.toFixed(2), alignment: 'right',fontSize:8 }, 
            ], 
            [
              { text: "Charge & Fees" , alignment: 'left',fontSize:8},
              { text: this.tax.charge.toFixed(2), alignment: 'right',fontSize:8 },
              { text: "Balance as on (Cr/Dr)" , alignment: 'left',fontSize:8},
              { text: Number(this.tax.balance.toFixed(2)).toLocaleString(), alignment: 'right',fontSize:8 }, 
            ], 
            [
              { text: "Cost Value of Securites" , alignment: 'left',fontSize:8},
              { text: Number(this.tax.cv.toFixed(2)).toLocaleString(), alignment: 'right',fontSize:8 },
              { text: "Market Value of Securites" , alignment: 'left',fontSize:8},
              { text: Number(this.tax.mvs.toFixed(2)).toLocaleString(), alignment: 'right',fontSize:8 }, 
            ],
            [
              { text: "Realised Capital Gain/Loss" , alignment: 'left',fontSize:8,colSpan:3},
              { },
              { },
              { text: this.tax.rg.toFixed(2), alignment: 'right',fontSize:8 }, 
            ],
          ]
        }
      },
      {
        text:'(All figures are in Bangladeshi Taka)',margin:[5,20,0,0],fontSize:9
      }


    ]
  }
}
}
