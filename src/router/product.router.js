import express from 'express'
import { createProduct } from '../controllers/product.controllers.js'

const productRoutes = express.Router()

productRoutes.post('/createProduct', createProduct)

export default productRoutes



// import express from "express";
// import multer from "multer";
// import { createProduct, getAllProducts, getProductById, updateProduct, deleteProduct } from "../controllers/productController.js";

// const upload = multer({ dest: "temp/" });
// const router = express.Router();

// router.post("/", upload.single("image"), createProduct);
// router.get("/", getAllProducts);
// router.get("/:id", getProductById);
// router.put("/:id", upload.single("image"), updateProduct);
// router.delete("/:id", deleteProduct);

// export default router;