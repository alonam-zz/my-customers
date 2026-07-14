import express from "express";
const router = express.Router()

import servicesController from "../controllers/servicesController.js";
import { requireRole } from "../middlewares/auth.middleware.js";

router.get('/', servicesController.getAllServices)
router.get('/:id', servicesController.getService)
router.post('/', requireRole("admin", "manager"),servicesController.createService)
router.put('/:id',requireRole("admin", "manager"), servicesController.updateService)
// router.delete('/:id', servicesController.deleteService)

export default router;
