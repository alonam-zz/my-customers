import express from "express";
const router = express.Router()

import reportsController from "../controllers/reportsController.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/auth.middleware.js";

router.get('/:id',requireAuth,requireRole("admin","manager"),reportsController.getReportById)




export default router;