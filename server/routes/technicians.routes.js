import express from "express";
const router = express.Router()

import techniciansController from "../controllers/techniciansController.js";
import { requireRole } from "../middlewares/auth.middleware.js";

router.get('/',techniciansController.getAllTechnicians)
router.get('/me',techniciansController.getMyTechnician)
router.get('/:id',techniciansController.getTechnician)
router.post('/',requireRole("admin", "manager"),techniciansController.createTechnician)
router.put('/:id',requireRole("admin", "manager","support","technician"),techniciansController.updateTechnician)
// router.delete('/:id',techniciansController.deleteTechnician)

export default router;