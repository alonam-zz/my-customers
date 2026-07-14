import express from "express";
const router = express.Router()

import serviceCallsController from "../controllers/serviceCallsController.js";
import { requireRole } from "../middlewares/auth.middleware.js";

router.get('/',serviceCallsController.getAllServiceCalls)
router.get("/:customerId/calls", requireRole("admin", "manager","support","technician"),serviceCallsController.getCustomerCalls);
router.get('/:id',serviceCallsController.getServicCall)
router.post('/',requireRole("admin", "manager","support"),serviceCallsController.createServicCall)
router.put('/:id',requireRole("admin", "manager","support"),serviceCallsController.updateServicCall)
router.put('/:id/updateFinishByTechnician',requireRole("technician"),serviceCallsController.updateFinishByTechnicianServicCall)
// router.delete('/:id',techniciansController.deleteTechnician)

export default router;