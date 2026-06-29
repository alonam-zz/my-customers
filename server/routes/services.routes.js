import express from "express";
const router = express.Router()

import servicesController from "../controllers/servicesController.js";

router.get('/', servicesController.getAllServices)
router.get('/:id', servicesController.getService)
router.post('/', servicesController.createService)
router.put('/:id', servicesController.updateService)
// router.delete('/:id', servicesController.deleteService)

export default router;
