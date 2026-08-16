import express from 'express'
import { cretaeUser, forgotPass, getUser, loginUser, resetPassword, logout, getMe, updatePassword, updateProfile } from '../controllers/auth.controllers.js'
import { adminCheck } from '../middleware/AdminMiddleware.js'

const authRoutes = express.Router()

authRoutes.post('/register', cretaeUser)
authRoutes.post('/login', loginUser)
authRoutes.post("/reset-password", resetPassword);
authRoutes.post('/forgot-password', forgotPass)
authRoutes.patch('/updatePassword', adminCheck, updatePassword)
authRoutes.patch('/updateProfile', adminCheck, updateProfile)
authRoutes.get('/ViewAllUsers', getUser)
authRoutes.get('/logout', logout)
authRoutes.get('/getMe', getMe)

export default authRoutes