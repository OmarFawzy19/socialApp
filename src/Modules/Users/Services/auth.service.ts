import { NextFunction,Request,Response } from "express";
import { IRequest, IUserType, sginUpBodyType } from "../../../common";
import { UserRepository } from "../../../DB/Repositories/user.repository";
import { BlackListedTokensModel, UserModel } from "../../../DB/Models/index";
import { GenderEnum, OtpTypeEnum ,ProviderEnum } from "../../../common/Enums/user.enum";
import { compareHash, encrypt,generateAccessToken,generateHash, localEventEmitter ,BadRequestException,ConflictException,NotFoundException,SuccessResponse, FailedResponse} from "../../../utils/index";
import { v4 as uuidv4 } from "uuid";
import { BlackListedTokensRepository } from "../../../DB/Repositories";








class AuthService{
private userRepo:UserRepository=new UserRepository(UserModel);
private blackListedTokensRepo:BlackListedTokensRepository=new BlackListedTokensRepository(BlackListedTokensModel);

    sginUp = async(req:Request,res:Response,next:NextFunction)=>{

        const {firstName,lastName,email,password,confirmPassword,gender,DOB,phoneNumber}:sginUpBodyType = req.body;
        
        const isUserExist = await this.userRepo.findOneDocument({email},'email');
        if(isUserExist){
            // return res.status(400).json({message:"User already exists"});
            throw new ConflictException("User already exists",{invalidEmail: email});
        }

        //Encrypt Phone Number
       

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
            firstName,lastName,email,password,gender,DOB,phoneNumber,otp:[confirmationOtp]
        });
        
        return res.status(201).json(SuccessResponse<IUserType>("User created successfully",201,newUser));
    }
    confirmUser = async (req: Request, res: Response,next:NextFunction) => {
        try {
            const { email, otp } = req.body;

            const user = await UserModel.findOne({ email, isVerified: false });
            if (!user) {
                throw new NotFoundException("User not found",{message:"User not found"});
            }

            const otpEntry = user.otp?.find(entry => entry.otpType === OtpTypeEnum.CONFIRMATION);
            if (!otpEntry) {
                throw new NotFoundException("No confirmation OTP found",{message:"No confirmation OTP found"});
            }

          
            const isOtpValid = compareHash(otp, otpEntry.value);
            if (!isOtpValid) {
                throw new BadRequestException("Invalid otp",{message:"Invalid otp"});
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
            throw new NotFoundException("User not found",{message:"User not found"});
          }
    
          const isPasswordValid = compareHash(password, user.password);
          if (!isPasswordValid) {
            throw new BadRequestException("Invalid password",{message:"Invalid password"});
          }
    
          // generate access token
          const accessToken = generateAccessToken(
            { _id: user._id, email: user.email },
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
            { _id: user._id, email: user.email },
            process.env.JWT_REFRESH_TOKEN_SECRET!,
            {
              expiresIn: parseInt(process.env.JWT_REFRESH_TOKEN_EXPIRES_IN!),
              issuer: "Sarah App",
              audience: "Sarah App",
              jwtid: uuidv4(),
            }
          );
    
          return res.status(200).json(SuccessResponse(
            "User signed in successfully",
            200,
            { user, accessToken, refreshToken }
          ));
          
        } catch (error: any) {
          return res.status(500).json(FailedResponse(
            "Internal server error",
            500,
            { error: error.message }
          ));
        }
      };
    
    logout = async (req: Request, res: Response) => {
        const { tokens:{jti,exp} } = (req as unknown as IRequest).loggedInUser;
        
        const blackListedToken = await this.blackListedTokensRepo.createNewDocument({ tokenID: jti, expiresAt: new Date(exp||Date.now()+60*60*1000) });
        return res.status(200).json({ message: "User logged out successfully" });
    }
}
export default new AuthService();
