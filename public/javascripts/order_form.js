window.onload=init;
window.onkeydown=processKeyDown;

function init(){
	let btn=  document.querySelector('.btnDisableAfterClick');
	btn.addEventListener('click',disableOnSubmit);
}

function disableOnSubmit(){
	setTimeout(()=>(this.disabled=true),1);
	setTimeout(()=>(this.disabled=false),1000);
}

function processKeyDown(evt){
	if (event.ctrlKey&&event.keyCode==13){
		let form=document.querySelector('#order_form');
		form.submit();
	}
}