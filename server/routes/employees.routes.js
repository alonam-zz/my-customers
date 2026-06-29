import express from "express";
const router = express.Router()

import employeesController from "../controllers/employeesController.js";

router.get('/',employeesController.getAllEmployees)
router.get('/:id',employeesController.getEmployee)
router.post('/',employeesController.createEmployee)
router.put('/:id',employeesController.updateEmployee)
// router.delete('/:id',employeesController.deleteEmployees)

export default router;