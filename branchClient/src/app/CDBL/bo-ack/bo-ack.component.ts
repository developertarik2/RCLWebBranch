import { Component } from '@angular/core';
import { IBoClient } from '../models/boClient';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { CdblService } from '../cdbl.service';
import { ToastrService } from 'ngx-toastr';

import 'jspdf-autotable';
import { formatDate } from '@angular/common';
import { IBoStatus } from '../models/clinetBoStatus';
import { IChargeReceiveClient } from 'src/app/Reports/models/chargeReceiveClient';

var pdfMake = require('pdfmake/build/pdfmake.js');
var pdfFonts = require('pdfmake/build/vfs_fonts.js');
//pdfMake.vfs = pdfFonts.pdfMake.vfs;
(<any>pdfMake).vfs = pdfFonts.pdfMake.vfs;

@Component({
  selector: 'app-bo-ack',
  templateUrl: './bo-ack.component.html',
  styleUrls: ['./bo-ack.component.scss']
})
export class BoAckComponent {
client:IBoClient
inputForm:FormGroup;

fiscal:string
boStatus:string

constructor(private cdblService: CdblService,private toster:ToastrService) { }

ngOnInit(): void{
    
  
  this.createForm()
}

createForm(){
  this.inputForm=new FormGroup({
    code:new FormControl('',[Validators.required]),
  
   
  })
}

getData() {
  
  var inputValue = (<HTMLInputElement>document.getElementById('Client RCODE')).value.trim();

  this.cdblService.getClientDetails(inputValue).subscribe({
   next:(client:IBoClient)=>{     
     this.client=client 
     console.log(client)
          
   },

   error:(err:any)=>{
     console.log(err)
     this.client=null
   }
  })
  

 }
 onSubmit(){
  this.getData()
  this.getBoStatus()
  this.getFiscal()
   
}

getBoStatus(){
  var inputValue = (<HTMLInputElement>document.getElementById('Client RCODE')).value.trim();

  this.cdblService.getBoStatus(inputValue).subscribe({
    next:(stat:IBoStatus)=>{     
      this.boStatus=stat.bostatus 
     //console.log(client)
           
    },
 
    error:(err:any)=>{
      console.log(err)
     // this.client=null
    }
   })
}

getFiscal(){
  var inputValue = (<HTMLInputElement>document.getElementById('Client RCODE')).value.trim();

  this.cdblService.getLastFiscal(inputValue).subscribe({
    next:(fis:IChargeReceiveClient)=>{     
      this.fiscal=fis.fiscal
     console.log(fis)
           
    },
 
    error:(err:any)=>{
      console.log(err)
     // this.client=null
    }
   })
}

async onPrint(){
 if(!this.client){
   this.toster.error("Invalid Code!!!")
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

 var ss= formatDate(Date.now(),'dd-MM-yyyy HH:mm ','en_US')
// console.log(ss)
  // return {
    // content:[]
  // }
   return   { 
     pageMargins: [ 30, 10, 30, 20 ],
     //header: 'simple text',
     footer: {
      margin:[30,0,30],
      columns: [
        //{ text: str,fontSize:9},
        { text: 'Print Date: '+ formatDate(str,'MMM dd, yyyy h:mm:ss a z','en_US'), alignment: 'right',fontSize:8},
      
      ]
    },
     background: [
      {
          //image: 'data:image/jpeg;base64,/9j/4QAY...',
          image: await this.getBase64ImageFromURL(
            "../../assets/images/royal.png"
          ),
          width: 680
      }
    ],
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
             {
              text:'Tel: 02-9556618 &9551068,Fax:02-9571735',
              alignment:'right',
              margin:[0,0,0,0],
              fontSize:10,
              style:''
            }
           ]
         ],
         
       },
      
