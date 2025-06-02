const express = require('express');
const kitchenRouter = express.Router();
const kitchenAuth = require('../middleware/kitchen');
const OrderItem = require("../models/Order");
const Table = require("../models/Table");
const FoodItem = require('../models/FoodItem');
const Category = require('../models/Category');

// kitchenRouter.use=kitchenAuth()
kitchenRouter.get("/allOrders", async (req, res) => {
    try {

      const tables = await Table.find().lean();

      const orders = await OrderItem.find({ status: "created" })
        .populate('itemId', 'name options')
        .lean();
 
      const tableWiseOrders = {};
      
      tables.forEach(table => {
        tableWiseOrders[table.tableNo] = orders.filter(
          order => order.tableNo === table.tableNo
        ).map(order => ({
          _id: order._id,
          itemName: order.itemId.name,
          quantity: order.quantity,
          portion: order.portion,
          price: order.itemId.options[order.portion] * order.quantity,
          createdAt: order.createdAt,
          status: order.status
        }));
      });
  
      res.status(200).json({
        success: true,
        data: tableWiseOrders
      });
    } catch (err) {
      console.error("Error fetching kitchen orders:", err);
      res.status(500).json({
        success: false,
        error: "Failed to fetch orders",
        details: err.message
      });
    }
  });
kitchenRouter.post("/cancelOrder/:tableId/:orderId", async (req, res) => {
  const { tableId, orderId } = req.params;

  try {
    const result = await OrderItem.deleteOne({
      _id: orderId,
      tableNo: tableId,
      status: "created", 
    });
    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Order not found or cannot be deleted",
      });
    }
    res.status(200).json({
      success: true,
      message: "Order successfully deleted",
    });
  } catch (err) {
    console.error("Error deleting order:", err);
    res.status(500).json({
      success: false,
      message: "Failed to delete order",
      details: err.message,
    });
  }
});

kitchenRouter.post("/sendBill",(req,res) => {
    // const {number} = req.body;
    //sends the bill by twilio to the number
})
kitchenRouter.post("/clearTable/:tableId", async (req, res) => {
  const { tableId } = req.params; 
  // this is for check payment method
  const{payment}=req.body
  // console.log(payment)
console.log("clear table called!");
  try {
    
      const orders = await OrderItem.updateMany(
          { tableNo: tableId, status: { $ne: "delivered" } }, 
          { status: "delivered" ,method:payment} ,  
      );

      // Check if any orders were updated
      if (orders.modifiedCount === 0) {
          return res.status(404).json({
              success: false,
              message: "No orders found for this table or all orders are already delivered"
          });
      }

      res.status(200).json({
          success: true,
          message: `All orders for table ${tableId} have been marked as delivered`
      });
  } catch (err) {
      console.error("Error clearing table:", err);
      res.status(500).json({
          success: false,
          error: "Failed to clear table",
          details: err.message
      });
  }
});
kitchenRouter.get('/tableOrders/:tableId', async (req, res) => {
  try {
    console.log("called!");
    const { tableId } = req.params;

    const orders = await OrderItem.find({
      tableNo: tableId,
      status: "created",
    }).sort({ createdAt: 1 }); 

    res.json({ success: true, orders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});


// updating food item
kitchenRouter.put('/updateavailability/:id' , async (req, res) => {
  try {
    const {id} = req.params;
    const updated = await FoodItem.findByIdAndUpdate(id,
      { isAvailable: req.body.isAvailable },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update availability' });
  }
});
// DELETE food item by ID
kitchenRouter.delete("/deletefooditem/:id", async (req, res) => {
  try {
    const deletedItem = await FoodItem.findByIdAndDelete(req.params.id);

    if (!deletedItem) {
      return res.status(404).json({
        success: false,
        message: "Food item not found",
      });
    }

    res.json({
      success: true,
      message: "Food item deleted successfully",
      deletedItem,
    });
  } catch (err) {
    console.error("Error deleting food item:", err);

    // Handle invalid ID format
    if (err.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid food item ID format",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to delete food item",
      error: err.message,
    });
  }
});


kitchenRouter.post("/addfooditem", async (req, res) => {
  try {
    console.log("api called!");
    const { name, description, options, category, imageUrl } = req.body;
    console.log(name);
    console.log(description);
    console.log(options);
    console.log(category);
    console.log(imageUrl);
    // Validate required fields
    if (!name || !options || !category) {
      return res.status(400).json({
        success: false,
        message: "Name, options, and category are required fields",
      });
    }

    // Validate options is an object with at least one key-value pair
    if (typeof options !== "object" || Object.keys(options).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Options must be an object with at least one price option",
      });
    }

    // Create new food item
    const newItem = new FoodItem({
      name,
      description: description || "",
      options,
      category,
      imageUrl: imageUrl || "",
      isAvailable: true,
    });

    await newItem.save();

    res.status(201).json({
      success: true,
      message: "Food item added successfully!",
      foodItem: newItem,
    });
  } catch (error) {
    console.error("Error adding food item:", error);

    // Handle duplicate name error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Food item with this name already exists",
      });
    }

    // Handle validation errors
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((e) => ({
        field: e.path,
        message: e.message,
      }));
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors,
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to add food item",
      error: error.message,
    });
  }
});

kitchenRouter.post("/addCategory", async (req, res) => {
  try {
    const { name, description } = req.body;
    const category = new Category({ name, description });
    category.save();
    res.send("Category added successfully!");
  } catch (err) {
    console.log(err);
  }
});



module.exports = kitchenRouter;