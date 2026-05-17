import express from 'express'
import { addProduct } from '../controllers/ecommerce.controllers.js'

const ecommerceRouter = express.Router()

ecommerceRouter.post('/addProducts', addProduct)

export default ecommerceRouter