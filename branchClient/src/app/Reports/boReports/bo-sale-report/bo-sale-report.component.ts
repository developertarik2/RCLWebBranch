import { Component } from '@angular/core';
import { IBoSaleReport } from '../../models/boSaleReport';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { IloggedUser } from 'src/app/shared/models/loggedUser';
import { BoReportService } from '../bo-report.service';
import { ToastrService } from 'ngx-toastr';
import { AccountService } from 'src/app/account/account.service';
import { formatDate } from '@angular/common';

var pdfMake = require('pdfmake/build/pdfmake.js');
var pdfFonts = require('pdfmake/build/vfs_fonts.js');
(<any>pdfMake).vfs = pdfFonts.pdfMake.vfs;

@Component({
  selector: 'app-bo-sale-report',
  templateUrl: './bo-sale-report.component.html',
  styleUrls: ['./bo-sale-report.component.scss']
})
export class BoSaleReportComponent {
  sales: IBoSaleReport[];
  inputForm:FormGroup;
  currentUser$:Observable<IloggedUser>;

  branchCode:string
  branch:string

  totalBO:number
  totalAmount:number

  constructor(private cdblReportService: BoReportService,private toster:ToastrService,private accountService:AccountService) { }

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
    this.totalAmount=0
    this.totalBO=0
    this.cdblReportService.getBoSaleReport(this.inputForm.value).subscribe({
     next:(sales:IBoSaleReport[])=>{     
       this.sales=sales 
       this.sales.forEach(element => {
        this.totalBO += element.quantity
        this.totalAmount += element.amount
       });     
            
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
    if(this.sales.length ==0){
  
      return false
    }  
       console.log(this.totalAmount)
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

     let value:string
     let quan:string

     quan=this.totalBO.toString()
     value=this.totalAmount.toString()
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
           
                text:'BO Sale Report',
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
          table:{
            headerRows: 1,   
            style:'',
            fontSize:9.5,     
            widths: [ '50%', '20%', '20%'],
            body: [
              [
        
                {text:'Date',style:'tableHeader'}, 
                {text:'Quantity',style:'tableHeader',alignment:'center'}, 
                {text:'Amount',style:'tableHeader',alignment:'center'}, 
          
               
              ],
              ...this.sales.map(p => ([ 
           
               // {text: formatDate(p.date,'MMM dd, yyyy','en_US'),style:'valuesTable'}, 
                {text: p.date,style:'valuesTable'}, 
                {text: p.quantity,style:'valuesTable',alignment:'center'},
              
                {text: p.amount,style:'valuesTable',alignment:'center'},
             
               
              
              ])
                ),
                [
                     {
                      canvas: [ { type: 'line', x1: 0, y1: 0, x2: 535, y2: 0, lineWidth: .5 } ],
                      margin: [0, 2 ,0, 0],colSpan:3
                     },{},{}
                ],
                [
                  {text:'Total',style:'valuesTable'},
                  {text:quan,style:'valuesTable',alignment:'center'},
                  {text:value,style:'valuesTable',alignment:'center'}
                ]
           
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

}
