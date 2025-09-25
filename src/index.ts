import dotenv from "dotenv";
dotenv.config();

import { dbConnection } from "./DB/db.connection";

import express from "express";
import * as Controllers from "./Modules/controllers.index";
import { NextFunction, Request, Response } from "express";

const app = express();
app.use(express.json());

dbConnection();

app.use("/api/users",Controllers.profileController);
app.use("/api/auth",Controllers.authController);
app.use("/api/posts",Controllers.postsController);
app.use("/api/reacts",Controllers.reactController);
app.use("/api/comments",Controllers.commentsController);

//error handling middleware
app.use  ((err:Error|null,req:Request,res:Response,next:NextFunction)=>{
    const message = err?.message || "Something went wrong";
    const statusCode = 500;
    res.status(statusCode).json({message});
})


// PORT from .env or fallback to 3000
const PORT: number | string = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
