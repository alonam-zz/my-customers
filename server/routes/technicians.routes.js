import express from "express";
const router = express.Router()

import techniciansController from "../controllers/techniciansController.js";

router.get('/',techniciansController.getAllTechnicians)
router.get('/:id',techniciansController.getTechnician)
router.post('/',techniciansController.createTechnician)
router.put('/:id',techniciansController.updateTechnician)
// router.delete('/:id',techniciansController.deleteTechnician)

export default router;