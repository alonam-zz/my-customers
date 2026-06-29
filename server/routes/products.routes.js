import express from "express";
const router = express.Router()

import productsController from "../controllers/productsController.js";

router.get('/',productsController.getAllProducts)
router.post('/',productsController.createProduct)
router.put('/:id',productsController.updateProduct)
router.get('/:id/services',productsController.getProductServices)
// router.delete('/:id',productsController.deleteProduct)

export default router;