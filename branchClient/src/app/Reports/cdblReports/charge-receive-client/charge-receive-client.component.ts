import { Component } from '@angular/core';
import { IChargeReceiveClient } from '../../models/chargeReceiveClient';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { CdblReportsService } from '../cdbl-reports.service';
import { ToastrService } from 'ngx-toastr';
import { formatDate } from '@angular/common';
import { IClientDetails } from 'src/app/shared/models/clientDetails';
import { ClientDetailsService } from 'src/app/shared/services/client-details.service';

var pdfMake = require('pdfmake/build/pdfmake.js');
var pdfFonts = require('pdfmake/build/vfs_fonts.js');
(<any>pdfMake).vfs = pdfFonts.pdfMake.vfs;

@Component({
  selector: 'app-charge-receive-client',
  templateUrl: './charge-receive-client.component.html',
  styleUrls: ['./charge-receive-client.component.scss']
})
export class ChargeReceiveClientComponent {
  charges: IChargeReceiveClient[];
  inputForm:FormGroup;

  client:IClientDetails

  constructor(private cdblReportService: CdblReportsService,private toster:ToastrService,private clientService:ClientDetailsService) { }

  ngOnInit(): void{
    
    
    this.createForm()
  }

  createForm(){
    this.inputForm=new FormGroup({
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
  getData() {
    var inputValue = (<HTMLInputElement>document.getElementById('RCODE')).value;

    console.log(inputValue)

    this.cdblReportService.getChargeReceiveClient(inputValue).subscribe({
     next:(charges:IChargeReceiveClient[])=>{     
       this.charges=charges 
       this.getClient();
            
     },
    // complete:()=>{},
     error:(err:any)=>{
       console.log(err)
       //this.charges=[]   
     }
    })
    

   }

   onSubmit(){
    this.getData()
  }

  async onPrint(){
    if(this.charges.length ==0){
  
      return false
    }        
       const documentDefinition=await this.getDocumentDefinition();
       pdfMake.createPdf(documentDefinition).open();   
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
           
                text:'CDBL Charge Receive(Details)',
                alignment:'center',
                margin: [0, 0 ,0, 0],          
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
          table:{
            headerRows: 1,   
            style:'',
            fontSize:9.5,     
            widths: [ '25%', '25%', '20%','25%'],
            body: [
              [
        
                {text:'Date',style:'tableHeader'}, 
                {text:'MR_NO',style:'tableHeader',alignment:'left'}, 
                {text:'Year',style:'tableHeader',alignment:'center'}, 
                {text:'Amount',style:'tableHeader',alignment:'center'}, 
               
              ],
              ...this.charges.map(p => ([ 
           
               // {text: formatDate(p.date,'MMM dd, yyyy','en_US'),style:'valuesTable'}, 
                {text: p.date,style:'valuesTable'}, 
                {text: p.mR_NO,style:'valuesTable',alignment:'left'},
                {text: p.fiscal,style:'valuesTable',alignment:'left'},
                {text: p.amount,style:'valuesTable',alignment:'center'},
             
               
              
              ])
                ),
           
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
}
