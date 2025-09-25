import { NextFunction,Request,Response } from "express";
import { IUserType } from "../../../common";
import { UserRepository } from "../../../DB/Repositories/user.repository";
import { UserModel } from "../../../DB/Models/index";
import { GenderEnum, OtpTypeEnum ,ProviderEnum } from "../../../common/Enums/user.enum";
import { compareHash, encrypt,generateAccessToken,generateHash, localEventEmitter } from "../../../utils/index";
import { v4 as uuidv4 } from "uuid";








class AuthService{
private userRepo:UserRepository=new UserRepository(UserModel);

    sginUp = async(req:Request,res:Response,next:NextFunction)=>{

        const {firstName,lastName,email,password,gender,DOB,phoneNumber}:Partial<IUserType> = req.body;
        
        const isUserExist = await this.userRepo.findOneDocument({email},'email');
        if(isUserExist){
            return res.status(400).json({message:"User already exists"});

        }

        //Encrypt Phone Number
        const encryptedPhoneNumber = encrypt(phoneNumber as string);

        //Hash Password
        const hashedPassword = generateHash(password as string);

        //Send OTP
        
        const otp = Math.floor(Math.random() * 1000000).toString();
        const hashedOtp = generateHash(otp);

        // localEventEmitter.emit("sendEmail",{
        //     to:email,
        //     subject:"Verify Your Email",
        //     content:`Your OTP is ${otp}`,
        //     attachments:[]
        // })
        console.log(otp);
        //لحد ما احل مشكله الايميل 
        
        const confirmationOtp={
            value:hashedOtp,
            expiresAt:Date.now()+5*60*1000,
            otpType:OtpTypeEnum.CONFIRMATION
        }

        const newUser = await this.userRepo.createNewDocument({
            firstName,lastName,email,password:hashedPassword,gender,DOB,phoneNumber:encryptedPhoneNumber,otp:[confirmationOtp]
        });
        
        return res.status(201).json({message:"User created successfully",data:{newUser}});
    }
    confirmUser = async (req: Request, res: Response) => {
        try {
            const { email, otp } = req.body;

            const user = await UserModel.findOne({ email, isVerified: false });
            if (!user) {
                return res.status(400).json({
                    message: "User not found"
                });
            }

            const otpEntry = user.otp?.find(entry => entry.otpType === OtpTypeEnum.CONFIRMATION);
            if (!otpEntry) {
                return res.status(400).json({
                    message: "No confirmation OTP found"
                });
            }

          
            const isOtpValid = compareHash(otp, otpEntry.value);
            if (!isOtpValid) {
                return res.status(400).json({
                    message: "Invalid otp"
                });
            }

            
            user.isVerified = true;
            user.otp = user.otp?.filter(entry => entry.otpType !== OtpTypeEnum.CONFIRMATION);

            await user.save();

            return res.status(200).json({
                message: "User confirmed successfully",
                user
            });
        } catch (error) {
            return res.status(500).json({
                message: "Internal server error",
                error
            });
        }
    }

    
    signIn = async (req: Request, res: Response, next: NextFunction) => {
        try {
          const { email, password } = req.body;
    
         
          const user = await this.userRepo.findOneDocument(
            { email, provider: ProviderEnum.LOCAL },
            "+password" 
          );
    
          if (!user) {
            return res.status(400).json({ message: "User not found" });
          }
    
          // التحقق من الباسورد
          const isPasswordValid = compareHash(password, user.password);
          if (!isPasswordValid) {
            return res.status(400).json({ message: "Invalid password" });
          }
    
          // generate access token
          const accessToken = generateAccessToken(
            { userId: user._id, email: user.email },
            process.env.JWT_ACCESS_TOKEN_SECRET!,
            {
              expiresIn: parseInt(process.env.JWT_EXPIRES_IN!),
              issuer: "Sarah App",
              audience: "Sarah App",
              jwtid: uuidv4(),
            }
          );
    
          // generate refresh token
          const refreshToken = generateAccessToken(
            { userId: user._id, email: user.email },
            process.env.JWT_REFRESH_TOKEN_SECRET!,
            {
              expiresIn: parseInt(process.env.JWT_REFRESH_TOKEN_EXPIRES_IN!),
              issuer: "Sarah App",
              audience: "Sarah App",
              jwtid: uuidv4(),
            }
          );
    
          return res.status(200).json({
            message: "User signed in successfully",
            user,
            accessToken,
            refreshToken,
          });
        } catch (error: any) {
          return res.status(500).json({
            message: "Internal server error",
            error: error.message,
          });
        }
      };
    
    
} 
export default new AuthService();
