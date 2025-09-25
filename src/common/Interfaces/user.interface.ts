import { Document } from "mongoose";
import { GenderEnum, OtpTypeEnum, ProviderEnum } from "../Enums/user.enum";

interface IOtpType{
    value:string;
    expiresAt:number;
    otpType:OtpTypeEnum;
}
  interface IUserType extends Document{
    firstName:string;
    lastName:string;
    email:string;
    password:string;
    gender:GenderEnum;
    DOB?:Date;
    profilePicture?:string;
    coverPicture?:string;
    provider?:ProviderEnum;
    googleId?:string;
    isVerified?:boolean;
    phoneNumber?:string;
    otp?:IOtpType[]
}

interface IEmailType{
    to:string;
    subject:string;
    cc?:string;
    bcc?:string;
    content:string;
    attachments?:[];
}
export {IUserType,IEmailType};