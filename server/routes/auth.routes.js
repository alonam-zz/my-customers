import express from "express";
const router = express.Router()

import authController from "../controllers/authController.js";

router.post('/login',authController.login)
router.get('/logout',authController.logout)
router.get('/me',authController.me)
router.put('/changePassword',authController.changePassword)



export default router;