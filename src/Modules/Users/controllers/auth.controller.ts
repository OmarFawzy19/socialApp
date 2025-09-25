import { Router } from "express";
import authService from "../Services/auth.service";
const authController = Router();

authController.post("/signup",authService.sginUp)
authController.post("/signin",authService.signIn)
authController.post("/confirmUser",authService.confirmUser)

export {authController};