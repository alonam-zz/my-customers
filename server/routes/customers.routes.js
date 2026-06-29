import express from "express";
const router = express.Router()

import customerController from "../controllers/customersController.js";

router.get('/',customerController.getAllCustomers)
router.get('/:id',customerController.getCustomer)
router.get('/:id/name',customerController.getCustomerName)
router.post('/',customerController.createCustomer)
router.put('/:id',customerController.updateCustomer)
router.delete('/:id',customerController.deleteCustomer)

router.get('/:id/products',customerController.getAllCustomerProducts)
router.post('/:id/add-product',customerController.addCustomerProduct)

export default router;