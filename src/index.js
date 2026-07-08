import dns from 'dns'
dns.setServers(['8.8.8.8', '1.1.1.1'])

import expess from 'express'
import dotenv from 'dotenv'
dotenv.config()
import connectDB from './db/db.js';

import productRoutes from './router/product.router.js'
import authRoutes from './router/auth.router.js'

const app = expess()
app.use(expess.json())

connectDB()

app.get('/', (req, res) => {
    res.json({
        message: "server in running"
    })
})


app.use("/api/authentication", authRoutes)
app.use("/api/products", productRoutes)

app.listen(process.env.PORT, () => {
    console.log(`server is running on port ${process.env.PORT}`);
})