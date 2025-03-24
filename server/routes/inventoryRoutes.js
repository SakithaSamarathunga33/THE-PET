const express = require("express");
const router = express.Router();
const inventoryController = require("../controllers/inventoryController");

router.post("/", inventoryController.addItem);
router.get("/", inventoryController.getItems);
router.get("/:id", inventoryController.getItemById);
router.put("/:id", inventoryController.updateItem);
router.delete("/:id", inventoryController.deleteItem);
router.post("/:id/restock", inventoryController.restockItem);

//Export the router
module.exports = router;