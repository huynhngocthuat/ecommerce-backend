"use strict";

const findById = require("../services/apikey.service");

const HEADER = {
  API_KEY: "x-api-key",
  AUTHORIZATION: "authorization",
};

const apiKey = async (req, res, next) => {
  try {
    const key = req.headers[HEADER.API_KEY]?.toString();
    if (!key) {
      return res.status(403).json({ message: "Forbidden Exception" });
    }

    const objKey = await findById(key);

    if (!objKey) {
      return res.status(403).json({ message: "Forbidden Exception" });
    }
    req.objKey = objKey;
    return next();
  } catch (err) {
    next(err);
  }
};

module.exports = { apiKey };
