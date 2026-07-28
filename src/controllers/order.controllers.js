import Order from "../models/order.model.js";
import User from "../models/auth.model.js";

// Customer places an order (COD or Bank Transfer)
const createOrder = async (req, res) => {
    try {
        const userId = req.user?.id || req.body.userId; // depends on how your isAuth middleware attaches user

        const { items, totalAmount, paymentMethod, shippingAddress, bankTransferDetails } = req.body;

        if (!userId) {
            return res.status(401).json({ message: "Please login to place an order." });
        }

        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: "Order must contain at least one item." });
        }

        if (!totalAmount) {
            return res.status(400).json({ message: "Total amount is required." });
        }

        if (!paymentMethod || !["COD", "Bank Transfer"].includes(paymentMethod)) {
            return res.status(400).json({ message: "Valid payment method is required (COD or Bank Transfer)." });
        }

        if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.phone || !shippingAddress.address || !shippingAddress.city) {
            return res.status(400).json({ message: "Complete shipping address is required." });
        }

        // Bank Transfer ke liye transaction ID aur receipt image dono zaroori hain (verification ke liye)
        if (paymentMethod === "Bank Transfer") {
            if (!bankTransferDetails || !bankTransferDetails.transactionId) {
                return res.status(400).json({ message: "Transaction ID is required for bank transfer orders." });
            }
            if (!bankTransferDetails.receiptImage) {
                return res.status(400).json({ message: "Payment receipt is required for bank transfer orders." });
            }
        }

        const order = await Order.create({
            user: userId,
            items,
            totalAmount,
            paymentMethod,
            shippingAddress,
            // Bank transfer orders admin verify hone tak "Pending" rehte hain
            paymentStatus: paymentMethod === "Bank Transfer" ? "Pending" : undefined,
            bankTransferDetails: paymentMethod === "Bank Transfer" ? bankTransferDetails : undefined,
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
        const orders = await Order.find()
            .populate("user", "username email")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            message: "Orders fetched successfully!",
            orders
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

        const orders = await Order.find({ user: userId }).sort({ createdAt: -1 });

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
        const order = await Order.findById(id).populate("user", "username email");

        if (!order) {
            return res.status(404).json({ message: "Order not found." });
        }

        return res.status(200).json({ message: "Order fetched successfully!", order });
    } catch (error) {
        return res.status(500).json({ message: "Server error while fetching order." });
    }
};

// Admin — update order status (Pending / Fulfilled / Refunded) and/or payment status
// Yahi endpoint admin bank transfer receipt dekh kar order ko "Paid" verify karega
const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, paymentStatus } = req.body;

        const order = await Order.findById(id);

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

        return res.status(200).json({ message: "Order updated successfully!", order });
    } catch (error) {
        console.log(error, "error updating order");
        return res.status(500).json({ message: "Server error while updating order." });
    }
};

const deleteOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Order.findByIdAndDelete(id);

        if (!deleted) {
            return res.status(404).json({ message: "Order not found." });
        }

        return res.status(200).json({ message: "Order deleted successfully!" });
    } catch (error) {
        return res.status(500).json({ message: "Server error while deleting order." });
    }
};

export { createOrder, getAllOrders, getMyOrders, getOrder, updateOrderStatus, deleteOrder };