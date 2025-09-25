
import nodemailer from "nodemailer";
import { IEmailType } from "../../common/index";


export const sendEmail= async({
    to,
    subject,
    cc=process.env.GMAIL_USER,
    bcc=process.env.GMAIL_USER,
    content,
    attachments=[]
}:IEmailType)=>{
    const transporter=nodemailer.createTransport({
        host:"smtp.gmail.com",
        port:465,
        secure:true,
        auth:{
            user:process.env.GMAIL_USER,
            pass:process.env.GMAIL_PASSWORD
        }

    })

    const mailOptions= await transporter.sendMail({
        from:process.env.GMAIL_USER,
        to,
        cc,
        bcc,
        subject,
        html:content,
        attachments
    })
    console.log(mailOptions);
    return mailOptions;
}
import { EventEmitter } from "node:events";
export const localEventEmitter=new EventEmitter();
localEventEmitter.on("sendEmail",(args:IEmailType)=>{
        sendEmail(args);
});