     /*  {canvas: [ { type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1 } ],
       margin: [0, 10 ,0, 10],
        style:''   
     },
       {
       text:'Personal Details ' + ' ',
       alignment:'center',
       margin: [0, 10 ,0, 10],
       style:'headerSt'
       },*/
       {
        style: 'header',
        table: {
            widths:'*',
            body: [
                [{
                        border: [false, false, false, false],
                        fillColor: 'darkgrey',
                        text: 'PERSONAL DETAILS',
                        alignment:'center',
                        fontfamily: 'Courier New, serif',
                        bold:true
                    }]
            ]
        }
    },
 /*   {
      columns:[
        [
          {
            text:'BO ID',
            margin:[20,0,0,0],
            //style:'label'
            fontSize:10,
            color:'#555555'
          },
          {
            text:'BO Type',           
            style:'label'   
          },
          {
            text:'BO Category',           
            style:'label'   
          },
          {text:'Name of the First Holder',style:'label'},{text:'Company',style:'label'},{text:'Second Joint Holder',style:'label'},{text:'Third Joint Holder',style:'label'},{text:'Contact Person',style:'label'},
          {text:'Company',style:'label'},{text:'Second Joint Holder',style:'label'},{text:'Third Joint Holder',style:'label'},{text:'Contact Person',style:'label'},{text:'Sex',style:'label'},
          {text:'Date of Birth / Registration',style:'label'},{text:'Registration Number',style:'label'},{text:'Father / Husbands Name',style:'label'},{text:'Mothers Name',style:'label'},{text:'Occupation',style:'label'},
          {text:'Residency Flag',style:'label'},{text:'Citizen Of',style:'label'},{text:'Address',style:'label'},{text:'City',style:'label'},{text:'State/Division',style:'label'},
          {text:'Country',style:'label'},{text:'Postal Code',style:'label'},{text:'Mobile',style:'label'},{text:'Email',style:'label'},{text:'Fax',style:'label'},
          {text:'Statement Cycle Code',style:'label'},{text:'End of Month',style:'label'},{text:'First Holder National ID',style:'label'},{text:'Second Holder National ID',style:'label'},{text:'Third Holder National ID',style:'label'},
          
        ],
        [
          {
            text:this.client.boid,
            //margin:[20,0,0,0],        
            fontSize:10,
            color:'#555555'
          },
          {text:this.client.botype,style:'details'},{text:this.client.bocat,style:'details'},
          {text:this.client.fhName,style:'details'},{text:'',style:'details'},{text:this.client.shName,style:'details'},{text:this.client.thName,style:'details'}
        ],
        [

        ]
      ]
     },*/
     {
            table:{              
              widths: [ '*', '*', '*' ],
              fontSize:10,
              color:'#555555',
              margin:[60,20,0,0],
              body: [
                [ {  text: 'BO ID',style:'label' }, {text:this.client.boid,style:'details'}, {text:''} ],[{  text: 'BO Type',style:'label' }, {text:this.client.botype,style:'details'},{text:''}],
                [ {  text: 'BO Category',style:'label' }, {text:this.client.bocat,style:'details'}, {text:''} ],[{  text: 'Name of the First Holder/Company',style:'label' }, {text:this.client.fhName,style:'details'},{text:''}],
               // [ {  text: 'Company',style:'label' }, {text:''}, {text:''} ],
                [{  text: 'Second Joint Holder',style:'label' }, {text:this.client.shName,style:'details'},{text:''}],
                [ {  text: 'Third Joint Holder',style:'label' }, {text:this.client.thName?.trim()}, {text:''} ],
                [{  text: 'Contact Person',style:'label' }, {text:this.client.cpName?.trim()},{text:''}],
                [ {  text: 'Sex Code',style:'label' }, {text:this.client.sex,style:'details'}, {text:''} ],
                [{  text: 'Date of Birth / Registration',style:'label' }, {text:this.client.dob,style:'details'},{text:''}],

                [ {  text: 'Registration Number',style:'label' }, {text:this.client.regNum,style:'details'}, {text:''} ],[{  text: 'Father / Husbands Name',style:'label' }, {text:this.client.father,style:'details'},{text:''}],
                [ {  text: 'Mothers Name',style:'label' }, {text:this.client.mother,style:'details'}, {text:''} ],[{  text: 'Occupation',style:'label' }, {text:this.client.occupation,style:'details'},{text:''}],
                [ {  text: 'Residency Flag',style:'label' }, {text:''}, {text:''} ],[{  text: 'Citizen Of',style:'label' }, {text:this.client.country,style:'details'},{text:''}],
                [ {  text: 'Address',style:'label' }, {text:this.client.add1+' ' +this.client.add2+' '+ this.client.add3 ,colSpan: 2,style:'details'} ],[{  text: 'City',style:'label' }, {text:this.client.city,style:'details'},{text:''}],
                [ {  text: 'State/Division',style:'label' }, {text:this.client.state,style:'details'}, {text:''} ],[{  text: 'Country',style:'label' }, {text:this.client.country,style:'details'},{text:''}],

                [ {  text: 'Postal Code',style:'label' }, {text:this.client.pCode,style:'details'}, {text:''} ],[{  text: 'Mobile',style:'label' }, {text:this.client.mobile,style:'details'},{text:''}],
                [ {  text: 'Email',style:'label' }, {text:this.client.email,style:'details'}, {text:''} ],[{  text: 'Fax',style:'label' }, {text:this.client.fax,style:'details'},{text:''}],
                [ {  text: 'Statement Cycle Code',style:'label' }, {text:''}, {text:''} ],[{  text: 'End of Month',style:'label' }, {text:''},{text:''}],
                [ {  text: 'First Holder National ID',style:'label' }, {text:this.client.nID1,style:'details'}, {text:''} ],[{  text: 'Second Holder National ID',style:'label' }, {text:this.client.nID2,style:'details'},{text:''}],
                [ {  text: 'Third Holder National ID',style:'label' }, {text:this.client.nID3,style:'details'},{text:''}]
               // [{  text: 'Company',style:'label' }, {text:''},{text:''}]
            ]
            },
            layout: 'noBorders'
     },
     {
      style: 'header',
      table: {
          widths:'*',
          body: [
              [{
                      border: [false, false, false, false],
                      fillColor: 'darkgrey',
                      text: 'SHORT NAME',
                      alignment:'center',
                      fontfamily: 'Courier New, serif',
                      bold:true
                  }]
          ]
      }
  },
  {
    columns:[
      [
        {text:'First Holder',style:'label'},{text:'Second Holder',style:'label'},{text:'Third Holder',style:'label'}
      ],
      [
        {text:this.client.fhName,style:'details'},{text:this.client.shName,style:'details'},{text:this.client.thName,style:'details'}
      ],[]
    ]
  },
 /* {
    table:{              
      widths: [ '*', '*', '*' ],
      fontSize:10,
      color:'#555555',
      margin:[60,20,0,0],
      body: [
        [ {  text: 'First Holder',style:'label' }, {text:this.client.fhName,style:'details'}, {text:''} ],[{  text: 'Second Holder',style:'label' }, {text:this.client.shName,style:'details'},{text:''}],
        [ {  text: 'Third Holder',style:'label' }, {text:this.client.thName,style:'details'}, {text:''} ],
              
    ]
    },
    layout: 'noBorders'
},*/
{
  style: 'header',
  table: {
      widths:'*',
      body: [
          [{
                  border: [false, false, false, false],
                  fillColor: 'darkgrey',
                  text: 'PASSPORT DETAILS',
                  alignment:'center',
                  fontfamily: 'Courier New, serif',
                  bold:true
              }]
      ]
  }
},
{
  table:{              
    widths: [ '*', '*','*' ],
    fontSize:10,
    color:'#555555',
    heights: 0, 
    margin:[60,20,0,0],
    body: [
      [ {  text: 'Passport No',style:'label' }, {text:this.client.passNum,style:'details'} ],[{  text: 'Passport Issue Date',style:'label',height:2 }, {text:this.client.passIDate,style:'details'},{text:''}],
      [ {  text: 'Passport Expiry Date',style:'label' }, {text:this.client.passExDate,style:'details'} ],[{  text: 'Passport Issue Place',style:'label',height:2 }, {text:this.client.passIDate,style:'details'},{text:''}],
      [ {  text: 'RoutingNumber',style:'label' }, {text:this.client.routing,style:'details'} ],[{  text: 'Bank Name',style:'label',height:2 }, {text:this.client.bName,style:'details'},{text:''}],
      [ {  text: 'Branch Name',style:'label' }, {text:this.client.bBranch,style:'details'} ],[{  text: 'Bank A/C No',style:'label',height:2 }, {text:this.client.bAccNum,style:'details'},{text:''}],
      [ {  text: 'Bank Identifier Code (BIC)',style:'label',lineheight:2 }, {text:'',style:'details'} ],[{  text: 'International Bank A/C No. ()',style:'label',height:2 }, {text:this.client.nID2,style:'details'},{text:''}],
      [ {  text: 'SWIFT Code',style:'label' }, {text:'',style:'details'} ],[{  text: 'Electronic Dividend',style:'label',height:2 }, {text:'Yes',style:'details'},{text:''}],      
  ]
  },
  layout: 'noBorders'
},
{
  style: 'header',
  table: {
      widths:'*',
      body: [
          [{
                  border: [false, false, false, false],
                  fillColor: 'darkgrey',
                  text: 'TAX DETAILS',
                  alignment:'center',
                  fontfamily: 'Courier New, serif',
                  bold:true
              }]
      ]
  }
},
{
  columns:[
    [
      {text:'Tax Exemption',style:'label'},{text:'Tax Identification No',style:'label'}
    ],
    [
      {text:'\n',style:'label'},{text:this.client.tin,style:'details'}
    ]
  ]
},
{
  style: 'header',
  table: {
      widths:'*',
      body: [
          [{
                  border: [false, false, false, false],
                  fillColor: 'darkgrey',
                  text: 'EXCHANGE DETAILS',
                  alignment:'center',
                  fontfamily: 'Courier New, serif',
                  bold:true
              }]
      ]
  }
},
{
  columns:[
    [
      {text:'Exchange Name',style:'label'},{text:'Trading ID',style:'label'}
    ],
    [
      {text:'\n',style:'label',height:5},{text:this.client.rcode,style:'details'}
    ],[]
  ]
},
    
      
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
