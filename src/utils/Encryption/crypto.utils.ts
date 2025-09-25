import crypto from "node:crypto"
    
const IV_LENGTH=Number(process.env.IV_LENGTH);
const encryptionSecretKey=Buffer.from(process.env.ENCRYPTION_SECRET_KEY as string);


export const encrypt=(data:string):string=>{

    
    const iv=crypto.randomBytes(IV_LENGTH);
    const cipher=crypto.createCipheriv('aes-256-cbc',encryptionSecretKey,iv);
    
    let encryptedData=cipher.update(data,'utf-8','hex');
    
    encryptedData+=cipher.final('hex');
    return `${iv.toString('hex')}:${encryptedData}`;
}

export const decrypt=(encryptedData:string):string=>{
    const [iv,encryptedText]=encryptedData.split(':');
    const binaryLikeIv=Buffer.from(iv,'hex');
    const decipher=crypto.createDecipheriv('aes-256-cbc',encryptionSecretKey,binaryLikeIv);
    let decryptedData=decipher.update(encryptedText,'hex','utf-8');
    decryptedData+=decipher.final('utf-8');
    return decryptedData;
}




