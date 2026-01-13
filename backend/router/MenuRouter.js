const express = require("express");
const menuRouter = express.Router();
const controller = require("../controller/menuController");

menuRouter.post("/createMenu", controller.createItem);
menuRouter.get("/getMenu", controller.getMenuItems);
menuRouter.put("/updateMenu/:id", controller.updateItem);
menuRouter.delete("/deleteMenu/:id", controller.deleteItem);
menuRouter.patch("/updateItem/:id/status", controller.updateItemStatus);

module.exports = menuRouter;
