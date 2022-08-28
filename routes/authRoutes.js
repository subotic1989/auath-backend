const express = require("express");
const router = express.Router();
const authenticateUser = require("../middleware/authentication");

const {
  register,
  verification,
  login,
  logout,
  showUser,
  resetPassword,
  setNewPassword,
} = require("../controllers/authController");

router.get("/showUser", authenticateUser, showUser);
router.post("/register", register);
router.post("/verification", verification);
router.post("/login", login);
router.post("/reset-password", resetPassword);
router.post("/set-new-password", setNewPassword);
router.delete("/logout", authenticateUser, logout);

module.exports = router;
