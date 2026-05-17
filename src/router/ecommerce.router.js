import express from 'express'
import { addProduct } from '../controllers/ecommerce.controllers.js'

const router = express.Router()

router.post('/addProducts', addProduct)

export default router