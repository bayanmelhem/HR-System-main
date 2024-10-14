const app={
    table:document.getElementsByTagName('table')[0],
    paginationButton:document.getElementById('pagination-controls'),
    paginationNumbers:document.getElementById('pagination-numbers'),
    fragment:document.createDocumentFragment(),
    // دالة لبدء تحميل البيانات
    onint:function(){
      fetch("./data.json").then(response=>response.json()).then(data=>{
        let pageRows = 4;
        //checks if pagination is needed or not 
        if(data.length <= pageRows){
            data.forEach(element => {
                this.appendRow(element);
            });
        }
        else{
            //first adding of elements if pagination needed
            for(let i = 0;i<pageRows;i++){
                if(i === data.length -1)
                    break;
    
                this.appendRow(data[i]); 
            }  

            //creating buttons and adding functionality
            let pageNumber = 1;
            this.paginationButton.classList.add('appear');
            let numofPages = Math.ceil(data.length/pageRows);

            for(i=1;i<=numofPages;i++){
                let button = document.createElement('button');
                button.classList.add('btn');
                button.textContent = `${i}`;
                if(i===1){
                    button.classList.add('selected')
                }

                button.addEventListener('click',()=>{
                    
                    pageNumber  = button.textContent;
                    let delRow = document.getElementsByClassName('tableRow');
                    Array.from(delRow).forEach(row=>{
                        row.remove();
                    })

                    for(let i = (pageRows*pageNumber)-pageRows;i<pageRows*pageNumber;i++){
                        if(i === data.length){
                            break;
                        }
                        this.appendRow(data[i]);
                        this.table.appendChild(this.fragment);
                    }
                })
                this.paginationNumbers.appendChild(button); 
                let btns = document.getElementsByClassName('btn')
                button.addEventListener('click',()=>{
                    Array.from(btns).forEach(btn =>{
                        btn.classList.remove('selected')
                    })
                    button.classList.add('selected')
                });
            }
        }
        
    
        //اضافة ال fragment للجدول الاصلي 
        this.table.appendChild(this.fragment);
        })
      .catch(error=>console.error(error))
      
       //الحصول على جميع الايقونات و اضافة حدث عند النقر عليها           
       const icons=document.querySelectorAll('.sorting-icons i').forEach((icon,index)=>{
        
        function activateMenuItem(element) {
            // Remove the active class from all menu items
            const items = document.querySelectorAll('.menu-item');
            items.forEach(item => item.classList.remove('active'));
        
            // Add the active class to the clicked item
            element.classList.add('active');
        }
        
        //حساب الاندكس لكل ايقون بناء على فهرس العمود 
        let colIndex=Math.floor(index/2)+1;// 1-indexed
        if(colIndex==3)colIndex=4;// تعديل خاص للعمود الثالث
        icon.addEventListener('click',()=>{
            this.sortTable(colIndex,(index%2==0)?'asc':'desc');
        })

    })
      
    },
    // دالة لإضافة صف جديد إلى الجدول
    appendRow:function(obj){
        const row=document.createElement('tr');
        row.classList.add('tableRow');
        //خلية للاسم 
        const Image=document.createElement('img');
        Image.src=obj.img;
        Image.alt=`Image of ${obj.name}`;
        const tableDataName=this.createCell([Image,document.createTextNode(obj.name)],"candidate-info");
        // خلية لتقييم المرشح
        const icon=document.createElement('svg');
        icon.setAttribute('xmlns',"http://www.w3.org/2000/svg");
        icon.setAttribute('width',"16");
        icon.setAttribute('height',"16");
        icon.setAttribute('fill',"currentColor");
        icon.className="bi bi-star-fill";
        icon.setAttribute('viewBox',"0 0 16 16");
        icon.innerHTML=`<path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z"/>`;
        const ratingValue=document.createElement('span');
        ratingValue.className="rating-value";
        ratingValue.textContent='  '+obj.rating.toFixed(1) ;
        const tableDataRating=this.createCell([icon,ratingValue]);
        // إنشاء الخلايا الأخرى
        const tableDataStage=this.createCell(obj.stage);
        const tableDataAppliedRole=this.createCell(obj.appliedRole);
        const tableDataApplicationDate=this.createCell(obj.applicationDate);
        //اضافة الخلايا للصف 
        row.appendChild(tableDataName);
        row.appendChild(tableDataRating);
        row.appendChild(tableDataStage);
        row.appendChild(tableDataAppliedRole);
        row.appendChild(tableDataApplicationDate);
        //اضافة الصف لل fragment
        this.fragment.appendChild(row);      
    },
    //دالة لانشاء خلية و اضافة المحتوى و الكلاس ان وجد 
    createCell: function(content, className = "") {
      const cell = document.createElement('td');
      if (className) {
          cell.className = className;
      }
      if(Array.isArray(content)){
        content.forEach(ele=>cell.appendChild(ele));
      }else if (typeof content === 'string') {
          cell.textContent = content;
      } else {
          cell.appendChild(content);  
      }
      return cell;
  },
  sortTable:function(columnIndex,order){
    const rows=Array(...this.table.rows).slice(1);
    const sortedRows=rows.sort((rowA,rowB)=>{
        const cellValueA=rowA.cells[columnIndex].innerText.trim();
        const cellValueB=rowB.cells[columnIndex].innerText.trim();
        //فرز عن طريق ارقام 
        if(columnIndex===1){//parseFloat لتحسين مقارنة الأرقام
            return (order==='asc')?parseFloat(cellValueA)-parseFloat(cellValueB):parseFloat(cellValueB)-parseFloat(cellValueA);
        }
        //فرز عن طريق نصوص
        else if(columnIndex===2){
            return (order==='asc')?cellValueA.localeCompare(cellValueB):cellValueB.localeCompare(cellValueA);
        }
        //فرز عن طريق التاريخ بتنسيق dd/mm/yy
        else {
            return this.compareDates(cellValueA,cellValueB,order);
        }
    });
    //اضافة الصفوف المرتبة الى حاوية ثم اضافه الحاوية للجدول 
    const fragment=document.createDocumentFragment();
    sortedRows.forEach(row =>fragment.appendChild(row));
    this.table.appendChild(fragment);
},
//التحويل من تنسيق dd/mm/yy ل dd/mm/yyyy
convertDateFormat:function(date){
  let [day,month,year]=date.split('/').map(Number);
  let fullYear=(year < 50)?2000+year:1900+year;
  return `${fullYear}-${month}-${day}`;
},
//فرز عن طريق التاريخ 
compareDates:function(dateA,dateB,selectedOrder){
  let fullDateA=Date.parse(this.convertDateFormat(dateA));
  let fullDateB=Date.parse(this.convertDateFormat(dateB));
  return (selectedOrder==='asc')?fullDateA-fullDateB:fullDateB-fullDateA;
}
    
}
// بدء تنفيذ الكود
app.onint();

