import express from "express";
const router = express.Router()

import customerController from "../controllers/customersController.js";
import { requireRole } from "../middlewares/auth.middleware.js";

router.get('/',requireRole("admin", "manager","support"),customerController.getAllCustomers)
router.get('/:id',requireRole("admin", "manager","support","technician"),customerController.getCustomer)
router.get('/:id/name',requireRole("admin", "manager","support","technician"),customerController.getCustomerName)
router.post('/',requireRole("admin", "manager","support"), customerController.createCustomer)
router.put('/:id',requireRole("admin", "manager","support"), customerController.updateCustomer)
router.delete('/:id',requireRole("admin", "manager"), customerController.deleteCustomer)

router.get('/:id/products',requireRole("admin", "manager","support","technician"),customerController.getAllCustomerProducts)
router.post('/:id/add-product',requireRole("admin", "manager","support"),customerController.addCustomerProduct)

export default router;