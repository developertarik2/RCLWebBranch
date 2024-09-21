import { Component } from '@angular/core';
import { ClientReportsService } from '../../client-reports.service';
import { ClientDetailsService } from 'src/app/shared/services/client-details.service';
import { Iledger } from 'src/app/Reports/models/ledger';
import { IClientDetails } from 'src/app/shared/models/clientDetails';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import {formatDate} from '@angular/common';


import 'jspdf-autotable';
import autoTable from 'jspdf-autotable';

//import pdfMake from "pdfmake/build/pdfmake";
//import pdfFonts from "pdfmake/build/vfs_fonts";
//declare let jsPDF: any;

//import * as pdfMake from 'pdfmake/build/pdfmake';
//import * as pdfFonts from 'pdfmake/build/vfs_fonts';
//(<any>pdfMake).vfs = pdfFonts.pdfMake.vfs;

var pdfMake = require('pdfmake/build/pdfmake.js');
var pdfFonts = require('pdfmake/build/vfs_fonts.js');
//pdfMake.vfs = pdfFonts.pdfMake.vfs;
(<any>pdfMake).vfs = pdfFonts.pdfMake.vfs;


@Component({
  selector: 'app-ledger-pdf',
  templateUrl: './ledger-pdf.component.html',
  styleUrls: ['./ledger-pdf.component.scss']
})
export class LedgerPdfComponent {
  client:IClientDetails
  ledgers: Iledger[];


  constructor(private clientReportService: ClientReportsService,private clientService: ClientDetailsService){}

  ngOnInit(): void {
    this.getClient()
    this.getLedgers()
   }

   getClient(){
    
      this.clientService.getClient("FM855").subscribe({
       next:(client:IClientDetails)=>{
       
         this.client=client       
       },
      // complete:()=>{},
       error:(err:any)=>{
         console.log(err)
         this.ledgers=[]
        
       }
      })   
   }

   
   getLedgers() {
    var obj= {
     fromDate:"2023-08-01",
     toDate:"2023-08-02",
     code:"FM855"
    }
    this.clientReportService.getClientLedger(obj).subscribe({
     next:(ledgers:Iledger[])=>{  
       this.ledgers=ledgers
        
     },
    // complete:()=>{},
     error:(err:any)=>{
       console.log(err)
       this.ledgers=[]
       
     }
    })
 
   }

   public openPDF(): void {
   /* let DATA: any = document.getElementById('htmlData');
    html2canvas(DATA).then((canvas) => {
      let fileWidth = 208;
      let fileHeight = (canvas.height * fileWidth) / canvas.width;
      const FILEURI = canvas.toDataURL('image/png');
      let PDF = new jsPDF('p', 'mm', 'a4');
      let position = 0;
      PDF.addImage(FILEURI, 'PNG', 0, position, fileWidth, fileHeight);
      PDF.save('angular-demo.pdf');
    }); */
  }

