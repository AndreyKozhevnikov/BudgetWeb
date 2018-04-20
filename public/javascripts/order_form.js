window.onload=init;
window.onkeydown=processKeyDown;

function init(){
	let btn=  document.getElementById('btnDisableAfterClick');
	btn.addEventListener('click',disableOnSubmit);
	let btnYesterDay=document.getElementById('btnSetYesterday');
	btnYesterDay.addEventListener('click',setYesterday);
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

function setYesterday(){
	let dtInput=document.getElementById('dtDateOrder');
	let stValue=dtInput.valueAsDate;
	let year=stValue.getFullYear();
	let month=''+(stValue.getMonth()+1);
	if (month.length<2)
		month='0'+month;
	let day=''+(stValue.getDate()-1);
	if (day.length<2)
		day='0'+day;
	let nValueSt=[year,month,day].join('-');
	dtInput.value=nValueSt;
}