"use strict";

const mongoose = require("mongoose");

const countConnect = () => {
  const numConntection = mongoose.connections.length;
  console.log(`Number of connections: ${numConntection}`);
};

module.exports = { countConnect };
