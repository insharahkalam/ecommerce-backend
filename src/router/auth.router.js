import express from 'express'
import { cretaeUser, loginUser } from '../controllers/auth.controllers.js'

const authRouter = express.Router()

authRouter.post('/creatUser', cretaeUser)
authRouter.post('/loginUser', loginUser)

export default authRouter