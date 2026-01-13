const express = require("express");
const orderRouter = express.Router();
const { createOrder, getOrders, updateOrderStatus } = require("../controller/orderController");
const verifyToken = require("../middleware/authMiddleware");

// POST /api/orders -> create order
orderRouter.post("/createOrder",verifyToken,createOrder);

// GET /api/orders -> get all orders
orderRouter.get("/getOrder",getOrders);
orderRouter.put("/orderupdate/:orderId",verifyToken,updateOrderStatus)

module.exports = orderRouter;
