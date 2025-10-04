import mongoose, { Document } from "mongoose";
import { IBlackListedTokens } from "../../common/index";
const blackListedTokensSchema = new mongoose.Schema<IBlackListedTokens>({
    tokenID:{
        type:String,
        required:true
    },
    expiresAt:{
        type:Date,
        required:true,
        
    }
});

const BlackListedTokensModel = mongoose.model("BlackListedTokens",blackListedTokensSchema);
export {BlackListedTokensModel};
