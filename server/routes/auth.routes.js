import express from "express";
const router = express.Router()

import authController from "../controllers/authController.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

router.post('/login',authController.login)
router.get('/logout',authController.logout)
router.get('/activate/:token',authController.getActivation)
router.post('/activate/:email',authController.forgotPassword)
router.get('/me',requireAuth,authController.me)
router.put('/changePassword',requireAuth,authController.changePassword)
router.put('/activate/:token',authController.activateUser)




export default router;