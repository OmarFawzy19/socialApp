import { IFailureResponse, ISuccessResponse } from "../../common"


export function SuccessResponse<T>(
    message="your request is processed successfully",
    status:number,
    data?:T
):ISuccessResponse{
    return {
        meta:{
            status,
            success:true
        },
        data:{
            message,
            data
        }
    }
}

export function FailedResponse(
    message="your request is processed failed",
    status:number,
    error?:object
):IFailureResponse{
    return {
        meta:{
            status,
            success:false
        },
        error:{
            message,
            context:error
        }
    }
}
