import { BaseRepository } from "./base.repository";
import { IBlackListedTokens } from "../../common/index"
import { Model } from "mongoose";

export class BlackListedTokensRepository extends BaseRepository<IBlackListedTokens>{
    constructor(protected _blackListedTokensModel:Model<IBlackListedTokens>){
        super(_blackListedTokensModel);
    }
}
