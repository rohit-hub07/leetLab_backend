import express from 'express'
import { checkController, loginController, logoutController, registerController } from '../controller/user.controller.js';
import {isAuthenticated} from '../middleware/auth.middle.js';

const authRoutes = express.Router();

authRoutes.post("/register", registerController)
authRoutes.post("/login", loginController)
authRoutes.get("/logout", isAuthenticated, logoutController)
authRoutes.get("/check", isAuthenticated, checkController)
export default authRoutes;