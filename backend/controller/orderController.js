
const Order = require("../model/orderModal");
const userModel = require("../model/userModel");
const {sendNotification}= require("../utils/sendNotification");

// Create new order
const createOrder = async (req, res) => {
  try {
    const io = req.app.get("io");
    const onlineUsers = req.app.get("onlineUsers");

    const { tableNumber, items, customerMessage } = req.body;

    // 1️⃣ Validate input
    if (
      !tableNumber ||
      !items ||
      !Array.isArray(items) ||
      items.length === 0 ||
      !items.every(
        (i) => i.name && i.price && i.quantityType && i.quantity
      )
    ) {
      return res.status(400).json({ message: "Incomplete order data" });
    }

    // 2️⃣ Calculate total
    const total = items.reduce(
      (sum, i) =>
        sum +
        i.price *
          i.quantity *
          (i.quantityType === "Half Plate" ? 0.5 : 1),
      0
    );

    // 3️⃣ Create order
    const order = await Order.create({
      tableNumber,
      items,
      total,
      customerMessage: customerMessage || "",
    });

    // 4️⃣ Fetch users in parallel
    const [chefsAndAccountants, waiters] = await Promise.all([
      userModel.find({ role: { $in: ["Chef", "Accountant"] } }),
      userModel.find({ role: "Waiter" }),
    ]);

    const notifySocketIds = [];
    const notifyOfflineUserIds = [];
    const waiterSocketIds = [];

    // 5️⃣ Separate online / offline
    chefsAndAccountants.forEach((user) => {
      const uid = user._id.toString();
      if (onlineUsers.has(uid)) {
        notifySocketIds.push(onlineUsers.get(uid));
      } else {
        notifyOfflineUserIds.push(uid);
      }
    });

    waiters.forEach((user) => {
      const uid = user._id.toString();
      if (onlineUsers.has(uid)) {
        waiterSocketIds.push(onlineUsers.get(uid));
      }
    });

    // 6️⃣ Emit to WAITERS (silent)
    waiterSocketIds.forEach((socketId) => {
      io.to(socketId).emit("newOrder", order);
    });

    // 7️⃣ Emit to CHEF & ACCOUNTANT (with notification)
    notifySocketIds.forEach((socketId) => {
      io.to(socketId).emit("newOrder", order);
      io.to(socketId).emit(
        "notifications",
        `Order arrived from Table ${tableNumber}`
      );
    });

    // 8️⃣ Push notification (ONLY Chef & Accountant)
    if (notifyOfflineUserIds.length > 0) {
      await sendNotification(
        notifyOfflineUserIds,{
        title: "New Order",
        body: `Order arrived from Table ${tableNumber}`,
        data: {
          orderId: order._id.toString(),
          type: "order",
        }}
      
    );
    }

    res.status(201).json({
      message: "Order placed successfully",
      order,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
};


// Get all orders
const getOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.status(200).json({orders});
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const io = req.app.get("io");
    const onlineUsers = req.app.get("onlineUsers");

    const { orderId } = req.params;
    const { status } = req.body;

    const allowedStatus = ["pending", "completed", "paid", "cancelled"];
    if (!allowedStatus.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const order = await Order.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const msg =
      status === "completed"
        ? `${order.tableNumber} Table order is ready!`
        : status === "cancelled"
        ? `${order.tableNumber} Table order is cancelled!`
        : status === "paid"
        ? `${order.tableNumber} Table order is paid!`
        : "";

    // Fetch users
    const [waiters, accountants, chefs] = await Promise.all([
      userModel.find({ role: "Waiter" }),
      userModel.find({ role: "Accountant" }),
      userModel.find({ role: "Chef" }),
    ]);

    /* =========================
       ORDER READY (completed)
       ========================= */
    if (status === "completed") {
      const offlineWaiters = [];

      waiters.forEach((u) => {
        const uid = u._id.toString();
        if (onlineUsers.has(uid)) {
          io.to(onlineUsers.get(uid)).emit("orderReady", msg);
        } else {
          offlineWaiters.push(uid);
        }
      });

      if (offlineWaiters.length) {
        await sendNotification(
          offlineWaiters,{
          title: "Order Ready",
          body: msg,
          data: { orderId: order._id.toString(), status },
        });
      }

      // Chef socket
      chefs.forEach((u) => {
        const uid = u._id.toString();
        if (onlineUsers.has(uid)) {
          io.to(onlineUsers.get(uid)).emit("orderReady", msg);
        }
      });
    }

    /* =========================
       ORDER CANCELLED
       ========================= */
    if (status === "cancelled") {
      const offlineUsers = [];

      [...waiters, ...accountants].forEach((u) => {
        const uid = u._id.toString();
        if (onlineUsers.has(uid)) {
          io.to(onlineUsers.get(uid)).emit("orderCancelled", msg);
        } else {
          offlineUsers.push(uid);
        }
      });

      if (offlineUsers.length) {
        await sendNotification(offlineUsers,{
          title: "Order Cancelled",
          body: msg,
          data: { orderId: order._id.toString(), status },
        });
      }

      // Chef socket
      chefs.forEach((u) => {
        const uid = u._id.toString();
        if (onlineUsers.has(uid)) {
          io.to(onlineUsers.get(uid)).emit("orderCancelled", msg);
        }
      });
    }

    /* =========================
       ORDER PAID
       ========================= */
    if (status === "paid") {
      io.emit("orderPaid", msg); // Chef, Waiter, Accountant sabai
    }

    res.status(200).json({
      message: "Order status updated successfully",
      order,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};







module.exports = { createOrder, getOrders,updateOrderStatus };
