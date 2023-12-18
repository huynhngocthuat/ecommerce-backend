"use strict";

const { CREATED, SuccessReponse } = require("../core/success.response");
const AccessService = require("../services/access.service");

class AccessController {

  handlerRefreshToken = async (req, res, next) => {
    new SuccessReponse({
      message: "Get token success!",
      metadata: await AccessService.handlerRefreshToken(req.body.refreshToken),
    }).send(res);
  };

  logout = async (req, res, next) => {
    new SuccessReponse({
      message: "Logout success!",
      metadata: await AccessService.logout(req.keyStore),
    }).send(res);
  };

  login = async (req, res, next) => {
    new SuccessReponse({ metadata: await AccessService.login(req.body) }).send(
      res
    );
  };

  register = async (req, res, next) => {
    new CREATED({
      message: "Register success!",
      metadata: await AccessService.register(req.body),
    }).send(res);
  };
}

module.exports = new AccessController();
