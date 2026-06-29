import express from "express";
const router = express.Router()

import customerProductsController from "../controllers/customerProductsController.js";

router.get('/:id',customerProductsController.getAllCustomerProducts)
router.post('/:id',customerProductsController.addCustomerProduct)

export default router;