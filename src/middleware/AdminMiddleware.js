import jwt from "jsonwebtoken";
import User from "../models/auth.model.js";

const adminCheck = async (req, res, next) => {
    try {
        console.log(req.cookies.token, 'check token in middleware');

        const token = req.cookies.token
        console.log(token, "token mil rha hai.");

        if (!token) {
            return res.json({
                message: "Unautherized! please login first admin."
            })
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRETS)
        console.log(decoded.id, "id check ");
        console.log(decoded.role, "role check ");

        console.log(decoded, "decoded check");

        if (decoded.role != "admin") {
            return res.json({
                message: "Access denind , only admin can access this..!"
            })
        }
        next()

    } catch (error) {
        console.log(error, "error in auth middleware.");
        res.json({
            message: "Invalid Token"
        })
    }
}

export { adminCheck }