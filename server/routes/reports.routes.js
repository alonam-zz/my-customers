import express from "express";
const router = express.Router()

import reportsController from "../controllers/reportsController.js";

router.get('/:id',reportsController.getReportById)




export default router;