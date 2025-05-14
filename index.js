const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");
const app = express();
const config = require("./config/config");
require("dotenv").config();
const routes = require("./routes/router");

// Middleware configuration
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
mongoose
  .connect(config.mongoURI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("Couldn't connect to MongoDB:", err));

app.get("/", (req, res) => {
  res.send("Hello World!");
});
app.use("/api", routes);

const PORT = config.port;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
