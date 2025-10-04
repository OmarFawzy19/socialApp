import { Router } from "express";
import profileService from "../Services/profile.service";
import { authenticationMiddleware, Multer } from "../../../Middleware/index.middleware";
const profileController = Router();

profileController.get('/get-profile/:_id',profileService.getProfile)
profileController.get('/list-users',profileService.listUsers)

profileController.put('/update-account',authenticationMiddleware,profileService.updateAccount)


profileController.post('/delete-account',authenticationMiddleware,profileService.deleteAccount)



profileController.post('/upload-profile-picture',authenticationMiddleware,Multer().single('profilePicture'),profileService.uploadProfilePicture)

profileController.post('/renew-signed-url',authenticationMiddleware,profileService.renewSignedUrl)
export {profileController};