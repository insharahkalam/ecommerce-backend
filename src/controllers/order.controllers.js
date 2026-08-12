import orders from '../models/order.model.js'
import User from "../models/auth.model.js";
import pusher from "../services/pusher.service.js";
import products from "../models/product.model.js"; // apna actual product model path daal dena
import { createNotification } from "../utils/createNotification.js";

// Customer places an order (COD or Bank Transfer)

const createOrder = async (req, res) => {
    try {
        const userId = req.user?.id || req.body.userId;

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

        if (paymentMethod === "Bank Transfer" || paymentMethod === "Easypaisa") {
            if (!transferDetails || !transferDetails.transactionId) {
                return res.status(400).json({ message: "Transaction ID is required." });
            }
            if (!transferDetails.receiptImage) {
                return res.status(400).json({ message: "Payment receipt is required." });
            }
        }

        // ---- STEP 1: Stock check + atomic decrement ----
        // Har item ke liye stock kam karte hain, sirf tab jab stock >= quantity ho.
        // Agar kisi bhi product ka stock kam pada to poora order fail hoga aur
        // jo items decrement ho chuke the unko rollback (revert) kar dete hain.
        const decrementedItems = [];

        console.log("Items received:", JSON.stringify(items, null, 2)); // ADD THIS

        for (const item of items) {
            const productId = item.product; // ⚠️ apne items structure ke hisaab se field name confirm kar lena
            const quantity = Number(item.quantity) || 0;

            console.log("🔍 Looking for productId:", productId, "type:", typeof productId, "qty:", quantity); // ADD THIS

            if (!productId || quantity <= 0) {
                // rollback jo ho chuka
                await rollbackStock(decrementedItems);
                return res.status(400).json({ message: "Invalid item in order." });
            }

            const updatedProduct = await products.findOneAndUpdate(
                { _id: productId, stock: { $gte: quantity } }, // condition: kaafi stock ho
                { $inc: { stock: -quantity, sold: quantity } },
                { new: true }
            );
            console.log("✅ Update result:", updatedProduct);
            if (!updatedProduct) {
                // stock kam tha ya product nahi mila — rollback jo pehle decrement ho chuka
                await rollbackStock(decrementedItems);
                return res.status(400).json({
                    message: `Insufficient stock for one of the products (ID: ${productId}).`,
                });
            }

            decrementedItems.push({ productId, quantity });
            if (updatedProduct.stock <= 5) { // apna threshold adjust kar lena
                await createNotification({
                    type: "low_stock",
                    title: "Low Stock Alert",
                    message: `${updatedProduct.name} has only ${updatedProduct.stock} units left`,
                    link: `/add-product/${updatedProduct._id}`,
                    relatedId: updatedProduct._id,
                });
            }
        }

        // ---- STEP 2: Order create ----
        const order = await orders.create({
            user: userId,
            items,
            totalAmount,
            paymentMethod,
            shippingAddress,
            paymentStatus: paymentMethod === "COD" ? undefined : "Pending",
            transferDetails: paymentMethod !== "COD" ? transferDetails : undefined,
        });

        await createNotification({
            type: "order",
            title: "New Order Received",
            message: `New order placed — Rs. ${totalAmount} (${paymentMethod})`,
            link: `/orders/${order._id}`,
            relatedId: order._id,
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

// Helper — agar order beech mein fail ho jaye to jo stock decrement ho chuka use wapas add karo
async function rollbackStock(decrementedItems) {
    for (const { productId, quantity } of decrementedItems) {
        await products.findByIdAndUpdate(productId, {
            $inc: { stock: quantity, sold: -quantity },
        });
    }
}


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

        const order = await orders.find({ user: userId }).sort({ createdAt: -1 });

        return res.status(200).json({
            message: "Your orders fetched successfully!",
            order
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

// const updateOrderStatus = async (req, res) => {
//     console.log("🔵 updateOrderStatus called with:", req.params, req.body);
//     try {
//         const { id } = req.params;
//         console.log(id, "check id testing");

//         const { status, paymentStatus } = req.body;

//         const order = await orders.findById(id);

//         console.log("Order user:", order);

//         if (!order) {
//             return res.status(404).json({ message: "Order not found." });
//         }

//         if (status && ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"].includes(status)) {
//             order.status = status;
//         }

//         if (paymentStatus && ["Pending", "Paid", "Failed"].includes(paymentStatus)) {
//             order.paymentStatus = paymentStatus;
//         }

//         await order.save();

//         // Real-time push — user ke channel pe event bhejo
//         try {
//             console.log("Triggering pusher on channel:", `user-${order.user}`);
//             await pusher.trigger(`user-${order.user}`, "order-updated", {
//                 orderId: order._id.toString(),
//                 status: order.status,
//                 paymentStatus: order.paymentStatus,
//             });
//             console.log("Pusher trigger sent successfully");
//             await pusher.trigger("admin-orders", "order-updated", {
//                 orderId: order._id.toString(),
//                 status: order.status,
//                 paymentStatus: order.paymentStatus,
//             });
//         } catch (pushErr) {
//             console.log(pushErr, "pusher trigger failed");
//         }

//         return res.status(200).json({ message: "Order updated successfully!", order });
//     } catch (error) {
//         console.log(error, "error updating order");
//         return res.status(500).json({ message: "Server error while updating order." });
//     }
// };

const updateOrderStatus = async (req, res) => {
    console.log("🔵 updateOrderStatus called with:", req.params, req.body);
    try {
        const { id } = req.params;
        const { status, paymentStatus } = req.body;

        const order = await orders.findById(id);

        if (!order) {
            return res.status(404).json({ message: "Order not found." });
        }

        const wasAlreadyCancelled = order.status === "Cancelled";

        if (status && ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"].includes(status)) {
            order.status = status;
        }

        if (paymentStatus && ["Pending", "Paid", "Failed"].includes(paymentStatus)) {
            order.paymentStatus = paymentStatus;
        }

        // ---- Agar order NAYA Cancel ho raha hai (pehle cancelled nahi tha) ----
        // to stock wapas add karo aur sold count wapas kam karo.
        if (status === "Cancelled" && !wasAlreadyCancelled) {
            await restoreStock(order.items);
        }

        await order.save();

        // Real-time push — user ke channel pe event bhejo
        try {
            await pusher.trigger(`user-${order.user}`, "order-updated", {
                orderId: order._id.toString(),
                status: order.status,
                paymentStatus: order.paymentStatus,
            });
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

// Helper — order cancel hone par stock wapas add + sold wapas kam
async function restoreStock(items) {
    for (const item of items) {
        const productId = item.product; // ⚠️ same field-name assumption jo createOrder mein hai
        const quantity = Number(item.quantity) || 0;

        if (!productId || quantity <= 0) continue;

        await Product.findByIdAndUpdate(productId, {
            $inc: { stock: quantity, sold: -quantity },
        });
    }
}


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