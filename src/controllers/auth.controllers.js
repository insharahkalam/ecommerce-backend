import userModel from "../models/auth.model.js"
import bcrypt from 'bcrypt'

const cretaeUser = async (req, res) => {
    const { username, email, password, role } = req.body
    console.log(username, email, password, role);

    if (!username || !email || !password) {
        return res.status(400).json({
            message: "All feild required!"
        })
    }

    if (username.length < 4) {
        return res.status(400).json({
            message: "username must have grater than 4 characters."
        })
    }

    if (password.length < 6) {
        return res.status(400).json({
            message: "password must have grater than 6 characters."
        })
    }

    const saltRounds = 10
    const hashPass = await bcrypt.hash(password, saltRounds)
    const users = await userModel.create({
        username, email, password: hashPass, role: req.body.role
    })
    res.status(201).json({
        message: "user created!",
        users
    })
}

const loginUser = (req, res) => {

}


export { cretaeUser, loginUser }