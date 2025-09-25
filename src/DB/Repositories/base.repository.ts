import mongoose, { FilterQuery,Model, ProjectionType, QueryOptions } from "mongoose";

export abstract class BaseRepository<T>{
    
    constructor(private model: mongoose.Model<T>){

    }
    async createNewDocument(document:Partial<T>):Promise<T>{
        return await this.model.create(document);
    }

    async findOneDocument(filters:FilterQuery<T>,projection?:ProjectionType<T>,options?:QueryOptions<T>):Promise<T|null>{
        return await this.model.findOne(filters,projection,options);
    }

    async findDocumentById(id:string):Promise<T|null>{
        return await this.model.findById(id);
    }

    updateOneDocument(){}

    updateMultipleDocuments(){}

    findAndUpdateDocument(){}

    deleteOneDocument(){}

    deleteMultipleDocuments(){}

    findAndDeleteDocument(){}
    findDocuments(){}
}
