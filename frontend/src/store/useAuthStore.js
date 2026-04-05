import axios from "axios";
import { Activity } from "react";
import { create} from "zustand"
import { axiosInstance } from "../lib/axios.js";

export const useAuthStore = create ((set)=>({
    authUser : null ,
    isCheckingAuth : true,
    isSigningUp  : false ,

    checkAuth : async ()=>{
        try{
            const res = await axiosInstance.get("/auth/check")
            set( {authUser : res.data})

        }catch(error){
            console.log( "Error in checkAuth :" , error)
            set({authUser : null})
        }finally{
            set({isCheckingAuth : false});
        }
    },

    sigup : async()=>{
        set ( { isSigningUp : true})

        try {
            const res = await axiosInstance.post("/auth/signup" , data)
            set({ authUser : res.data });   

            // toast is used for beautiful pop ups ans notifications 
            toast.success("Account created successfully : ")
        } catch (error) {
            toast.error(error.response.data.message)
        }finally{
            set ( { isSigningUp : true})

        }
    }


}));