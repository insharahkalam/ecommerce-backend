import express from 'express'
import { createOrder, getAllOrders, getMyOrders, getOrder, updateOrderStatus, deleteOrder } from '../controllers/order.controllers.js'
import { adminCheck } from '../middleware/AdminMiddleware.js'
import { userCheck } from '../middleware/UserMiddleware.js'

const orderRouter = express.Router()

orderRouter.post('/createOrder', userCheck, createOrder)
orderRouter.get('/my-orders', userCheck, getMyOrders)
orderRouter.get('/getAllOrders', adminCheck, getAllOrders)
orderRouter.get('/get-order/:id', adminCheck, getOrder)
orderRouter.put('/update-status/:id', adminCheck, updateOrderStatus)
orderRouter.delete('/delete-order/:id', adminCheck, deleteOrder)

export default orderRouter