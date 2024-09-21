import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { CdblService } from '../cdbl.service';
import { ToastrService } from 'ngx-toastr';
import { IBoReceipt } from '../models/boReceipt';
import { formatDate } from '@angular/common';
import { AccountService } from 'src/app/account/account.service';
import { Observable } from 'rxjs';
import { IloggedUser } from 'src/app/shared/models/loggedUser';

var pdfMake = require('pdfmake/build/pdfmake.js');
var pdfFonts = require('pdfmake/build/vfs_fonts.js');
(<any>pdfMake).vfs = pdfFonts.pdfMake.vfs;

@Component({
  selector: 'app-bo-receive',
  templateUrl: './bo-receive.component.html',
  styleUrls: ['./bo-receive.component.scss']
})
export class BoReceiveComponent {
  boPrice:number
  inputForm:FormGroup;

  boRec:IBoReceipt

  totalAmount:number=100
  currentUser$:Observable<IloggedUser>;
  branch:string

  constructor(private cdblService: CdblService,private toster:ToastrService,private accountService:AccountService) { }

ngOnInit(): void{

  this.currentUser$=this.accountService.currentUser$;

  this.currentUser$.subscribe({
    next:(user:IloggedUser)=>{
      this.branch=user.branchName
     
    }
  })
  
/*  this.cdblService.getBoChargeTest().subscribe({
    next:(rec:IBoReceipt)=>{     
      this.boRec=rec 
      console.log(this.boRec)
           
    },
 
    error:(err:any)=>{
      console.log(err)
      this.boRec=null
    }
   }) */
   
 // this.getBoCharge()
 this.cdblService.getBoCharge().subscribe({
  next:(charge:number)=>{     
    this.boPrice=charge 
    console.log(this.boPrice)
         
    this.inputForm.controls['amount'].setValue(this.boPrice);
  },

  error:(err:any)=>{
    console.log(err)
    this.boPrice=null
  }
 })
  this.createForm()
 
}

createForm(){
//console.log('ss'+ this.boPrice)

  this.inputForm=new FormGroup({
    clientName:new FormControl('',[Validators.required]),
    quantity:new FormControl(1,[Validators.required,Validators.pattern("^[0-9]*$"), Validators.min(1)]),
    amount:new FormControl(this.boPrice),
   
  })
}

getBoCharge(){
  this.cdblService.getBoCharge().subscribe({
    next:(charge:number)=>{     
      this.boPrice=charge 
     // console.log(this.boPrice)
           
    },
 
    error:(err:any)=>{
      console.log(err)
      this.boPrice=null
    }
   })
}
onSubmit(){
  console.log(this.inputForm.value)
  this.cdblService.boSale(this.inputForm.value).subscribe({
    next:(rec:IBoReceipt)=>{     
      this.boRec=rec 
      console.log(this.boRec)
           
    },
 
    error:(err:any)=>{
      console.log(err)
      this.boRec=null
    }
   }) 

  /* this.cdblService.getBoChargeTest().subscribe({
    next:(rec:IBoReceipt)=>{     
      this.boRec=rec 
      console.log(this.boRec)
           
    },
 
    error:(err:any)=>{
      console.log(err)
      this.boRec=null
    }
   }) */
}
inputHandle(event:any) {
  var number = event.target.value;
  //console.log(number)
  if (number >= 0) {
    //this.submitOtp();
    this.totalAmount = number*this.boPrice
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
async onPrint(){
  const documentDefinition=await this.getDocumentDefinition();
  pdfMake.createPdf(documentDefinition).open();    
}

async getDocumentDefinition(){
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
          {text:'Printed By(Branch~'+ this.branch +')',fontSize:9}
        ],
        [
        //  { text: 'Print Date: '+ str.toString(), alignment: 'right',fontSize:9 }
          { text: 'Print Date: '+ formatDate(str,'MMM dd, yyyy h:mm:ss a z','en_US'), alignment: 'right',fontSize:8},
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
        text:'BO Book Charge Money Receipt',alignment:'center'
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
              text:'MR #: '+this.boRec.mR_NO,margin:[20,0,0,0]
            }
          ],
          [
            {
              text:'Branch: '+this.boRec.branchName,alignment:'center',margin:[20,0,0,0]
            },
            {
              text:'Date: '+this.boRec.date,alignment:'center',margin:[20,0,0,0]
            }
          ]
        ]
       },
       {canvas: [ { type: 'line', x1: 0, y1: 0, x2: 450, y2: 0, lineWidth: 1 } ],
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
       }
      /* {
        text:'Total Quantity '+ this.boRec.qty+' of BO A/C opening form',alignment:'center',bold:true,margin:[0,10,0,0],
       },
       {
        text:'Taka '+ this.boRec.amount+' in Cash',alignment:'center',bold:true,margin:[0,10,0,0],
       },

       {
        text:'* This is a computer generate money receipt, do not required any signature',fontSize:9,margin:[0,80,0,0]
       }*/
      ]
    }
  }
}
