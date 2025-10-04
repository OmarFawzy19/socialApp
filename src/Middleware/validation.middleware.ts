import {Request,Response, NextFunction } from "express";
import { ZodType } from "zod";
import { BadRequestException } from "../utils";

type RequestKeysType= keyof Request;

type SchemaType=Partial<Record<RequestKeysType,ZodType>>;

type ValidationErrorType={
    Key:RequestKeysType;
    Issues:{
        path:PropertyKey[];
        message:string;
    }[]
}


export const validationMiddleware=(Schema:SchemaType)=>{
    return (req:Request, res:Response, next:NextFunction) => {
        const reqKeys:RequestKeysType[] = ['body','params','query','headers'];

        const validationErrors :ValidationErrorType[] =[]
        for(const key of reqKeys){
            if(Schema[key]){
                const result=Schema[key].safeParse(req[key]);
                console.log(`the validation is result`,{key,result});
                if(!result.success){
                   const issues = result.error?.issues.map(issue=>({
                    path:issue.path,
                    message:issue.message
                   }))
                   validationErrors.push({Key:key,Issues:issues})
                }
            }
        }
        if(validationErrors.length) throw new BadRequestException("Validation failed",{validationErrors});
        next();
    };
}