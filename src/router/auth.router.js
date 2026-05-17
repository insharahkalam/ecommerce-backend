import express from 'express'
import { cretaeUser } from '../controllers/auth.controllers.js'

const authRouter = express.Router()

authRouter.post('/creatUser', cretaeUser)

export default authRouter