const MenuItem = require("../model/menuItemsModal");

/**
 * CREATE ITEM
 */
exports.createItem = async (req, res) => {
  try {
    const { name, price } = req.body;

    if (!name || price === undefined) {
      return res.status(400).json({ message: "Name and price required" });
    }

    const item = await MenuItem.create({ name, price });
    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * UPDATE NAME & PRICE
 */
exports.updateItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price } = req.body;

    const item = await MenuItem.findByIdAndUpdate(
      id,
      { name, price },
      { new: true }
    );

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * DELETE ITEM
 */
exports.deleteItem = async (req, res) => {
  try {
    const { id } = req.params;

    const item = await MenuItem.findByIdAndDelete(id);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    res.json({ message: "Item deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * UPDATE ITEM STATUS
 */
exports.updateItemStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["AVAILABLE", "OUT_OF_STOCK"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const item = await MenuItem.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMenuItems = async (req, res) => {
  try {
    const items = await MenuItem.find().sort({ createdAt: 1 }); // bottom = newest

    res.status(200).json({items});
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch menu items",
      error: error.message,
    });
  }
};