import express from "express";
const router = express.Router()

import logsController from "../controllers/logsController.js";


router.get('/',logsController.getLogs)
router.post('/',logsController.createLog)



export default router;