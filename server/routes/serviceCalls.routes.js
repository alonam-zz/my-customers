import express from "express";
const router = express.Router()

import serviceCallsController from "../controllers/serviceCallsController.js";

router.get('/',serviceCallsController.getAllServiceCalls)
router.get("/:customerId/calls", serviceCallsController.getCustomerCalls);
router.get('/:id',serviceCallsController.getServicCall)
router.post('/',serviceCallsController.createServicCall)
router.put('/:id',serviceCallsController.updateServicCall)
// router.delete('/:id',techniciansController.deleteTechnician)

export default router;