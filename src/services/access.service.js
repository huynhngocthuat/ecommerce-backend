"use strict";

const { crypto, randomUUID } = require("node:crypto");
const KeyTokenService = require("./keyToken.service");
const shopModel = require("../models/shop.model");
const bcrypt = require("bcrypt");
const { createTokenPair, verifyJWT } = require("../auth/authUtils");
const { getInfoData } = require("../utils");
const {
  BadRequestError,
  AuthFailureError,
  ForbiddenError,
} = require("../core/error.reponse");
const { findByEmail } = require("./shop.service");
const Role = {
  SHOP: "shop",
  WRITER: "writer",
  EDITOR: "editor",
  ADMIN: "admin",
};

class AccessService {
  static handlerRefreshToken = async (refreshToken) => {
    const foundToken = await KeyTokenService.findByRefreshTokenUsed(
      refreshToken
    );
    if (foundToken) {
      const { userId, email } = await verifyJWT(
        refreshToken,
        foundToken.privateKey
      );

      // Delete all token in key store
      await KeyTokenService.deleteKeyById(userId);
      throw new ForbiddenError("Invalid refresh token");
    }

    const holderToken = await KeyTokenService.findByRefreshToken(refreshToken);
    if (!holderToken) {
      throw new AuthFailureError("Shop not registered 1");
    }
    const { userId, email } = await verifyJWT(
      refreshToken,
      holderToken.privateKey
    );
    const foundShop = await findByEmail({ email });
    if (!foundShop) {
      throw new BadRequestError("Shop not registered 2");
    }
    const tokens = await createTokenPair(
      { userId, email },
      holderToken.publicKey,
      holderToken.privateKey
    );

    await KeyTokenService.updateRefreshToken(tokens, refreshToken);

    return { user: { userId, email }, tokens };
  };

  static logout = async (keyStore) => {
    const delKey = await KeyTokenService.removeKeyById(keyStore._id);
    console.log(delKey);
    return delKey;
  };

  static login = async ({ email, password, refreshToken = null }) => {
    const shopFound = await findByEmail({ email });
    if (!shopFound) {
      throw new BadRequestError("Email not found");
    }
    const match = bcrypt.compare(password, shopFound.password);
    // if (!match) {
    //   throw new AuthFailureError("Password is incorrect");
    // }

    const privateKey = randomUUID();
    const publicKey = randomUUID();
    const tokens = await createTokenPair(
      { userId: shopFound._id, email: shopFound.email },
      publicKey,
      privateKey
    );
    await KeyTokenService.createKeyToken({
      userId: shopFound._id,
      publicKey,
      privateKey,
      refreshToken: tokens.refreshToken,
    });

    return {
      shop: getInfoData({
        fields: ["_id", "name", "email"],
        object: shopFound,
      }),
      tokens,
    };
  };

  static register = async ({ name, email, password }) => {
    const hodelShop = await shopModel.findOne({ email }).lean();

    if (hodelShop) {
      throw new BadRequestError("Email already exists");
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const newShop = await shopModel.create({
      name,
      email,
      password: passwordHash,
      roles: [Role.SHOP],
    });

    if (newShop) {
      // using asymmetrical
      // const { privateKey, publicKey } = await generateKeyPairSync("rsa", {
      //   modulusLength: 4096,
      //   publicKeyEncoding: {
      //     type: "pkcs1",
      //     format: "pem",
      //   },
      //   privateKeyEncoding: {
      //     type: "pkcs1",
      //     format: "pem",
      //   },
      // });

      const privateKey = randomUUID();
      const publicKey = randomUUID();

      const key = await KeyTokenService.createKeyToken({
        userId: newShop._id,
        publicKey,
        privateKey,
      });

      if (!key) {
        throw new BadRequestError("Can not create key token");
      }

      const tokens = await createTokenPair(
        { userId: newShop._id, email: newShop.email },
        publicKey,
        privateKey
      );
      await KeyTokenService.createKeyToken({
        publicKey,
        privateKey,
        refreshToken: tokens.refreshToken,
      });

      return {
        shop: getInfoData({
          fields: ["_id", "name", "email"],
          object: newShop,
        }),
        tokens,
      };
    }

    throw new BadRequestError("Can not create shop");
  };
}

module.exports = AccessService;
