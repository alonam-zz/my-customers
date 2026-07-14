import express from "express";
const router = express.Router()

import dashboardController from "../controllers/dashboardController.js";

router.get('/getState',dashboardController.getState)
// router.get('/getState1',dashboardController.getState1)
// router.get('/getState1',dashboardController.getState1)
// router.get('/getState1',dashboardController.getState1)




export default router;