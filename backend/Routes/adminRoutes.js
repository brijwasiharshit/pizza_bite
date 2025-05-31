const express = require("express");
const Order = require("../models/Order");
const FoodItem = require("../models/FoodItem");
const Category = require("../models/Category");
const adminAuth = require("../middleware/admin");

const adminRouter = express.Router();
adminRouter.use(adminAuth);
// Get sales analytics

const getTodayStart = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};

// Utility to calculate 7 days ago
const getSevenDaysAgo = () => {
  const date = new Date();
  date.setDate(date.getDate() - 7);
  date.setHours(0, 0, 0, 0);
  return date;
};

adminRouter.get("/salesToday", async (req, res) => {

  try {
    const todayStart = getTodayStart();
    const orders = await Order.find({
      status: "delivered",
      createdAt: { $gte: todayStart },
    }).lean();

    let totalSales = 0;

    for (const order of orders) {
      const foodItem = await FoodItem.findById(order.itemId).lean();
      if (foodItem && foodItem.options[order.portion]) {
        totalSales += foodItem.options[order.portion] * order.quantity;
      }
    }

    res.json({ success: true, totalSalesToday: totalSales });
  } catch (err) {
    console.error("Error in salesToday:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});
adminRouter.get("/weeklySales", async (req, res) => {
  try {
    const last7Days = getSevenDaysAgo();
    const orders = await Order.find({
      status: "delivered",
      createdAt: { $gte: last7Days },
    }).lean();

    let totalSales = 0;

    for (const order of orders) {
      const foodItem = await FoodItem.findById(order.itemId).lean();
      if (foodItem && foodItem.options[order.portion]) {
        totalSales += foodItem.options[order.portion] * order.quantity;
      }
    }

    res.json({ success: true, totalSalesWeekly: totalSales });
  } catch (err) {
    console.error("Error in weeklySales:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// this is for cash payment
adminRouter.get("/monthlySales", async (req, res) => {
  try {
    // 1. Get the first day of the current month
    const today = new Date(); // ✅ Fixed: "date" → "Date" (JavaScript is case-sensitive)
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // 2. Fetch all delivered orders this month
    const orders = await Order.find({
      // ✅ Added `await` (missing in original)
      status: "delivered",
      method:"cash",
      createdAt: { $gte: firstDayOfMonth },
    }).lean(); // ✅ Fixed: `.lean` → `.lean()` (it's a function call)

    // 3. Extract unique food item IDs from orders
    const itemIds = [
      ...new Set(orders.map((order) => order.itemId.toString())),
    ];

    // 4. Fetch all food items from the database
    const foodItems = await FoodItem.find({ _id: { $in: itemIds } }).lean();

    // 5. Create a lookup map for food items (for fast access)
    const foodMap = {};
    for (const item of foodItems) {
      foodMap[item._id.toString()] = item;
    }

    // 6. Calculate total sales
    let totalSales = 0;
    for (const order of orders) {
      const foodItem = foodMap[order.itemId.toString()];
      if (foodItem) {
        const price = foodItem.options[order.portion]; // Get price based on portion (e.g., "large")
        totalSales += price * order.quantity; // Add to total
      }
    }

    // 7. Send the result
    res.json({ success: true, totalSalesMonthly: totalSales });
  } catch (error) {
    // 8. Error handling (improved from original)
    console.error("Monthly sales error:", error); // Log the error
    res.status(500).json({ success: false, error: "Server error" }); // Send proper error response
  }
});
//this is for online payment
adminRouter.get("/monthlySalesOnline", async (req, res) => {
  try {
    // 1. Get the first day of the current month
    const today = new Date(); // ✅ Fixed: "date" → "Date" (JavaScript is case-sensitive)
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // 2. Fetch all delivered orders this month
    const orders = await Order.find({
      // ✅ Added `await` (missing in original)
      status: "delivered",
      method:"online",
      createdAt: { $gte: firstDayOfMonth },
    }).lean(); // ✅ Fixed: `.lean` → `.lean()` (it's a function call)

    // 3. Extract unique food item IDs from orders
    const itemIds = [
      ...new Set(orders.map((order) => order.itemId.toString())),
    ];

    // 4. Fetch all food items from the database
    const foodItems = await FoodItem.find({ _id: { $in: itemIds } }).lean();

    // 5. Create a lookup map for food items (for fast access)
    const foodMap = {};
    for (const item of foodItems) {
      foodMap[item._id.toString()] = item;
    }

    // 6. Calculate total sales
    let totalSalesOnline = 0;
    for (const order of orders) {
      const foodItem = foodMap[order.itemId.toString()];
      if (foodItem) {
        const price = foodItem.options[order.portion]; // Get price based on portion (e.g., "large")
        totalSalesOnline += price * order.quantity; // Add to total
      }
    }

    // 7. Send the result
    res.json({ success: true, totalSalesMonthlyonline: totalSalesOnline });
  } catch (error) {
    // 8. Error handling (improved from original)
    console.error("Monthly sales error:", error); // Log the error
    res.status(500).json({ success: false, error: "Server error" }); // Send proper error response
  }
});

// TOTAL ORDERS
adminRouter.get("/totalOrders", async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments({ status: "delivered" });

    res.json({ success: true, totalOrders });
  } catch (err) {
    console.error("Error in totalOrders:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// AVERAGE ORDER VALUE
adminRouter.get("/avgOrderValue", async (req, res) => {
  try {
    const orders = await Order.find({
      status: "delivered",
    }).lean();

    const tableWiseTotals = {}; // { tableNo: totalPrice }

    for (const order of orders) {
      const foodItem = await FoodItem.findById(order.itemId).lean();
      if (foodItem && foodItem.options[order.portion]) {
        const price = foodItem.options[order.portion] * order.quantity;
        if (tableWiseTotals[order.tableNo]) {
          tableWiseTotals[order.tableNo] += price;
        } else {
          tableWiseTotals[order.tableNo] = price;
        }
      }
    }

    const totalRevenue = Object.values(tableWiseTotals).reduce(
      (a, b) => a + b,
      0
    );
    const numberOfTables = Object.keys(tableWiseTotals).length;
    const avgOrderValue =
      numberOfTables > 0 ? totalRevenue / numberOfTables : 0;

    res.json({ success: true, avgOrderValue });
  } catch (err) {
    console.error("Error in avgOrderValue:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});
adminRouter.get("/oneWeekComparison", async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const salesData = [];

    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date(today);
      dayStart.setDate(today.getDate() - i);

      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);

      const orders = await Order.find({
        status: "delivered",
        createdAt: { $gte: dayStart, $lt: dayEnd },
      }).lean();

      let dailyTotal = 0;

      for (const order of orders) {
        const foodItem = await FoodItem.findById(order.itemId).lean();
        if (foodItem && foodItem.options[order.portion]) {
          dailyTotal += foodItem.options[order.portion] * order.quantity;
        }
      }

      salesData.push({
        date: dayStart.toISOString().split("T")[0], // Format: YYYY-MM-DD
        totalSales: dailyTotal,
      });
    }

    res.json({ success: true, salesLast7Days: salesData });
  } catch (err) {
    console.error("Error in oneWeekComparison:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});


// updating food item
adminRouter.put('/updateavailability/:id' , async (req, res) => {
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
adminRouter.delete("/deletefooditem/:id", async (req, res) => {
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


adminRouter.post("/addfooditem", async (req, res) => {
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

adminRouter.post("/addCategory", async (req, res) => {
  try {
    const { name, description } = req.body;
    const category = new Category({ name, description });
    category.save();
    res.send("Category added successfully!");
  } catch (err) {
    console.log(err);
  }
});

module.exports = adminRouter;
