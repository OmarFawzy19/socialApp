import { NextFunction, Request, Response } from "express";
import { JwtPayload } from "jsonwebtoken";


import { verifyAccessToken,BadRequestException } from "../utils/index";
import { UserModel, BlackListedTokensModel } from "../DB/Models/index";
import { IRequest, IUserType } from "../common";  
import { UserRepository, BlackListedTokensRepository } from "../DB/Repositories/index";



const userRepo=new UserRepository(UserModel);
const blackListedTokensRepo=new BlackListedTokensRepository(BlackListedTokensModel);

export const authenticationMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const { authorization: accesstoken } = req.headers 
    // console.log(accesstoken);
    if(!accesstoken){
        return next(new BadRequestException("please login first",{message:"please login first"}));
    }

    const[prifix,token]=accesstoken.split(" ");
    if(prifix!==process.env.JWT_ACCESS_TOKEN_PREFIX){

        // console.log(token);
        
        return res.status(401).json({message:"Invalid token"});
    }
    
    const decodedData = verifyAccessToken(token, process.env.JWT_ACCESS_TOKEN_SECRET as string);

    if (typeof decodedData === "string" || !("_id" in decodedData) || !("jti" in decodedData)) {
        return res.status(401).json({ message: "Invalid token" });
    }

    // check blacklist
    const blackListedToken = await blackListedTokensRepo.findOneDocument({ tokenID: decodedData.jti });
    if (blackListedToken) {
        return res.status(401).json({ message: "session expired try to login again" });
    }

    const user :IUserType|null=await userRepo.findDocumentById(decodedData._id,"-password");
    if(!user){
        return res.status(401).json({message:"User not found"});
    }
    (req as unknown as IRequest).loggedInUser={user,tokens:decodedData as JwtPayload};
    next();
    
}