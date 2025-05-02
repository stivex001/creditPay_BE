const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");
const app = express();
const config = require("./config/config");
require("dotenv").config();

// Middleware configuration
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
mongoose
  .connect(config.mongoURI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("Couldn't connect to MongoDB:", err));
// mongoose.connection.on('connected', () => console.log('Connected to MongoDB'));

const PORT = config.port;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));