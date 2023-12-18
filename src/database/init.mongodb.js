"use strict";
require("dotenv").config();
const mongoose = require("mongoose");

const conntectString =
  process.env.MONGODB_URI || "mongodb://localhost:27017/ecommerce";

class Database {
  constructor() {
    this.connect();
  }

  connect() {
    mongoose.set("debug", true);
    mongoose.set("debug", { color: true });
    mongoose
      .connect(conntectString)
      .then(() => {
        console.log("Connected to MongoDB:  " + conntectString);
      })
      .catch((err) => {
        console.log("Failed to connect to MongoDB", err);
      });
  }
  static getInstance() {
    if (!this.instance) {
      this.instance = new Database();
    }
    return this.instance;
  }
}
const intanceMongo = Database.getInstance();
module.exports = mongoose;
