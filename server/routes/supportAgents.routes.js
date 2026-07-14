import express from "express";
const router = express.Router()

import supportAgentsController from "../controllers/supportAgentsController.js";
import { requireRole } from "../middlewares/auth.middleware.js";

router.get('/',requireRole("admin", "manager","support"),supportAgentsController.getAllSupportAgents)
router.get('/me',supportAgentsController.getMySupportAgent)
router.get('/:id',supportAgentsController.getSupportAgent)
router.post('/',requireRole("admin", "manager"),supportAgentsController.createSupportAgent)
router.put('/:id',requireRole("admin", "manager","support"),supportAgentsController.updateSupportAgent)
// router.delete('/:id',supportAgentsController.deleteSupportAgent)

export default router;