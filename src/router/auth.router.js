import express from 'express'
import { cretaeUser, forgotPass, getUser, loginUser, resetPassword, logout } from '../controllers/auth.controllers.js'

const authRoutes = express.Router()

authRoutes.post('/register', cretaeUser)
authRoutes.post('/login', loginUser)
authRoutes.post("/reset-password", resetPassword);
authRoutes.post('/forgot-password', forgotPass)
authRoutes.get('/ViewAllUsers', getUser)
authRoutes.get('/logout', logout)

export default authRoutes