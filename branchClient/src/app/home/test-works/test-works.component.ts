import { formatDate } from '@angular/common';
import { Component, OnInit } from '@angular/core';

var pdfMake = require('pdfmake/build/pdfmake.js');
var pdfFonts = require('pdfmake/build/vfs_fonts.js');
(<any>pdfMake).vfs = pdfFonts.pdfMake.vfs;

var htmlToPdfmake = require("html-to-pdfmake");

@Component({
  selector: 'app-test-works',
  templateUrl: './test-works.component.html',
  styleUrls: ['./test-works.component.scss']
})
export class TestWorksComponent implements OnInit{
  
  check:true
  ll:string
  ngOnInit(): void {
  //  throw new Error('Method not implemented.');
 // console.log(this.getBase64Image(document.getElementById("log")))
 // this.ll='data:image/png;base64,'+ this.getBase64Image(document.getElementById("log"))
 // console.log(this.ll)

  this.getBase64FromUrl2('../../assets/images/rcl-logo.png').then((n:any)=>
    this.ll=n
   // console.log
  )
  console.log(this.ll)
  }
  
async  downloadAsPDF(){
//  this.ll='data:image/png;base64,'+ this.getBase64Image(document.getElementById("log"))
    var val=document.getElementById('pdfTable').innerHTML
    var html = htmlToPdfmake(val);

    var html2 = htmlToPdfmake(`
   
    <p>{{ll}} </p>
    `);
    const str = new Date().toLocaleString('en-US', { timeZone: 'Asia/Dhaka' });

   //  this.ll=  this.getBase64ImageFromURL('../../assets/images/rcl-logo.png')
   
   //  console.log(this.ll)

    const documentDefinition = 
    { 
      footer: {
        margin:[30,0,30],
        columns: [
          //{ text: str,fontSize:9},
          [
            {text:'Printed By(Branch~'+ 'this.branch' +')',fontSize:9}
          ],
          [
            { text: 'Print Date: '+ formatDate(str,'MMM dd, yyyy h:mm:ss a z','en_US'), alignment: 'right',fontSize:8 }
          ]
          
        
        ]
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
        {

        },
      
      ],
      styles:{
       
      },
    
      imagesByReference:true,
      pageBreakBefore: function(currentNode:any) {
        return currentNode.style && currentNode.style.indexOf('pdf-pagebreak-before') > -1;
      }
     };

    
   //  documentDefinition.content.push(html)

   // pdfMake.createPdf(documentDefinition).open(); 

    const documentDefinition2=await this.getDocumentDefinition();
    pdfMake.createPdf(documentDefinition2).open();    
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

  

  counter(i: number) {
    return new Array(i);
}


 getBase64FromUrl2 = async (url:any) => {
  const data = await fetch(url);
  const blob = await data.blob();
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(blob); 
    reader.onloadend = () => {
      const base64data = reader.result;   
      resolve(base64data);
    }
  });
}

