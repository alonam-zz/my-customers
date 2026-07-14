import express from "express";
const router = express.Router()

import productsController from "../controllers/productsController.js";
import { requireRole } from "../middlewares/auth.middleware.js";


router.get('/',productsController.getAllProducts)
router.post('/',requireRole("admin", "manager"),productsController.createProduct)
router.put('/:id',requireRole("admin", "manager"),productsController.updateProduct)
router.get('/:id/services',productsController.getProductServices)
// router.delete('/:id',productsController.deleteProduct)

export default router;