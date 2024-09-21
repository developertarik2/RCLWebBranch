import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { CdblService } from '../cdbl.service';
import { ToastrService } from 'ngx-toastr';
import { ICdblChargeYear } from '../models/chargeYearList';
import { IBoStatus } from '../models/clinetBoStatus';
import { IChargeReceiveClient } from 'src/app/Reports/models/chargeReceiveClient';
import { ICdblChargeReceive } from '../models/cdblChargeRecieve';
import { formatDate } from '@angular/common';
import { AccountService } from 'src/app/account/account.service';
import { IloggedUser } from 'src/app/shared/models/loggedUser';
import { Observable } from 'rxjs';


var pdfMake = require('pdfmake/build/pdfmake.js');
var pdfFonts = require('pdfmake/build/vfs_fonts.js');
(<any>pdfMake).vfs = pdfFonts.pdfMake.vfs;


@Component({
  selector: 'app-cdbl-charge-receive',
  templateUrl: './cdbl-charge-receive.component.html',
  styleUrls: ['./cdbl-charge-receive.component.scss']
})
export class CdblChargeReceiveComponent {
  charge:number
  inputForm:FormGroup;

  cdblYear:ICdblChargeYear
  boStatus:IBoStatus

  history:IChargeReceiveClient[]

  cdblCharge:ICdblChargeReceive
  branch:string

  //boRec:IBoReceipt

  totalAmount:number
  currentUser$:Observable<IloggedUser>;

  constructor(private cdblService: CdblService,private toster:ToastrService,private accountService:AccountService) { }

  ngOnInit(): void{

    this.currentUser$=this.accountService.currentUser$;

    this.currentUser$.subscribe({
      next:(user:IloggedUser)=>{
        this.branch=user.branchName
        
      }
    })

  /*  this.cdblService.getCdblChargeTest().subscribe({
      next:(cdblCharge:ICdblChargeReceive)=>{
        this.cdblCharge=cdblCharge
      },
      error:()=>{}
    }) */

    this.cdblService.getCdblYear().subscribe({
      next:(yearList:ICdblChargeYear)=>{     
        this.cdblYear=yearList 
        console.log(this.cdblYear)
             
       // this.inputForm.controls['amount'].setValue(this.boPrice);
       this.inputForm.controls['fromYear'].setValue(this.cdblYear.thisYears[0].value, {onlySelf: true});
       this.inputForm.controls['toYear'].setValue(this.cdblYear.nextYears[0].value, {onlySelf: true});
      },
    
      error:(err:any)=>{
        console.log(err)
       // this.boPrice=null
      }
     })
      this.createForm()
      this.cdblService.getCdblCharge().subscribe({
        next:(charge:number)=>{     
          this.charge=charge 
          //console.log(charge)
             this.totalAmount=this.charge  
             this.inputForm.controls['amount'].setValue(this.charge);
        },
     
        error:(err:any)=>{
          console.log(err)
          this.charge=null
        }
       })

     
      //console.log(this.charge)
  }



  onSubmit(){
  //console.log(this.inputForm.value)

    this.cdblService.collectCdblCharge(this.inputForm.value).subscribe({
      next:(charge:ICdblChargeReceive)=>{     
        this.cdblCharge=charge 
       // console.log(this.boPrice)
      // this.totalAmount=this.charge  
          
      },
   
      error:(err:any)=>{
        console.log(err)
        this.cdblCharge=null
      }
     })
  }

  createForm(){
    //console.log('ss'+ this.boPrice)
    
      this.inputForm=new FormGroup({
        code:new FormControl('',[Validators.required]),
        name:new FormControl('',[Validators.required]),
        fromYear:new FormControl('',[Validators.required]),
        toYear:new FormControl('',[Validators.required]),
       // quantity:new FormControl(1,[Validators.required,Validators.pattern("^[0-9]*$"), Validators.min(1)]),
        amount:new FormControl(this.charge),
       
      })
    }

    getCdblCharge(){
      this.cdblService.getCdblCharge().subscribe({
        next:(charge:number)=>{     
          this.charge=charge 
         // console.log(this.boPrice)
             this.totalAmount=this.charge  
            
        },
     
        error:(err:any)=>{
          console.log(err)
          this.charge=null
        }
       })
    }

  inputHandle(event:any) {
    var number = event.target.value;
    //console.log(number)
    if (number >= 0) {
      //this.submitOtp();
      //this.totalAmount = number*this.boPrice
    }
  }

