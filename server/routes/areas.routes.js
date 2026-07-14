import express from "express";
const router = express.Router()

import areasController from "../controllers/areasController.js";

router.get('/', areasController.getAreas)

export default router;
