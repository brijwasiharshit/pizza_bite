const express = require("express");
const router = express.Router();
const User = require("../models/User");
const orderItem = require("../models/Order");
const FoodItem = require("../models/FoodItem");
const Category = require("../models/Category");
const Table = require("../models/Table");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

require("dotenv").config();
//updated

router.get("/foodData", async (req, res) => {
  try {
    console.log("🔄 Fetching food data...");

    const foodItems = await FoodItem.find({ isAvailable: true });

    const foodCategories = await Category.find();

    if (foodItems.length === 0) {
      return res.status(404).json({ error: "No food items found" });
    }
    // if(isAvailable===true)

    res.status(200).json({
      foodItems,
      foodCategories,
    });
  
    console.log("✅ Food data fetched successfully!");
  } catch (error) {
    console.error("❌ Error fetching food data:", error);
    res.status(500).json({
      error: "Server error",
      ...(process.env.NODE_ENV === "development" && { details: error.message }),
    });
  }
});

router.get("/categories", async (req, res) => {
  try {
    const categories = await Category.find();

    if (!categories || categories.length === 0) {
      return res.status(404).json({ error: "No categories found" });
    }

    res.status(200).json({ success: true, categories });
  } catch (error) {
    console.error("❌ Error fetching categories:", error);
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

router.get("/fetchTables", async (req, res) => {
  try {
    const tables = await Table.find();

    if (!tables || tables.length === 0) {
      return res.status(404).json({ error: "No tables found" });
    }

    res.status(200).json({ success: true, tables });
  } catch (error) {
    console.error("❌ Error fetching tables:", error);
    res.status(500).json({ error: "Failed to fetch tables" });
  }
});

router.post("/placeOrder", async (req, res) => {
  try {
    console.log(req.body);
    const { itemId, quantity, portion, tableNo, status } = req.body;

    if (!itemId || !quantity || !tableNo || !status || !portion) {
      return res.status(400).json({
        error: "Missing required fields",
        details: {
          itemId: !itemId ? "Item ID is required" : undefined,
          quantity: !quantity ? "Quantity is required" : undefined,
          tableNo: !tableNo ? "Table number is required" : undefined,
          status: !status ? "Status is required" : undefined,
          portion: !portion ? "Portion is required" : undefined,
        },
      });
    }

    // ✅ Check if table exists
    const tableExists = await Table.findOne({ tableNo });
    if (!tableExists) {
      return res
        .status(404)
        .json({ error: `Table number ${tableNo} does not exist` });
    }

    // ✅ Check if food item exists
    const foodItem = await FoodItem.findById(itemId);
    if (!foodItem) {
      return res.status(404).json({ error: "Food item not found" });
    }

    // ✅ Validate portion
    const pricePerPortion = foodItem.options[portion];
    if (!pricePerPortion) {
      return res.status(400).json({ error: "Invalid portion selected" });
    }

    const totalPrice = pricePerPortion * quantity;

    const ordered_item = new orderItem({
      itemId,
      quantity,
      tableNo,
      status,
      portion,
      totalPrice,
    });

    await ordered_item.save();
    const io = req.app.get("io");
    io.emit("newOrder", {
      _id: ordered_item._id,
      itemId: ordered_item.itemId,
      tableNo: ordered_item.tableNo,
      portion: ordered_item.portion,
      quantity: ordered_item.quantity,
      totalPrice: ordered_item.totalPrice,
      createdAt: ordered_item.createdAt,
      status: ordered_item.status,
    });
    res.status(201).json({
      success: true,
      message: "Order placed and kitchen notified!",
      order: ordered_item,
    });
  } catch (err) {
    console.error("❌ Error placing order:", err);

    if (err.name === "ValidationError") {
      return res.status(400).json({
        error: "Validation error",
        details: Object.values(err.errors).map((e) => e.message),
      });
    }

    res.status(500).json({
      error: "Failed to place order",
      details: err.message,
    });
  }
});
router.get("/tableOrders/:tableId", async (req, res) => {
  try {
    const { tableId } = req.params;

    const orders = await orderItem
      .find({
        tableNo: tableId,
        status: "created",
      })
      .sort({ createdAt: 1 })
      .populate("itemId"); 

    const formattedOrders = orders.map((order) => ({
      _id: order._id,
      itemName: order.itemId.name, // populated name from FoodItem
      quantity: order.quantity,
      portion: order.portion,
      price: order.quantity*order.itemId.options[order.portion],
      createdAt: order.createdAt,
    }));
 
    res.json({ success: true, orders: formattedOrders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    console.log("body",req.body);
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Please enter all details" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { _id: user._id, role: user.role },
      process.env.TOKEN_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("token", token, {
      // httpOnly: true,
      // secure: process.env.NODE_ENV === "production",
      // sameSite: "None",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.cookie("role", user.role, {
      // httpOnly: true,  
      // secure: process.env.NODE_ENV === "production",
      // sameSite: "None",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.status(200).json({
      message: "Login successful",
      user: {
        _id: user._id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