  toYearChange(event:any) {
    var from=this.inputForm.get('fromYear').value
    var to = event.target.value;
    console.log(to)
    //if (number >= 0) {
      //this.submitOtp();
      this.totalAmount = (to-from)*this.charge
      console.log(this.totalAmount)
    //}
  }

  modelChanged(event:any){
    this.cdblCharge=null
    var name = event.target.value;
    if(name.length>0){
      this.cdblService.getBoStatus(name).subscribe({
        next:(bo:IBoStatus)=>{     
          this.boStatus=bo 
         // console.log(this.boPrice)
             this.totalAmount=this.charge  
             this.inputForm.controls['name'].setValue(this.boStatus.fhName);

             this.cdblService.getPreviousPayments(name).subscribe({
              next:(hs:IChargeReceiveClient[])=>{     
                this.history=hs 
                 
                   
              },
           
              error:(err:any)=>{
                console.log(err)
                this.history=null
               // this.inputForm.controls['name'].setValue('');
              }
             })

        },
     
        error:(err:any)=>{
          console.log(err)
          this.boStatus=null
          this.history=null
          this.inputForm.controls['name'].setValue('');
        }
       })
    }
   
  }

  async onPrint(){
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
                text:'MR #: '+this.cdblCharge.mR_NO,margin:[20,0,0,0]
              }
            ],
            [
              {
                text:'Branch: '+this.cdblCharge.branchName,alignment:'center',margin:[20,0,0,0]
              },
              {
                text:'Date: '+formatDate(this.cdblCharge.date,'mediumDate','en_US'),alignment:'center',margin:[20,0,0,0]
              }
            ]
          ]
         },
         {canvas: [ { type: 'line', x1: 0, y1: 0, x2: 450, y2: 0, lineWidth: 1 } ],
         margin: [20, 10 ,20, 10],
          style:''   
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
                {text:this.cdblCharge.rcode,alignment:'right',fontSize:11,bold:true,margin:[0,10,0,0]},{}            
              ],
              [
               {text:'Received with thanks from',fontSize:10,margin:[50,10,0,0]},
               {text:this.cdblCharge.name,alignment:'right',fontSize:11,bold:true,margin:[0,10,0,0]},{}            
              ],
              [
                {text:'For CDBL anual charges for the year',fontSize:10,margin:[50,10,0,0]},
                {text:this.cdblCharge.fis,alignment:'right',fontSize:11,bold:true ,margin:[0,10,0,0]},{}            
              ],
              [
                {text:'Taka(in Cash)',fontSize:10,margin:[50,10,0,0]},
                {text:this.cdblCharge.tamnt + '/-',alignment:'right',fontSize:11,bold:true,margin:[0,10,0,0]},{}            
              ],
              
               
            ]
          }
    
        },
        {
          text:'* This is a computer generate money receipt, does not require any signature',fontSize:9,margin:[0,80,0,0]
        }
      /*   {
          margin:[0,20,0,0],
          columns:[
            
            [
              {text:'Client Code ',alignment:'left',fontSize:10,margin:[50,0,0,0]}
            ],
            [
              {text: this.cdblCharge.rcode,alignment:'left',bold:true,margin:[30,0,0,0]}
            ]
          ]
  
         
         },
         {
          margin:[0,20,0,0],
          columns:[
            
            [
              {text:'Received with thanks from ',alignment:'left',fontSize:10,margin:[50,0,0,0]}
            ],
            [
              {text: this.cdblCharge.name,alignment:'left',bold:true,margin:[30,0,0,0]}
            ]
          ]
  
         
         },
         {
          margin:[0,20,0,0],
          columns:[
            
            [
              {text:'For CDBL anual charges for the year ',alignment:'left',fontSize:10,margin:[50,0,0,0]}
            ],
            [
              {text: this.cdblCharge.fis,alignment:'left',bold:true,margin:[30,0,0,0]}
            ]
          ]
  
         
         },
         {
          margin:[0,20,0,0],
          columns:[
            
            [
              {text:'Taka(in Cash) ',alignment:'left',fontSize:10,margin:[50,0,0,0]}
            ],
            [
              {text: this.cdblCharge.tamnt+'/-',alignment:'left',bold:true,margin:[30,0,0,0]}
            ]
          ]
  
         
         },
         {
          text:'* This is a computer generate money receipt, does not require any signature',fontSize:9,margin:[0,80,0,0]
         }*/
        
        ]
      }
    }
}
