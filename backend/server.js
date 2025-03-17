require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const authRoutes = require("./routes/auth");
const healthRoutes = require("./routes/health"); 
const productRoutes = require("./routes/products");
const consultationRoutes = require('./routes/consultation');
const doctorRoutes = require('./routes/doctors');
// const connectDB = require("./config/db");
const aiRoutes = require("./routes/ai");

// connectDB();



const app = express();
app.use(cors({ origin: "*", credentials: true }));
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/health", healthRoutes);
app.use("/api/products", productRoutes);
app.use('/api/consultation', consultationRoutes);
app.use('/api/doctors', doctorRoutes);
app.use("/api/ai", aiRoutes);


// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI).then(() => console.log("MongoDB Connected"))
    .catch(err => console.error("MongoDB Connection Error:", err));

app.listen(5000, () => console.log("Server running on port 5000"));
