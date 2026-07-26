import express from 'express'
import { createProduct, deleteProduct, getAllProduct, getProduct, updateProduct } from '../controllers/product.controllers.js'
import multer from 'multer'
import { adminCheck } from '../middleware/AdminMiddleware.js'

const upload = multer({ storage: multer.memoryStorage() })

const productRouter = express.Router()

productRouter.get('/getAllProduct', getAllProduct)
productRouter.get('/get-Product/:id', getProduct)
productRouter.post('/createProduct', adminCheck, upload.single("image"), createProduct)
productRouter.put('/update-product/:id', adminCheck, upload.single("image"), updateProduct)
productRouter.delete('/delete-product/:id', adminCheck, deleteProduct)

export default productRouter