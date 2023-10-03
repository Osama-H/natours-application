import axios from "axios";
import { showAlert, hideAlert } from "./alert"; 


// export const updateSettings = async(name, email)=>{

//     try{
//         const res = await axios({
//             method : "PATCH", // we can write it in lowercase, but we prefer the uppercase
//             url : "/api/v1/users/updateMe",
//             data : {
//                 name,
//                 email
//             },
//                 withCredentials : true
//         })

//         if(res.data.status === 'success'){
//             showAlert('success','Your Data updated Successfully')
         
           
//         }


//     }catch(err){
//         showAlert('error',err.response.data.message)

//     }

// }



// type is either password or data
export const updateSettings = async(data,type)=>{

    try{
        const url = type === 'password' ? '/api/v1/users/updateMyPassword' : '/api/v1/users/updateMe'
        const res = await axios({
            method : "PATCH", // we can write it in lowercase, but we prefer the uppercase
            url,
            data,
                withCredentials : true
        })

        if(res.data.status === 'success'){
            showAlert('success',`Your ${type.toUpperCase()} updated Successfully`)
         
        }


    }catch(err){
        showAlert('error',err.response.data.message)

    }

}