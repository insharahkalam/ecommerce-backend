import jwt from "jsonwebtoken";
import User from "../models/auth.model.js";

const adminCheck = async (req, res, next) => {
    try {
        const token = req.cookies.token

        if (!token) {
            return res.status(401).json({
                message: "Unauthorized! please login first admin."
            })
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRETS)

        if (decoded.role != "admin") {
            return res.status(403).json({
                message: "Access denied, only admin can access this..!"
            })
        }

        req.user = { id: decoded.id, role: decoded.role };

        next()

    } catch (error) {
        console.log(error, "error in auth middleware.");
        res.status(401).json({
            message: "Invalid Token"
        })
    }
}

export { adminCheck }