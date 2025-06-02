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

    let totalSalesInCash = 0;
        let totalSalesInOnline = 0;


    for (const order of orders) {
      const foodItem = await FoodItem.findById(order.itemId).lean();
      if (foodItem && foodItem.options[order.portion]) {
        if(order.method==="cash"){  totalSalesInCash += foodItem.options[order.portion] * order.quantity;}
        else{ totalSalesInOnline += foodItem.options[order.portion] * order.quantity;}
       
      }
    }

    res.json({ success: true, totalSalesTodayInCash: totalSalesInCash,totalSalesTodayInOnline:totalSalesInOnline });
  } catch (err) {
    console.error("Error in salesToday:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});
// adminRouter.get("/weeklySales", async (req, res) => {
//   try {
//     const last7Days = getSevenDaysAgo();
//     const orders = await Order.find({
//       status: "delivered",
//       createdAt: { $gte: last7Days },
//     }).lean();

//     let totalSales = 0;

//     for (const order of orders) {
//       const foodItem = await FoodItem.findById(order.itemId).lean();
//       if (foodItem && foodItem.options[order.portion]) {
//         totalSales += foodItem.options[order.portion] * order.quantity;
//       }
//     }

//     res.json({ success: true, totalSalesWeekly: totalSales });
//   } catch (err) {
//     console.error("Error in weeklySales:", err);
//     res.status(500).json({ success: false, error: err.message });
//   }
// });

//this route for weekely sales in cash created by me

adminRouter.get("/weeklySales",async(req,res)=>{try { 
  // function for get weekly dates
  
  
  function getSevenDaysAgo(){
//this is for today date
    const date=new Date()
    // and this is for extracting sevan days befor today date
    date.setDate(date.getDate()-7)
    // this is for correct date extracting
      date.setHours(0, 0, 0, 0);
return date
  }
  const last7Days = getSevenDaysAgo();
  // find items which have been deliverd and created by in sevan days
    items= await Order.find({status:"delivered",createdAt:{$gte:last7Days}}) 
// initialize  values
    totalSalesWeeklyInCash=0
        totalSalesWeeklyInOnline=0
    
// using for of loop for extracting order from items

    for(const order of items)  
      { 
   const foodPrice= await FoodItem.findById(order.itemId)
// we use and opretor for checking all three condition
if(foodPrice&&foodPrice.options &&order.portion){
  // get item price
  // foodPrice.options it's food prices and it's user order portions (order.portion)
  const itemPrice=foodPrice.options[order.portion]

 const orderprices=itemPrice*order.quantity
//  condition for checking payment methods
if(order.method==="cash"){totalSalesWeeklyInCash+=orderprices

 }else{totalSalesWeeklyInOnline+=orderprices
}
      }}
      
 
   res.status(200).json({ success:true,message:"fetched sussesfully weekelysales",weekelySalesInOnline:totalSalesWeeklyInOnline, weekelySalesInCash:totalSalesWeeklyInCash})

  
} catch (error) {   res.status(500).json({ success: false, error: err.message })}

  
}


)

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

// // TOTAL ORDERS
// adminRouter.get("/totalOrders", async (req, res) => {
//   try {
//     const totalOrders = await Order.countDocuments({ status: "delivered" });

//     res.json({ success: true, totalOrders });
//   } catch (err) {
//     console.error("Error in totalOrders:", err);
//     res.status(500).json({ success: false, error: err.message });
//   }
// });

// // AVERAGE ORDER VALUE
// adminRouter.get("/avgOrderValue", async (req, res) => {
//   try {
//     const orders = await Order.find({
//       status: "delivered",
//     }).lean();

//     const tableWiseTotals = {}; // { tableNo: totalPrice }

//     for (const order of orders) {
//       const foodItem = await FoodItem.findById(order.itemId).lean();
//       if (foodItem && foodItem.options[order.portion]) {
//         const price = foodItem.options[order.portion] * order.quantity;
//         if (tableWiseTotals[order.tableNo]) {
//           tableWiseTotals[order.tableNo] += price;
//         } else {
//           tableWiseTotals[order.tableNo] = price;
//         }
//       }
//     }

//     const totalRevenue = Object.values(tableWiseTotals).reduce(
//       (a, b) => a + b,
//       0
//     );
//     const numberOfTables = Object.keys(tableWiseTotals).length;
//     const avgOrderValue =
//       numberOfTables > 0 ? totalRevenue / numberOfTables : 0;

//     res.json({ success: true, avgOrderValue });
//   } catch (err) {
//     console.error("Error in avgOrderValue:", err);
//     res.status(500).json({ success: false, error: err.message });
//   }
// });
// adminRouter.get("/oneWeekComparison", async (req, res) => {
//   try {
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);

//     const salesData = [];

//     for (let i = 6; i >= 0; i--) {
//       const dayStart = new Date(today);
//       dayStart.setDate(today.getDate() - i);

//       const dayEnd = new Date(dayStart);
//       dayEnd.setDate(dayEnd.getDate() + 1);

//       const orders = await Order.find({
//         status: "delivered",
//         createdAt: { $gte: dayStart, $lt: dayEnd },
//       }).lean();

//       let dailyTotal = 0;

//       for (const order of orders) {
//         const foodItem = await FoodItem.findById(order.itemId).lean();
//         if (foodItem && foodItem.options[order.portion]) {
//           dailyTotal += foodItem.options[order.portion] * order.quantity;
//         }
//       }

//       salesData.push({
//         date: dayStart.toISOString().split("T")[0], // Format: YYYY-MM-DD
//         totalSales: dailyTotal,
//       });
//     }

//     res.json({ success: true, salesLast7Days: salesData });
//   } catch (err) {
//     console.error("Error in oneWeekComparison:", err);
//     res.status(500).json({ success: false, error: err.message });
//   }
// });




module.exports = adminRouter;