async getDocumentDefinition(){
  const str = new Date().toLocaleString('en-US', { timeZone: 'Asia/Dhaka' });

  return {
    pageMargins: [ 15, 10, 10, 20 ],
    pageSize: {
      width:595.276,
      height:300
    },
    //header: 'simple text',
    footer: {
     margin:[30,0,30],
     columns: [
       //{ text: str,fontSize:9},
       [
      //   {text:'Printed By(Branch~'+ this.branch +')',fontSize:9}
       ],
       [
         { text: 'Print Date: '+ formatDate(str,'MMM dd, yyyy h:mm:ss a z','en_US'), alignment: 'right',fontSize:8 }
       ]
       
     
     ]
   },
   content:[
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
      /*    {
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
          } */
        ]
      ],
    },
    {
      layout: 'noBorders',
      margin:[0,2,0,2],
      table:
      {
        widths: [ '10%','14%','46%','5%','25%'],

        body:
        [
          [
            {text:'Easter Bank Limited',fontSize:8},{text:'ACCOUNT NAME: \n',fontSize:9},{text:'_____________________________________________'},
            {text:'DATE:',fontSize:9},
            {
               table:
               {
               // headerRows: 1,
                widths: [ 'auto','auto','auto','auto','auto','auto','auto','auto'],
                body:
                [
                  [
                    {text:'a',height:10,fontSize:9, color:'white'},
                    {text:'a',height:10,fontSize:9, color:'white'},
                    {text:'a',height:10,fontSize:9, color:'white'},
                    {text:'a',height:10,fontSize:9, color:'white'},
                    {text:'a',height:10,fontSize:9, color:'white'},
                    {text:'a',height:10,fontSize:9, color:'white'},
                    {text:'a',height:10,fontSize:9, color:'white'},
                    {text:'a',height:10,fontSize:9, color:'white'}
                  ]
                ]
                
               }
            }
          ],
          [
            {},{text:'ACCOUNT NO: ',fontSize:9},
            {
              table:
              {
              // headerRows: 1,
               widths: [ '*','*','*','*','*','*','*','*','*','*','*','*','*'],
               body:
               [
                 [
                   {text:'a',height:10,fontSize:9, color:'white'},
                   {text:'a',height:10,fontSize:9, color:'white'},
                   {text:'a',height:10,fontSize:9, color:'white'},
                   {text:'a',height:10,fontSize:9, color:'white'},
                   {text:'a',height:10,fontSize:9, color:'white'},
                   {text:'a',height:10,fontSize:9, color:'white'},
                   {text:'a',height:10,fontSize:9, color:'white'},
                   {text:'a',height:10,fontSize:9, color:'white'},
                   {text:'a',height:10,fontSize:9, color:'white'},
                   {text:'a',height:10,fontSize:9, color:'white'},
                   {text:'a',height:10,fontSize:9, color:'white'},
                   {text:'a',height:10,fontSize:9, color:'white'},
                   {text:'a',height:10,fontSize:9, color:'white'},
                 ]
               ]
               
              }
           },
           {text:'TXN CODE:',fontSize:9},
           {
            table:
            {
            // headerRows: 1,
             widths: [ 'auto','auto','auto','auto'],
             body:
             [
               [
                 {text:'a',height:10,fontSize:9, color:'white'},
                 {text:'a',height:10,fontSize:9, color:'white'},
                 {text:'a',height:10,fontSize:9, color:'white'},
                 {text:'a',height:10,fontSize:9, color:'white'},
               
               ]
             ]
             
            }
           }
          ],
          
        ]
      }
    },
    {
       columns:
       [
      
        [
        {
          margin:[45,0,0,0],
          padding:[0,3,0,3],
          table:
         {
          widths: ['auto'],
          body:[
            [
           { 
             columns:
            [
               [
               {
                margin:[0,3,0,3],
                canvas: [
                  {
                      type: 'polyline',
                      lineWidth: 1,
                      closePath: true,
                      points: [{ x: 0, y: 0}, { x: 8, y: 0 }, { x: 8, y: 8 }, { x: 0, y:8 }]
                  }
                ]
               }
               ],
               [
                
                {text:'CHEQUE',fontSize:9,margin:[0,3,15,3]}
               ],
               [
                {
                  margin:[15,3,0,3],
                 canvas: [
                   {
                       type: 'polyline',
                       lineWidth: 1,
                       closePath: true,
                       points: [{ x: 0, y: 0}, { x: 8, y: 0 }, { x: 8, y: 8 }, { x: 0, y:8 }]
                   }
                 ]
                }
                ],
                [
                 {margin:[0,3,0,3], text:'CASH',fontSize:9}
                ]
            ]
          }
            ]
          ]
         }
        }
        ],
        [
         {
          margin:[15,0,0,0],
          table:
         {
           widths:['auto'],
           body:
           [
            [
              {
                border: [true, true, true, true],
                margin:[5,3,5,3],
                text:'DEPOSIT INSTRUMENT PARTICULARS',fontSize:9
              }
            ]
           ]
         }
        }
        ],
      
       ]
    },

  

   

  /*  {
      text: 'A simple table with nested elements',
      style: 'subheader'
    },
    'It is of course possible to nest any other type of nodes available in pdfmake inside table cells',
    {
     // style: 'tableExample',
     layout: 'noBorders',
      table: {
     
        headerRows: 1,
        widths:['auto','auto'],
        body: [
          [ {text:'Column 1'}, {text:'Column 2'}],
          [
            
              { text:'or a nested table'},
              {
                table: {
                  layout: 'noBorders',
                  widths:['auto','auto','auto'],
                  body: [
                    [ {text:'a',height:10,fontSize:9, color:'white'}, '', ''],
                   // [ '1', '2', '3'],
                   // [ '1', '2', '3']
                  ]
                },
              }
            
          ]
        ]
      }
    },*/



   ]
  }
}
}
