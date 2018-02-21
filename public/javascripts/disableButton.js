window.onload=init;
function init(){
   let btn=  document.querySelector('.btnDisableAfterClick');
   btn.addEventListener('click',disableOnSubmit);
}

function disableOnSubmit(){
	setTimeout(()=>(this.disabled=true),1);
	setTimeout(()=>(this.disabled=false),1000);
}