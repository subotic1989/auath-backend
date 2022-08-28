const User = require("../models/User");
const Token = require("../models/Token");

const CustomError = require("../errors/index");

const crypto = require("crypto");

const sendVerificationEmail = require("../utils/verificationEmail");
const sendResetPasswordEmail = require("../utils/resetPasswordEmail");
const createTokensAndAddCookie = require("../utils/createTokensAndAddCookie");
const createHash = require("../utils/createHash");

// register
const register = async (req, res) => {
  const { name, email, password } = req.body;

  const duplicateEmail = await User.findOne({ email });

  if (duplicateEmail) {
    throw new CustomError.BadRequestError("Email already exist!");
  }

  const role = (await User.countDocuments({})) === 0 ? "admin" : "user";

  const verificationToken = crypto.randomBytes(40).toString("hex");

  await User.create({
    name,
    email,
    password,
    role,
    verificationToken,
  });

  sendVerificationEmail(name, email, verificationToken);

  res.status(200).json({ msg: "Register successfully! Please check Email!" });
};

// verification
const verification = async (req, res) => {
  const { email, token: verificationToken } = req.body;

  const user = await User.findOne({ email, verificationToken });

  if (!user) {
    throw new CustomError.BadRequestError("Invalid credentials!");
  }

  if (user.verificationToken !== verificationToken) {
    throw new CustomError.BadRequestError("Verification Failed!");
  }

  user.isVerified = true;
  user.verified = Date.now();
  user.verificationToken = "";

  await user.save();

  res.status(200).json({ msg: "User verified successfully!" });
};

// login
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new CustomError.BadRequestError("Please provide email and password");
  }
  const user = await User.findOne({ email });

  if (!user) {
    throw new CustomError.UnauthenticatedError("Invalid Credentials");
  }

  const isPasswordCorrect = await user.comparePassword(password);

  if (!isPasswordCorrect) {
    throw new CustomError.UnauthenticatedError("Invalid Password");
  }

  if (!user.isVerified) {
    throw new CustomError.UnauthenticatedError("User is not verified!");
  }

  let refreshToken = "";

  const existsRefreshToken = await Token.findOne({ email });

  // check if refreshToken exists
  if (existsRefreshToken) {
    if (!existsRefreshToken.isValid) {
      throw new CustomError.UnauthenticatedError("If user is not good!");
    }

    refreshToken = existsRefreshToken.refreshToken;

    createTokensAndAddCookie(user.name, user._id, user.role, refreshToken, res);

    res
      .status(200)
      .json({ user, msg: `Hallo ${user.name}. Successfully logged!` });
    return;
  }

  // create new refreshToken
  refreshToken = crypto.randomBytes(40).toString("hex");
  const userAgent = req.headers["user-agent"];
  const ip = req.ip;

  await Token.create({
    refreshToken,
    ip,
    userAgent,
    user: user._id,
    email: user.email,
  });

  createTokensAndAddCookie(user.name, user._id, user.role, refreshToken, res);

  res
    .status(200)
    .json({ user, msg: `Hallo ${user.name}. Successfully logged!` });
};

// resetPassword
const resetPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new CustomError.BadRequestError("Please provide valid email!");
  }

  const user = await User.findOne({ email });

  if (user) {
    const passwordToken = crypto.randomBytes(70).toString("hex");

    await sendResetPasswordEmail(user.email, user.name, passwordToken);

    const tenMinutes = 1000 * 60 * 10;
    const passwordTokenExpirationDate = new Date(Date.now() + tenMinutes);

    user.passwordToken = createHash(passwordToken);
    user.passwordTokenExpirationDate = passwordTokenExpirationDate;

    await user.save();
  }

  res.status(200).json({ msg: "Please check your Email to reset password!" });
};

// setNewPassword
const setNewPassword = async (req, res) => {
  const { token, email, password } = req.body;

  if (!token || !email || !password) {
    throw new CustomError.BadRequestError("Please provide all values!");
  }

  const user = await User.findOne({ email });

  if (user) {
    const currentDate = new Date();
    console.log("------------------");
    console.log(req.body);

    if (
      user.passwordToken === createHash(token) &&
      user.passwordTokenExpirationDate > currentDate
    ) {
      user.password = password.password;
      user.passwordToken = null;
      user.passwordTokenExpirationDate = null;
      await user.save();
    }
  }

  res.status(200).json({ msg: "Password changed successfully!!!" });
};

// logout
const logout = async (req, res) => {
  await Token.findOneAndDelete({ user: req.user.id });

  res.cookie("accessToken", "logout", {
    httpOnly: true,
    expires: new Date(Date.now()),
  });

  res.cookie("refreshToken", "logout", {
    httpOnly: true,
    expires: new Date(Date.now()),
  });

  res.status(200).json({ msg: "user logged out!" });
};

// showUser
const showUser = async (req, res) => {
  res.status(200).json({ user: req.user });
};

module.exports = {
  register,
  verification,
  login,
  logout,
  showUser,
  resetPassword,
  setNewPassword,
};
