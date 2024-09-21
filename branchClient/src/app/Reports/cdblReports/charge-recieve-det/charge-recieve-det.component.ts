import { Component } from '@angular/core';
import { IChargeReceiveDet } from '../../models/chargeReceiveDet';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { IloggedUser } from 'src/app/shared/models/loggedUser';
import { CdblReportsService } from '../cdbl-reports.service';
import { ToastrService } from 'ngx-toastr';
import { AccountService } from 'src/app/account/account.service';
import { formatDate } from '@angular/common';
import { ICdblChargeReceive } from 'src/app/CDBL/models/cdblChargeRecieve';

var pdfMake = require('pdfmake/build/pdfmake.js');
var pdfFonts = require('pdfmake/build/vfs_fonts.js');
(<any>pdfMake).vfs = pdfFonts.pdfMake.vfs;

@Component({
  selector: 'app-charge-recieve-det',
  templateUrl: './charge-recieve-det.component.html',
  styleUrls: ['./charge-recieve-det.component.scss']
})
export class ChargeRecieveDetComponent {
  charges: IChargeReceiveDet;
  inputForm:FormGroup;
  currentUser$:Observable<IloggedUser>;

  branchCode:string
  branch:string

  cdblChargeRec:ICdblChargeReceive

  constructor(private cdblReportService: CdblReportsService,private toster:ToastrService,private accountService:AccountService) { }


  ngOnInit(): void{
    
    this.currentUser$=this.accountService.currentUser$;

    this.currentUser$.subscribe({
      next:(user:IloggedUser)=>{
        this.branch=user.branchName
        this.branchCode=user.branchCode
      }
    })
    this.createForm()
  }

  createForm(){
    this.inputForm=new FormGroup({
      fromDate:new FormControl('',[Validators.required]),
    //  branchCode:new FormControl(''),
      branchName:new FormControl(this.branch),
      toDate:new FormControl('',[Validators.required]),
    })
  }

  getData() {
    this.cdblReportService.getChargeReceiveDet(this.inputForm.value).subscribe({
     next:(charges:IChargeReceiveDet)=>{     
       this.charges=charges 
       //console.log(this.charges)  
            
     },
    // complete:()=>{},
     error:(err:any)=>{
       console.log(err)
       //this.charges=[]   
     }
    })
    

   }

   onSubmit(){

    if(Date.parse( this.inputForm.get('fromDate').value) > Date.parse( this.inputForm.get('toDate').value)){
      this.toster.error("From date can't be greater than To Date") 
      return false
    }
   
    this.getData()  

  }

