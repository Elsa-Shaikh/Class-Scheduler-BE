const express = require("express");
const cors = require("cors");
const classRoutes = require("./src/Routes/classRoute.js");
const authRoutes = require("./src/Routes/authRoute.js");
const notificationRoutes = require("./src/Routes/notificationRoute.js");

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/classes", classRoutes);
app.use("/api/notifications", notificationRoutes);

module.exports = app;
