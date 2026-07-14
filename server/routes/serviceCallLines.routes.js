import express from "express";
const router = express.Router()

import serviceCallLinesController from "../controllers/serviceCallLinesController.js";
import { requireRole } from "../middlewares/auth.middleware.js";

router.get('/:call_id',requireRole("admin", "manager","support","technician"),serviceCallLinesController.getAllServiceCallsByCallId)
router.post('/:call_id',requireRole("admin", "manager","support","technician"),serviceCallLinesController.createServiceCallLine)
// router.put('/:id',serviceCallLinesController.updateServicCallLine)
// router.delete('/:id',techniciansController.deleteTechnician)

export default router;