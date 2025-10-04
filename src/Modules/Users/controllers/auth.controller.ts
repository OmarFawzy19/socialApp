import { Router } from "express";
import authService from "../Services/auth.service";
import { authenticationMiddleware, validationMiddleware } from "../../../Middleware/index.middleware";
import { SignUpValidator } from "../../../validators/index";
const authController = Router();

authController.post("/signup",validationMiddleware(SignUpValidator),authService.sginUp)
authController.post("/signin",authService.signIn)
authController.post("/confirmUser",authService.confirmUser)
authController.post("/logout",authenticationMiddleware,authService.logout)

export {authController};