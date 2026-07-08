import express from 'express'
import { createProduct } from '../controllers/product.controllers.js'

const productRoutes = express.Router()

productRoutes.post('/createProduct', createProduct)

export default productRoutes