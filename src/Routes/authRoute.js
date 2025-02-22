const express = require("express");
const { register, login, userData } = require("../Controller/authController");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/get/user", userData);

module.exports = router;
