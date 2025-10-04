import { NextFunction,Request,Response } from "express";
import { BadRequestException ,S3ClinetService, SuccessResponse} from "../../../utils";
import { IUserType, IRequest } from "../../../common";
import { UserRepository } from "../../../DB/Repositories/user.repository";
import { UserModel } from "../../../DB/Models/index";
import mongoose from "mongoose";









export class ProfileService{
    private s3ClientService=new S3ClinetService();
    private userRepo=new UserRepository(UserModel);
    uploadProfilePicture=async(req:Request,res:Response,next:NextFunction)=>{
        const {file}=req;
        const {user}=(req as unknown as IRequest).loggedInUser
        if(!file) throw new BadRequestException("No file uploaded");
        const {url,Key}=await this.s3ClientService.uplaodFileOnS3(file,`${user._id}/profilePictures`);

        user.profilePicture= Key;

        await user.save();

        res.json(SuccessResponse<unknown>('Profile picture uploaded successfully',200,{url,Key}))
        
    }


    renewSignedUrl=async(req:Request,res:Response,next:NextFunction)=>{
        const {user}=(req as unknown as IRequest).loggedInUser
        const {Key,KeyType}=req.body;
        if(user[KeyType as keyof IUserType]!==Key){
            throw new BadRequestException("Invalid key");
        }
        const url=await this.s3ClientService.getFileWithSignedUrl(Key);
        res.json(SuccessResponse<unknown>('Signed url renewed successfully',200,{Key,url}))
    }

    deleteAccount=async(req:Request,res:Response,next:NextFunction)=>{
        const {user}=(req as unknown as IRequest).loggedInUser
        const deletedDocument= await this.userRepo.deleteByIdDocument(user._id as mongoose.Schema.Types.ObjectId);
        if(!deletedDocument){
            throw new BadRequestException("Failed to delete account");
        }
        // const deletedResponse=await this.s3ClientService.deleteFileFromS3(deletedDocument.profilePicture as string);
        res.json(SuccessResponse<unknown>('Account deleted successfully',200,deletedDocument))
    }
    updateAccount = async (req: Request, res: Response, next: NextFunction) => {
        const { user: loggedInUser } = (req as unknown as IRequest).loggedInUser;
        const { firstName, lastName, email, password, gender, DOB, phoneNumber }: IUserType = req.body;
      
        // const userDoc = await this.userRepo.findDocumentById(loggedInUser._id as mongoose.Schema.Types.ObjectId);
        // if (!userDoc) throw new BadRequestException("User not found");
      
        // if (firstName) userDoc.firstName = firstName;
        // if (lastName) userDoc.lastName = lastName;
        // if (email) userDoc.email = email;
        // if (password) userDoc.password = password;
        // if (gender) userDoc.gender = gender;
        // if (DOB) userDoc.DOB = DOB;
        // if (phoneNumber) userDoc.phoneNumber = phoneNumber;
      
        // await userDoc.save();
        await this.userRepo.updateOneDocument({_id:loggedInUser._id as mongoose.Schema.Types.ObjectId},
            {$set:{firstName,lastName,email,password,gender,DOB,phoneNumber}},
            {new:true}
        );
        res.json(SuccessResponse('Account updated successfully', 200));
      };

    getProfile=async(req:Request,res:Response,next:NextFunction)=>{
        
        const userDoc=await this.userRepo.findDocumentById(req.params._id as unknown as mongoose.Schema.Types.ObjectId);
        if(!userDoc){
            throw new BadRequestException("User not found");
        }
        res.json(SuccessResponse('Profile fetched successfully',200,userDoc))
    }
    listUsers=async(req:Request,res:Response,next:NextFunction)=>{
        const userDocs= await this.userRepo.findDocuments({});
        res.json(SuccessResponse('Users fetched successfully',200,userDocs))
    }
}
export default new ProfileService();    
