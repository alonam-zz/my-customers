import express from "express";
const router = express.Router()

import serviceCallLinesController from "../controllers/serviceCallLinesController.js";

router.get('/:call_id',serviceCallLinesController.getAllServiceCallsByCallId)
router.post('/:call_id',serviceCallLinesController.createServiceCallLine)
// router.put('/:id',serviceCallLinesController.updateServicCallLine)
// router.delete('/:id',techniciansController.deleteTechnician)

export default router;