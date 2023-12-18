"use strict";

const express = require("express");
const AccessController = require("../../controllers/access.controller");
const router = express.Router();
const { authentication } = require("../../auth/authUtils");
const { asyncHandler } = require("../../helpers/asynchandler");

router.post("/register", asyncHandler(AccessController.register));
router.post("/login", asyncHandler(AccessController.login));

router.use(authentication);

router.post("/logout", asyncHandler(AccessController.logout));
router.post("/handlerRefreshToken", asyncHandler(AccessController.handlerRefreshToken));

module.exports = router;
