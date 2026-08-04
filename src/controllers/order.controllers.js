import orders from '../models/order.model.js'
import User from "../models/auth.model.js";
import pusher from "../services/pusher.service.js";

// Customer places an order (COD or Bank Transfer)
const createOrder = async (req, res) => {
    try {
        const userId = req.user?.id || req.body.userId; // depends on how your isAuth middleware attaches user

        const { items, totalAmount, paymentMethod, shippingAddress, transferDetails } = req.body;

        if (!userId) {
            return res.status(401).json({ message: "Please login to place an order." });
        }

        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: "Order must contain at least one item." });
        }

        if (!totalAmount) {
            return res.status(400).json({ message: "Total amount is required." });
        }

        if (!paymentMethod || !["COD", "Bank Transfer", "Easypaisa"].includes(paymentMethod)) {
            return res.status(400).json({ message: "Valid payment method is required (COD, Bank Transfer or Easypaisa)." });
        }

        if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.phone || !shippingAddress.address || !shippingAddress.city) {
            return res.status(400).json({ message: "Complete shipping address is required." });
        }

        // Bank Transfer & Easypaisa dono ke liye transaction ID + receipt zaroori hai
        if (paymentMethod === "Bank Transfer" || paymentMethod === "Easypaisa") {
            if (!transferDetails || !transferDetails.transactionId) {
                return res.status(400).json({ message: "Transaction ID is required." });
            }
            if (!transferDetails.receiptImage) {
                return res.status(400).json({ message: "Payment receipt is required." });
            }
        }

        const order = await orders.create({
            user: userId,
            items,
            totalAmount,
            paymentMethod,
            shippingAddress,
            paymentStatus: paymentMethod === "COD" ? undefined : "Pending",
            transferDetails: paymentMethod !== "COD" ? transferDetails : undefined,
        });

        return res.status(201).json({
            message:
                paymentMethod === "Bank Transfer"
                    ? "Order placed! We'll verify your payment and update the status shortly."
                    : "Order placed successfully!",
            order,
        });

    } catch (error) {
        console.log(error, "error creating order");
        return res.status(500).json({ message: "Server error while creating order." });
    }
};

// Admin — fetch every order
const getAllOrders = async (req, res) => {
    try {
        const order = await orders.find()
            .populate("user", "username email")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            message: "Orders fetched successfully!",
            order
        });
    } catch (error) {
        console.log(error, "error fetching orders");
        return res.status(500).json({ message: "Server error while fetching orders." });
    }
};

// Logged-in user — fetch only their own orders
const getMyOrders = async (req, res) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ message: "Please login first." });
        }

        const orders = await orders.find({ user: userId }).sort({ createdAt: -1 });

        return res.status(200).json({
            message: "Your orders fetched successfully!",
            orders
        });
    } catch (error) {
        console.log(error, "error fetching user orders");
        return res.status(500).json({ message: "Server error while fetching your orders." });
    }
};

const getOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const order = await orders.findById(id).populate("user", "username email");

        if (!order) {
            return res.status(404).json({ message: "Order not found." });
        }

        return res.status(200).json({ message: "Order fetched successfully!", order });
    } catch (error) {
        return res.status(500).json({ message: "Server error while fetching order." });
    }
};

const updateOrderStatus = async (req, res) => {
    console.log("🔵 updateOrderStatus called with:", req.params, req.body);
    try {
        const { id } = req.params;
        console.log(id, "check id testing");

        const { status, paymentStatus } = req.body;

        const order = await orders.findById(id);

        console.log("Order user:", order);

        if (!order) {
            return res.status(404).json({ message: "Order not found." });
        }

        if (status && ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"].includes(status)) {
            order.status = status;
        }

        if (paymentStatus && ["Pending", "Paid", "Failed"].includes(paymentStatus)) {
            order.paymentStatus = paymentStatus;
        }

        await order.save();

        // Real-time push — user ke channel pe event bhejo
        try {
            console.log("Triggering pusher on channel:", `user-${order.user}`);
            await pusher.trigger(`user-${order.user}`, "order-updated", {
                orderId: order._id.toString(),
                status: order.status,
                paymentStatus: order.paymentStatus,
            });
            console.log("Pusher trigger sent successfully");
            await pusher.trigger("admin-orders", "order-updated", {
                orderId: order._id.toString(),
                status: order.status,
                paymentStatus: order.paymentStatus,
            });
        } catch (pushErr) {
            console.log(pushErr, "pusher trigger failed");
        }

        return res.status(200).json({ message: "Order updated successfully!", order });
    } catch (error) {
        console.log(error, "error updating order");
        return res.status(500).json({ message: "Server error while updating order." });
    }
};

const deleteOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await orders.findByIdAndDelete(id);

        if (!deleted) {
            return res.status(404).json({ message: "Order not found." });
        }

        return res.status(200).json({ message: "Order deleted successfully!" });
    } catch (error) {
        return res.status(500).json({ message: "Server error while deleting order." });
    }
};

export { createOrder, getAllOrders, getMyOrders, getOrder, updateOrderStatus, deleteOrder };