  async onPrint(){
    if(this.charges?.chargeReceives?.length ==0){
  
      return false
    }  
       //console.log(this.totalAmount)
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
   // console.log(this.totalAmount)

   // this.sales.forEach(element => {
  //    this.totalBO += element.quantity
   //   this.totalAmount += element.amount
  //   });    

   //  let value:string
   //  let quan:string

   //  quan=this.totalBO.toString()
  //   value=this.totalAmount.toString()
    return {
      pageMargins: [ 20, 30, 20, 40 ],

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
        //  text:'Transaction date ('+ this.inputForm.get('fromDate').value+' to ' +this.inputForm.get('toDate').value +')',alignment:'center'
            text:   formatDate(this.inputForm.get('fromDate').value,'MMM dd, yyyy','en_US') +' to '+ 
            formatDate(this.inputForm.get('toDate').value,'MMM dd, yyyy','en_US'),alignment:'center'
           
        },
        {
          canvas: [ { type: 'line', x1: 0, y1: 0, x2: 535, y2: 0, lineWidth: .5 } ],
          margin: [0, 10 ,0, 10],
          
        },
        {
           text:'Branch: '+this.branch,fontSize:9
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
            widths: [ '10%', '14%', '8%','*', '10%','10%','10%','8%'],
            body: [
              [
               // {border: [false, false, false, false],},
                {text:'Date',style:'tableHeader'}, 
                {text:'MR_NO',style:'tableHeader'}, 
                {text:'RCODE',style:'tableHeader',alignment:'left'}, 
                {text:'Name',style:'tableHeader',alignment:'left'}, 
                {text: this.charges.yname1,style:'tableHeader',alignment:'right'},
                {text: this.charges.yname2,style:'tableHeader'}, 
                {text: this.charges.yname2,style:'tableHeader',alignment:'center'}, 
                {text:'Amount',style:'tableHeader',alignment:'center'}, 
               // {text: this.charges.yname1,style:'tableHeader',alignment:'right'}, 
               
              ],
              ...this.charges?.chargeReceives?.map(p => ([ 
                //{text: p.date,style:'valuesTable'} , 
                {text: formatDate(p.date,'MMM dd, yyyy','en_US'),style:'valuesTable'}, 
                {text: p.mR_NO,style:'valuesTable',alignment:'left'},              
                {text: p.rcode,style:'valuesTable',alignment:'left'},
                {text: p.name,style:'valuesTable',alignment:'left',fontSize:8},
                {text: p.y2,style:'valuesTable',alignment:'center'},
                {text: p.y3,style:'valuesTable',alignment:'center'},
                {text: p.y4,style:'valuesTable',alignment:'center'},
                {text: p.amount,style:'valuesTable',alignment:'right'},
               
               
              
              ])
                ),
                [
                     {
                      canvas: [ { type: 'line', x1: 0, y1: 0, x2: 555, y2: 0, lineWidth: .5 } ],
                      margin: [0, 2 ,0, 0],colSpan:8
                     },{},{},{},{},{},{},{}
                ],
                [
                  {colSpan:4,text:'Total',style:'valuesTable'},{},{},{},
                  {text:this.charges.year1,style:'valuesTable',alignment:'center'},
                  {text:this.charges.year2,style:'valuesTable',alignment:'center'},
                  {text:this.charges.year3,style:'valuesTable',alignment:'center'},
                  {text:this.charges.totalAmount,style:'valuesTable',alignment:'right'},
                ]
           
            ]
          }
    
        },
        {
          canvas: [ { type: 'line', x1: 0, y1: 0, x2: 555, y2: 0, lineWidth: .5 } ],
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
    
  }

  async onDetails(values:any){
    console.log(values)
  
    if(values){
      this.getRecDet(values)
        //console.log( this.boRec)
      //  const documentDefinition=await this.getDocumentDefinition2();
      //  pdfMake.createPdf(documentDefinition).open();   
    }
  }

  async getRecDet(values:any){
    this.cdblReportService.getCDBLReportByMr(values).subscribe({
      next:async (rec:ICdblChargeReceive)=>{     
        this.cdblChargeRec=rec 
       // console.log(this.boRec)
        const documentDefinition=await this.getDocumentDefinition2();
        pdfMake.createPdf(documentDefinition).open();   
      },
  
      error:(err:any)=>{
      // this.boRec=null
     
      }
     })
    // this.boRec.amount=150
   //  this.boRec.mR_NO='sdv'

  }
  
 
  
