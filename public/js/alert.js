// type is 'success' or 'error

export const hideAlert = ()=>{
    const el = document.querySelector('.alert');
    if(el){
        el.parentElement.removeChild(el);
    }
}


export const showAlert = (type,msg)=>{
    // whenever we show an alert, first hide all the alerts that already exist 
    hideAlert();
    const markup = `<div class="alert alert--${type}">${msg}</div>`;
    document.querySelector('body').insertAdjacentHTML('afterbegin',markup)
    // hide all alerts after 5 seconds
}