  generatePdf(data:any) {
    let doc = new jsPDF();
   autoTable(doc,{html: '#ta'});
   doc.save('test.pdf');


   /* var opt = {
      margin: 1, 
      filename: 'ontract.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: {scale:2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
      pagebreak: { mode: 'avoid-all', after: '.avoidThisRow' }       
  };


    html2canvas(data, { allowTaint: true }).then(canvas => {
     let HTML_Width = canvas.width;
     let HTML_Height = canvas.height;
     let top_left_margin = 15;
     let PDF_Width = HTML_Width + (top_left_margin * 2);
     let PDF_Height = (PDF_Width * 1.5) + (top_left_margin * 2);
     let canvas_image_width = HTML_Width;
     let canvas_image_height = HTML_Height;
     let totalPDFPages = Math.ceil(HTML_Height / PDF_Height) - 1;
     canvas.getContext('2d');
     let imgData = canvas.toDataURL("image/jpeg", 1.0);
     let pdf = new jsPDF('p', 'pt', [PDF_Width, PDF_Height]);
     pdf.addImage(imgData, 'JPG', top_left_margin, top_left_margin, canvas_image_width, canvas_image_height);
     for (let i = 1; i <= totalPDFPages; i++) {
       pdf.addPage([PDF_Width, PDF_Height], 'p');
       pdf.addImage(imgData, 'JPG', top_left_margin, -(PDF_Height * i) + (top_left_margin * 4), canvas_image_width, canvas_image_height);
     }
     //pdf.autoTable({ html: '#my-table' })
      pdf.save("HTML-Document.pdf");
   });

  // html2pdf().from(element).set(opt).toPdf().get('pdf').save()

   /*const data = document.getElementById('pdfPage_');
html2canvas(data).then((canvas:any) => {
  const imgWidth = 208;
  const pageHeight = 295;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;
  let heightLeft = imgHeight;
  let position = 0;
  heightLeft -= pageHeight;
  const doc = new jspdf('p', 'mm');
  doc.addImage(canvas, 'PNG', 0, position, imgWidth, imgHeight, '', 'FAST');
  while (heightLeft >= 0) {
    position = heightLeft - imgHeight;
    doc.addPage();
    doc.addImage(canvas, 'PNG', 0, position, imgWidth, imgHeight, '', 'FAST');
    heightLeft -= pageHeight;
  }
  doc.save('Downld.pdf');
}); */
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

 async makePDF(){
  /*let documentDefinition = { 
    pageMargins: [ 40, 30, 60, 40 ],
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
              style:''
            },
            {
              text:'DSE Annex Building,9/E',
              alignment:'right',
              margin:[0,0,20,0],
              fontSize:10,
              style:''
            },
            {
              text:'Motijheel C/A, Dhaka',
              alignment:'right',
              margin:[0,0,22,0],
              fontSize:10,
              style:''
            }
          ]
        ],
        
      },
      {canvas: [ { type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1 } ],
      margin: [0, 10 ,0, 10],
       style:''   
    },
      {
      text:'Transaction Period ' + ' ',
      alignment:'center',
      margin: [0, 10 ,0, 10],
      },
      {
        canvas: [ { type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1 } ],
        margin: [0, 0 ,0, 15],
      },
      {
           columns:[
            [
               {
                 text: 'Account Holder Name : '+this.client.aname,
                 fontSize:11
               },
               {
                text: 'Account No : '+this.client.acode,
                fontSize:11
               },
               {
                text: 'BOID : '+this.client.boid,fontSize:11
               },
            ],
            [
              {
                text: 'Fathers Name : '+this.client.faname,fontSize:11
              },
              {
               text: "Mother's Name : "+this.client.moname,fontSize:11
              },
              {
               text: 'Address : '+this.client.address,fontSize:10,
               width:300
              },
            ]
           ],
           margin:[0,10,0,10],
      },
      { 
        table:{
          headerRows: 1,
          style:'',
          fontSize:10,
         // margin:[10,10,0,0],
          heights: 18, 
          //padding:[0,10,0,0],
          widths: [ 'auto', 'auto', 'auto','auto', 'auto', 'auto','auto', 'auto', 'auto'],
          body: [
            [
              {text:'Date',style:'tableHeader'}, 
              {text:'Type',style:'tableHeader'}, 
              {text:'Instrument',style:'tableHeader'}, 
              {text:'Quantity',style:'tableHeader'}, 
              {text:'Rate',style:'tableHeader'}, 
              {text:'Debit',style:'tableHeader'}, 
              {text:'Credit',style:'tableHeader'}, 
              {text:'Comission',style:'tableHeader'}, 
              {text:'Balance',style:'tableHeader'}, 
            ],
            ...this.ledgers.map(p => ([ 
              {text: formatDate(p.tdate,'yyyy-MM-dd','en-US'),fontSize:11} , 
              {text: p.type,fontSize:11}, 
              {text: p.narr,fontSize:11},
              {text: p.quantity,fontSize:11},
              {text: p.rate.toFixed(2),fontSize:11},
              {text: p.debit,fontSize:11},
              {text: p.credit,fontSize:11},
              {text: p.commission.toFixed(2),fontSize:11},
              {text: p.totalBalance.toFixed(2),fontSize:11} ])
              ),
           // [{text: 'Total Amount', colSpan: 3}, {}, {}, this.invoice.products.reduce((sum, p)=> sum + (p.qty * p.price), 0).toFixed(2)]
          ]
        }

      }
  ],
  margin: [0, 0 ,0, 0],
styles:{
  tableHeader: {
    bold: true,
    fontSize: 11,
    color: 'white',
    fillColor: '#2d4154',
    alignment: 'left',

  },
  marginTop:{
   // margin-top:10px
  }
}
  };*/
  const documentDefinition=await this.getDocumentDefinition();
    pdfMake.createPdf(documentDefinition).open();      
 }


 async getDocumentDefinition(){
 // return {
   // content:[]
 // }
  return   { 
    pageMargins: [ 40, 30, 60, 40 ],
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
              style:''
            },
            {
              text:'DSE Annex Building,9/E',
              alignment:'right',
              margin:[0,0,20,0],
              fontSize:10,
              style:''
            },
            {
              text:'Motijheel C/A, Dhaka',
              alignment:'right',
              margin:[0,0,22,0],
              fontSize:10,
              style:''
            }
          ]
        ],
        
      },
      {canvas: [ { type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1 } ],
      margin: [0, 10 ,0, 10],
       style:''   
    },
      {
      text:'Transaction Period ' + ' ',
      alignment:'center',
      margin: [0, 10 ,0, 10],
      },
      {
        canvas: [ { type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1 } ],
        margin: [0, 0 ,0, 15],
      },
      {
           columns:[
            [
               {
                 text: 'Account Holder Name : '+this.client.aname,
                 fontSize:11
               },
               {
                text: 'Account No : '+this.client.acode,
                fontSize:11
               },
               {
                text: 'BOID : '+this.client.boid,fontSize:11
               },
            ],
            [
              {
                text: 'Fathers Name : '+this.client.faname,fontSize:11
              },
              {
               text: "Mother's Name : "+this.client.moname,fontSize:11
              },
              {
               text: 'Address : '+this.client.address,fontSize:10,
               width:300
              },
            ]
           ],
           margin:[0,10,0,10],
      },
      { 
        table:{
          headerRows: 1,
          style:'',
          fontSize:10,
         // margin:[10,10,0,0],
          heights: 18, 
          //padding:[0,10,0,0],
          widths: [ 'auto', 'auto', 'auto','auto', 'auto', 'auto','auto', 'auto', 'auto'],
          body: [
            [
              {text:'Date',style:'tableHeader'}, 
              {text:'Type',style:'tableHeader'}, 
              {text:'Instrument',style:'tableHeader'}, 
              {text:'Quantity',style:'tableHeader'}, 
              {text:'Rate',style:'tableHeader'}, 
              {text:'Debit',style:'tableHeader'}, 
              {text:'Credit',style:'tableHeader'}, 
              {text:'Comission',style:'tableHeader'}, 
              {text:'Balance',style:'tableHeader'}, 
            ],
            ...this.ledgers.map(p => ([ 
              {text: formatDate(p.tdate,'yyyy-MM-dd','en-US'),fontSize:11} , 
              {text: p.type,fontSize:11}, 
              {text: p.narr,fontSize:11},
              {text: p.quantity,fontSize:11},
              {text: p.rate.toFixed(2),fontSize:11},
              {text: Number(p.debit.toFixed(2)).toLocaleString(),fontSize:11},
              {text: Number(p.credit.toFixed(2)).toLocaleString(),fontSize:11},
              {text: p.commission.toFixed(2),fontSize:11},
              {text: Number(p.totalBalance.toFixed(2)).toLocaleString(),fontSize:11} ])
              ),
           // [{text: 'Total Amount', colSpan: 3}, {}, {}, this.invoice.products.reduce((sum, p)=> sum + (p.qty * p.price), 0).toFixed(2)]
          ]
        }

      }
  ],
  margin: [0, 0 ,0, 0],
styles:{
  tableHeader: {
    bold: true,
    fontSize: 11,
    color: 'white',
    fillColor: '#2d4154',
    alignment: 'left',

  },
  marginTop:{
   // margin-top:10px
  }
}
 }
}
}
