"use strict";
const e = require("express");
const JWT = require("jsonwebtoken");
const { asyncHandler } = require("../helpers/asynchandler");
const { AuthFailureError, NotFoundError } = require("../core/error.reponse");
const keyStoreService = require("../services/keyToken.service");

const HEADER = {
  API_KEY: "x-api-key",
  CLIENT_ID: "x-client-id",
  AUTHORIZATION: "authorization",
};

const createTokenPair = async (payload, publicKey, privateKey) => {
  try {
    const accessToken = await JWT.sign(payload, publicKey, {
      expiresIn: "2 days",
    });

    const refreshToken = await JWT.sign(payload, privateKey, {
      expiresIn: "30 days",
    });

    JWT.verify(accessToken, publicKey, (err, decoded) => {
      if (err) {
        console.log(err);
      } else {
        console.log(decoded);
      }
    });

    return {
      accessToken,
      refreshToken,
    };
  } catch (error) {
    throw error;
  }
};

const authentication = asyncHandler(async (req, res, next) => {
  const userId = req.headers[HEADER.CLIENT_ID];
  if (!userId) {
    throw new AuthFailureError("Missing client id");
  }

  const keyStore = await keyStoreService.findByUserId(userId);
  if (!keyStore) {
    throw new NotFoundError("Not found key store");
  }

  const accessToken = req.headers[HEADER.AUTHORIZATION];
  if (!accessToken) {
    throw new AuthFailureError("Missing access token");
  }

  try {
    const decodeUser = await JWT.verify(accessToken, keyStore.publicKey);
    if (userId !== decodeUser.userId) {
      throw new AuthFailureError("Invalid access token");
    }
    req.keyStore = keyStore;
    return next();
  } catch (error) {
    throw error;
  }
});

const verifyJWT = async (token, keySecret) => {
  return await JWT.verify(token, keySecret);
};

module.exports = { createTokenPair, authentication, verifyJWT };