    async getDocumentDefinition2(){
      const str = new Date().toLocaleString('en-US', { timeZone: 'Asia/Dhaka' });
    
     var ss= formatDate(Date.now(),'dd-MM-yyyy HH:mm ','en_US')
    // console.log(ss)
      // return {
        // content:[]
      // }
       return   { 
         pageMargins: [ 30, 30, 30, 20 ],
         //header: 'simple text',
         footer: {
          margin:[30,0,30],
          columns: [
            //{ text: str,fontSize:9},
            [
              {text:'Printed By(Branch~'+ this.branch +')',fontSize:8}
            ],
            [
              { text: 'Print Date: '+ formatDate(str,'MMM dd, yyyy h:mm:ss a z','en_US'), alignment: 'right',fontSize:8 }
            ]
           
          
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
           {canvas: [ { type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1 } ],
           margin: [0, 10 ,0, 10],
            style:''   
           },
           {
            text:'CDBL Charge Money Receipt',alignment:'center'
           },
           {canvas: [ { type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1 } ],
           margin: [0, 10 ,0, 10],
            style:''   
           },
           {
            margin:[0,20,0,0],
            columns:[
              [
                {
                  text:'MR #: '+this.cdblChargeRec.mR_NO,margin:[20,0,0,0]
                }
              ],
              [
                {
                  text:'Branch: '+this.cdblChargeRec.branchName,alignment:'center',margin:[20,0,0,0]
                },
                {
                  text:'Date: '+ formatDate(this.cdblChargeRec.date,'mediumDate','en_US') ,alignment:'center',margin:[20,0,0,0]
                }
              ]
            ]
           },
           {
            canvas: [ { type: 'line', x1: 0, y1: 0, x2: 450, y2: 0, lineWidth: 1 } ],margin: [20, 10 ,20, 10],style:''   
           },
           { 
            margin:[0,2,0,0],
            layout: 'noBorders',
      
             table:{
              headerRows: 1,
        
              style:'',
              fontSize:9.5,
          
              widths: [ '50%','40%','*'],
              body: [
                [
                  {text:'Client Code',fontSize:10,margin:[50,10,0,0]},
                  {text:this.cdblChargeRec.rcode,alignment:'right',fontSize:11,bold:true,margin:[0,10,0,0]},{}            
                ],
                [
                 {text:'Received with thanks from',fontSize:10,margin:[50,10,0,0]},
                 {text:this.cdblChargeRec.name,alignment:'right',fontSize:11,bold:true,margin:[0,10,0,0]},{}            
                ],
                [
                  {text:'For CDBL anual charges for the year',fontSize:10,margin:[50,10,0,0]},
                  {text:this.cdblChargeRec.fis,alignment:'right',fontSize:11,bold:true ,margin:[0,10,0,0]},{}            
                ],
                [
                  {text:'Taka(in Cash)',fontSize:10,margin:[50,10,0,0]},
                  {text:this.cdblChargeRec.tamnt + '/-',alignment:'right',fontSize:11,bold:true,margin:[0,10,0,0]},{}            
                ],
                
                 
              ]
            }
      
          },
          {
            text:'* This is a computer generate money receipt, does not require any signature',fontSize:9,margin:[0,80,0,0]
          }
        /*   {canvas: [ { type: 'line', x1: 0, y1: 0, x2: 450, y2: 0, lineWidth: 1 } ],
           margin: [20, 10 ,20, 10],
            style:''   
           },
           {
            margin:[0,20,0,0],
            columns:[
              
              [
                {text:'Received with thanks from ',alignment:'left',fontSize:10,margin:[50,0,0,0]}
              ],
              [
                {text: this.boRec.name,alignment:'left',bold:true,margin:[30,0,0,0]}
              ]
            ]
    
           
           },
           {
            margin:[0,20,0,0],
            columns:[
              
              [
                {text:'Total Quantity of  BO A/C opening form ',alignment:'left',fontSize:10,margin:[50,0,0,0]}
              ],
              [
                {text: this.boRec.qty,alignment:'left',bold:true,margin:[30,0,0,0]}
              ]
            ]
    
           
           },
           {
            margin:[0,20,0,0],
            columns:[
              
              [
                {text:'Taka in Cash ',alignment:'left',fontSize:10,margin:[50,0,0,0]}
              ],
              [
                {text: this.boRec.amount+'/-',alignment:'left',bold:true,margin:[30,0,0,0]}
              ]
            ]
    
           
           },
           {
            text:'* This is a computer generate money receipt, does not require any signature',fontSize:9,margin:[0,80,0,0]
           } */
         
          ]
        }
      }
}
