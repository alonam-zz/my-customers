import express from "express";
const router = express.Router()

import employeesController from "../controllers/employeesController.js";
import authController from "../controllers/authController.js";
import { requireRole } from "../middlewares/auth.middleware.js";

router.get('/',requireRole("admin", "manager","support"),employeesController.getAllEmployees)
router.get('/:id',requireRole("admin", "manager","support"),employeesController.getEmployee)
router.post('/',requireRole("admin", "manager"),employeesController.createEmployee)
router.put('/:id',requireRole("admin", "manager"),employeesController.updateEmployee)
router.put('/reactivate/:email',requireRole("admin", "manager"),authController.forgotPassword)
// router.delete('/:id',employeesController.deleteEmployees)

export default router;