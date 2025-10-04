import mongoose from "mongoose";
import { IUserType } from "../../common/Interfaces/user.interface";
import { GenderEnum, OtpTypeEnum, ProviderEnum } from "../../common/Enums/user.enum";
import { decrypt, encrypt,generateHash, S3ClinetService } from "../../utils";

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

userSchema.pre('save',function(){

    if(this.isModified('password')){

        

        //Hash Password
this.password = generateHash(this.password as string);

    }
    //Encrypt Phone Number
    if(this.isModified('phoneNumber')){
        this.phoneNumber = encrypt(this.phoneNumber as string);
        
    }
})
    
userSchema.pre(['findOne','findOneAndUpdate'],function(){

    
})
    
userSchema.post(/^find/,function(doc){

    if ((this as unknown as {op:string}).op=='find'){
        doc.forEach((user:IUserType)=>{
            if(user.phoneNumber){
           user.phoneNumber=decrypt(user.phoneNumber as string);
            }
        })
    } else {
        if(doc.phoneNumber){
            doc.phoneNumber=decrypt(doc.phoneNumber as string);
        }
    }
})
userSchema.post('findOneAndDelete',async function(doc){
    const s3ClientService=new S3ClinetService();
    if(doc.profilePicture){
        await s3ClientService.deleteFileFromS3(doc.profilePicture as string)
    }
    if(doc.coverPicture){
        await s3ClientService.deleteFileFromS3(doc.coverPicture as string)
    }
})    


const UserModel = mongoose.model<IUserType>("User",userSchema);
export {UserModel};
