import { resendClient, sender  } from "../lib/resend.js"
import { createWelcomeEmailTemplate } from "./emailsTemplate.js"

export const sendWelcomeEmail  = async(email , name , clientURL ) =>{
    const { data , error } = await resendClient.emails.send({
        from : `${sender.name}  <${sender.email}>` ,
        to  :  email ,
        subject  :  "Welcome to Chatify",
        html  :  createWelcomeEmailTemplate(name , clientURL)
    }); 

    if(error){
        console.error("Error sending the Welcome email : " , error);
        throw new error ("Failed to send the welcome email");
    }

    console.log("Welcome email send successfully ", data);
 }