
const Order = require("../model/orderModal");

// Create new order
const createOrder = async (req, res) => {
  try {
    const io = req.app.get("io");
    const { tableNumber, items, customerMessage } = req.body;

    // Validate input
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

    // Calculate total automatically if not sent
    const total = items.reduce(
      (sum, i) => sum + i.price * i.quantity * (i.quantityType === "Half Plate" ? 0.5 : 1),
      0
    );

    // Create order
    const order = await Order.create({
      tableNumber,
      items,
      total,
      customerMessage: customerMessage || "",
    });

    // Emit to all connected clients
    io.emit("newOrder", order);
    io.emit("notifications", `Order arrived from Table Number ${tableNumber}`);

    res.status(201).json({ message: "Order placed successfully", order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
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
    const { orderId } = req.params;
    const { status } = req.body;

    // validate status
    const allowedStatus = ["pending", "completed", "paid","cancelled"];
    if (!allowedStatus.includes(status)) {
      return res.status(400).json({
        message: "Invalid status value",
      });
    }

    const order = await Order.findByIdAndUpdate(
      orderId,
      { status },
      { new: true } // return updated doc
    );


    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    if(order.status ==='cancelled'){
      io.emit("orderCancelled",`${order.tableNumber} TableNumber order is cancelled right now!`)
    }else if(order.status === 'paid'){
      io.emit("orderPaid",`${order.tableNumber} TableNumber order is  paid!`)
    }else{
io.emit("orderReady",`${order.tableNumber} TableNumber order is ready!`)
    }

    res.status(200).json({
      message: "Order status updated successfully",
      order,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};





module.exports = { createOrder, getOrders,updateOrderStatus };
