import { Model } from "mongoose";
import { IUserType } from "../../common";
import { BaseRepository } from "./base.repository";
import { UserModel } from "../Models/index";

export class UserRepository extends BaseRepository<IUserType>{
    constructor(protected _usermodel:Model<IUserType>){
        super(_usermodel);
    }
}