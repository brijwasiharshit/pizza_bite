const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const connectDb = require("./config/db");
const kitchenRouter = require("./Routes/kitchenRoutes");
const adminRouter = require("./Routes/adminRoutes");
const ControllerRouter = require("./Routes/ControllerRoutes");
const userRouter = require("./Routes/userRoutes");

const app = express();
const server = http.createServer(app);
app.use(cookieParser());
<<<<<<< HEAD
app.use(express.json());
// ⚡ Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST","DELETE","PUT"],
=======

// ⚡ Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:3000",
      "https://pizza-bite-frontend.onrender.com"
    ],
    methods: ["GET", "POST"],
    credentials: true,
>>>>>>> 0a9b17a4eb9bf8c3895bcd7b3b39bbf3fe3fef3c
  },
});

// 👥 Handle socket connection
io.on("connection", (socket) => {
  console.log("✅ A user connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("❌ A user disconnected:", socket.id);
  });
});

app.set("io", io);

<<<<<<< HEAD

app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));

app.use(cookieParser());
=======
// 🌍 CORS middleware
const corsOptions = {
  origin: [
    "http://localhost:3000",
    "https://pizza-bite-frontend.onrender.com"
  ],
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));
app.use(express.json());
>>>>>>> 0a9b17a4eb9bf8c3895bcd7b3b39bbf3fe3fef3c

// 📦 Routes
app.use("/api/user", userRouter);
app.use("/api/kitchen", kitchenRouter);
app.use("/api/admin", adminRouter);
app.use("/api/controller", ControllerRouter);

// 🏠 Default Route
app.get("/", (req, res) => {
  res.send("Hi Ravi!");
});

// 🚀 Connect DB and Start Server
const port = process.env.PORT || 5000;
connectDb()
  .then(() => {
    server.listen(port, () => {
      console.log(`🚀 Server is running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error("❌ Failed to connect to database:", error);
  });
