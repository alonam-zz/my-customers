import express from "express";
const router = express.Router()

import supportAgentsController from "../controllers/supportAgentsController.js";

router.get('/',supportAgentsController.getAllSupportAgents)
router.get('/:id',supportAgentsController.getSupportAgent)
router.post('/',supportAgentsController.createSupportAgent)
router.put('/:id',supportAgentsController.updateSupportAgent)
// router.delete('/:id',supportAgentsController.deleteSupportAgent)

export default router;