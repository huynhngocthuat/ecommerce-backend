"use strict";

const mongoose = require("mongoose");

const conntectString =
  process.env.MONGODB_URI || "mongodb://localhost:27017/express-mongoose";

mongoose
  .connect(conntectString)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.log("Failed to connect to MongoDB", err);
  });

mongoose.set("debug", true);
mongoose.set("debug", { color: true });

module.exports = mongoose;
