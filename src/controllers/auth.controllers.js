import userModel from "../models/auth.model.js"
import bcrypt from 'bcrypt'
import User from "../models/auth.model.js";
import jwt from "jsonwebtoken";

const cretaeUser = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({
                message: "All fields are required!",
            });
        }

        if (username.length < 4) {
            return res.status(400).json({
                message: "Username must be at least 4 characters.",
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                message: "Password must be at least 6 characters.",
            });
        }

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                message: "Email already exists!",
            });
        }

        const hashPass = await bcrypt.hash(password, 10);

        const user = await User.create({
            username,
            email,
            password: hashPass,
            role: "user",
        });

        res.status(201).json({
            message: "User created successfully!",
            user,
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};

const getUser = async (req, res) => {
    const allUsers = await User.find()
    res.json({
        message: "user fetched success!",
        allUsers
    })
}

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required!",
            });
        }

        const user = await User.findOne({ email });
        console.log(user, "user check==>")
        if (!user) {
            return res.status(404).json({
                message: "User not found!",
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        console.log(isMatch, "check match");

        if (!isMatch) {
            return res.status(400).json({
                message: "Invalid email or password!",
            });
        }

        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRETS)

        console.log("jwt ka dedcoded mil rha hai check ====>", token);

        res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            path: '/'
        });

        console.log(token, "jwt token");

        res.status(200).json({
            message: "Login successful!",
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
            },
            isAdmin: user.role === "admin",
            token
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};

const forgotPass = async (req, res) => {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
        return res.json({ message: "user not found" });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetToken = resetToken;
    user.resetTokenExpire = Date.now() + 15 * 60 * 1000;
    await user.save();

    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL,
            pass: process.env.APP_PASSWORD
        }
    });

    const resetLink = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    await transporter.sendMail({
        from: process.env.EMAIL,
        to: user.email,
        subject: "Reset Your NOIR Account Password",
        html: `
    <div style="font-family: 'Helvetica Neue', Arial, sans-serif; background:#000000; padding:40px 20px; color:#ffffff;">
        <div style="max-width:600px; margin:auto; background:#0a0a0a; padding:0; border-radius:4px; border:1px solid #1c1c1c; overflow:hidden;">

            <!-- Top accent bar -->
            <div style="height:3px; background:#dc2626; width:100%;"></div>

            <div style="padding:40px 35px;">
                <!-- Logo / Brand -->
                <div style="text-align:center; margin-bottom:8px;">
                    <span style="display:inline-block; width:24px; height:1px; background:#dc2626; vertical-align:middle; margin-right:10px;"></span>
                    <span style="font-size:11px; letter-spacing:6px; color:#dc2626; text-transform:uppercase; vertical-align:middle;">NOIR Store</span>
                    <span style="display:inline-block; width:24px; height:1px; background:#dc2626; vertical-align:middle; margin-left:10px;"></span>
                </div>

                <h1 style="text-align:center; color:#ffffff; font-size:24px; font-weight:900; letter-spacing:1px; text-transform:uppercase; margin:18px 0 6px;">
                    Password Reset
                </h1>
                <p style="text-align:center; color:#525252; font-size:13px; letter-spacing:0.5px; margin:0 0 30px;">
                    Secure account recovery request
                </p>

                <!-- Message -->
                <p style="color:#bfbfbf; font-size:14px; line-height:1.7; margin:0 0 14px;">
                    Hi ${user.username || "there"},
                </p>
                <p style="color:#bfbfbf; font-size:14px; line-height:1.7; margin:0 0 14px;">
                    We received a request to reset the password for your <strong style="color:#ffffff;">NOIR Store</strong> account. Click the button below to choose a new password.
                </p>
                <p style="color:#737373; font-size:13px; line-height:1.7; margin:0 0 30px;">
                    This link will expire in <strong style="color:#dc2626;">15 minutes</strong>. If you didn't request this, you can safely ignore this email — your password will remain unchanged.
                </p>

                <!-- Button -->
                <div style="text-align:center; margin:32px 0;">
                    <a href="${resetLink}"
                       style="
                       background:#dc2626;
                       color:#ffffff;
                       padding:14px 36px;
                       text-decoration:none;
                       border-radius:2px;
                       font-weight:700;
                       font-size:12px;
                       letter-spacing:3px;
                       text-transform:uppercase;
                       display:inline-block;
                       ">
                       Reset Password
                    </a>
                </div>

                <p style="text-align:center; font-size:12px; color:#4d4d4d; word-break:break-all; margin:0 0 30px;">
                    Or copy this link: <span style="color:#737373;">${resetLink}</span>
                </p>

                <!-- Security Note -->
                <div style="background:#0d0d0d; padding:16px 18px; border-radius:2px; border:1px solid #1c1c1c; border-left:3px solid #dc2626;">
                    <p style="font-size:12px; color:#8a8a8a; margin:0; line-height:1.6;">
                        For your security, never share this link with anyone. The NOIR team will never ask you for your password via email or any other channel.
                    </p>
                </div>

                <hr style="border:0; border-top:1px solid #1c1c1c; margin:32px 0 20px;" />

                <!-- Footer -->
                <p style="text-align:center; font-size:11px; letter-spacing:1px; color:#404040; margin:0;">
                    © ${new Date().getFullYear()} NOIR STORE. ALL RIGHTS RESERVED.
                </p>
            </div>
        </div>
    </div>
    `
    });

    res.json({
        message: "Reset link sent"
    });
};

const resetPassword = async (req, res) => {
    const { token, password } = req.body;

    try {
        const user = await User.findOne({
            resetToken: token,
            resetTokenExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                message: "Token invalid or expired"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        user.password = hashedPassword;

        user.resetToken = undefined;
        user.resetTokenExpire = undefined;

        await user.save();

        res.json({
            message: "Password reset successful"
        });

    } catch (error) {
        res.status(500).json({
            message: "Server error"
        });
    }
};

const logout = (req, res) => {
    try {
        res.clearCookie("token", {
            httpOnly: true,
            secure: true,
            path: '/'
        })

        res.status(200).json({
            status: true,
            message: "logout Success!"
        })
    } catch (error) {
        console.log(error, "logout Error");
        res.status(400).json({
            message: "error in logging out",
            status: false
        })
    }
}


export { cretaeUser, getUser, loginUser, forgotPass, resetPassword ,logout}