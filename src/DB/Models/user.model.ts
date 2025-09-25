import mongoose from "mongoose";
import { IUserType } from "../../common/Interfaces/user.interface";
import { GenderEnum, OtpTypeEnum, ProviderEnum } from "../../common/Enums/user.enum";

const userSchema = new mongoose.Schema<IUserType>({
    firstName:{
        type:String,
        required:true,
        minLength:[3,"First name must be at least 3 characters long"]
       
        
    },
    lastName:{
        type:String,
        required:true,
        minLength:[3,"Last name must be at least 3 characters long"],
       
    },
    email:{
        type:String,
        required:true,
        index:{
            unique:true,
            name:'idx_email_unique'
        }
    },
    password:{
        type:String,
        required:true
    },
    gender:{
        type:String,
        enum:GenderEnum,
        default:GenderEnum.OTHER,
        lowercase:true
    },
    DOB:Date,

    profilePicture:{type:String},
    coverPicture:{type:String},
    provider:{
        type:String,
        enum:ProviderEnum,
        default:ProviderEnum.LOCAL,
        lowercase:true
    },
    googleId:{
        type:String,
    },
    isVerified:{
        type:Boolean,
        default:false
    },
    phoneNumber:{
        type:String,
    },
    otp:[{
        value:{type:String,required:true},
        expiresAt:{type:Date,default:Date.now()+5*60*1000}, //default 5 minutes from now
        otpType:{type:String,enum:OtpTypeEnum,required:true}
    }]
    
})

const UserModel = mongoose.model<IUserType>("User",userSchema);
export {UserModel};
