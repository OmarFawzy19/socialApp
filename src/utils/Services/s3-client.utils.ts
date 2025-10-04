import { DeleteObjectCommand, DeleteObjectsCommand, GetObjectCommand, PutObjectCommand, PutObjectCommandInput, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Upload } from "@aws-sdk/lib-storage";
import fs , {ReadStream} from "node:fs";

interface IPutObjectCommandInput extends PutObjectCommandInput{
    Body:string|Buffer|ReadStream
}
export  class S3ClinetService{
private s3Client=new S3Client({
    region:process.env.AWS_REGION as string,
    credentials:{
        accessKeyId:process.env.AWS_ACCESS_KEY_ID as string,
        secretAccessKey:process.env.AWS_SECRET_ACCESS_KEY as string
    }
})
private Key_folder=process.env.AWS_KEY_FOLDER as string;

async getFileWithSignedUrl(key:string,expiresIn=60*60){
    const getCommand=new GetObjectCommand({
        Bucket:process.env.AWS_BUCKET_NAME as string,
        Key:key
    })
    return await getSignedUrl(this.s3Client, getCommand, { expiresIn });
}
    

uplaodFileOnS3=async(file:Express.Multer.File,Key:string)=>{
    
    const KeyName=`${this.Key_folder}/${Key}/${Date.now()}-${file.originalname}`;

    const params:IPutObjectCommandInput={
        Bucket:process.env.AWS_BUCKET_NAME as string,
        Key:KeyName,
        Body:fs.createReadStream(file.path),
        ContentType:file.mimetype
    }
    const PutCommend =new PutObjectCommand(params);
     await this.s3Client.send(PutCommend);
     const signedUrl=await this.getFileWithSignedUrl(KeyName);
     return {
        url: signedUrl,
        Key: KeyName
    };
}
    async deleteFileFromS3(key:string){
        const deleteCommand=new DeleteObjectCommand({
            Bucket:process.env.AWS_BUCKET_NAME as string,
            Key:key
        })
        await this.s3Client.send(deleteCommand);
    }
    async deleteBulkFilesFromS3(keys:string[]){
        const deleteCommand=new DeleteObjectsCommand({
            Bucket:process.env.AWS_BUCKET_NAME as string,
            Delete:{
                Objects:keys.map(key=>({Key:key}))
            }
        })
        await this.s3Client.send(deleteCommand);
    }

     async uploadLargeFileOnS3(file: Express.Multer.File,Key:string) {

    const KeyName=`${this.Key_folder}/${Key}/${Date.now()}-${file.originalname}`;
    const params:IPutObjectCommandInput={
        Bucket:process.env.AWS_BUCKET_NAME as string,
        Key:KeyName,
        Body:fs.createReadStream(file.path),
        ContentType:file.mimetype
    }

    const upload = new Upload({
      client: this.s3Client,
      params: {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: KeyName,
        Body: fs.createReadStream(file.path),
        ContentType: file.mimetype,
      },
      partSize: 5 * 1024 * 1024, // 5 MB (default)
      queueSize: 4, // number of parts to upload in parallel
    });
    
    upload.on("httpUploadProgress", (progress) => {
      console.log(`Uploaded ${progress.loaded} of ${progress.total}`);
    });
    
    return await upload.done();
    }
    
}
