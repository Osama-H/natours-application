import axios from 'axios';
import { showAlert } from './alert';

export const login = async(email, password)=>{
    console.log(email, password);
   try{
    const res = await axios({
        method :"POST",
        url : '/api/v1/users/login',   // get it from postam
        data : { // the data that we're seding along with the request in the body (that we need from user)
            email,
            password
        },
        withCredentials: true
    });


    if(res.data.status === 'success'){
        showAlert('success','Logged in succesfully')
        window.setTimeout(()=>{
            location.assign('/')
        },1500)
    }


    console.log(res)
   }catch(err){
    showAlert('error',err.response.data.message)
   }
}


export const logout = async ()=>{
    // there cannot really be an error while logging out, but for example no internet connection
    try{    
        const res = await axios({
            method : 'GET',
            url :"/api/v1/users/logout"
        })
        if(res.data.status = 'success'){
            location.reload(true) // why the true ? to force a reload from the server and not from browser cache 
        }
    }catch(err){
        showAlert('error',err.response.data.message)
    }
}
