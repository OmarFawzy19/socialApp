import dotenv from "dotenv";
dotenv.config();

import { dbConnection } from "./DB/db.connection";

import express from "express";
import * as Controllers from "./Modules/controllers.index";
import { NextFunction, Request, Response } from "express";
import { HttpException,FailedResponse } from "./utils/index";

const app = express();
app.use(express.json());

dbConnection();

app.use("/api/users",Controllers.profileController);
app.use("/api/auth",Controllers.authController);
app.use("/api/posts",Controllers.postsController);
app.use("/api/reacts",Controllers.reactController);
app.use("/api/comments",Controllers.commentsController);

//error handling middleware
app.use  ((err:HttpException|Error|null,req:Request,res:Response,next:NextFunction)=>{
    if(err){
        if(err instanceof HttpException){
            return res.status(err.statusCode).json(FailedResponse(err.message,err.statusCode,err.error));
        }else{
            return res.status(500).json(
                FailedResponse("Something went wrong", 500, {
                  name: err.name,
                  message: err.message,
                  stack: process.env.NODE_ENV === "development" ? err.stack : undefined
                })
              );
              
        }
    }
})


// PORT from .env or fallback to 3000
const PORT: number | string = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
