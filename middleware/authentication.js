const CustomError = require("../errors");
const jwt = require("jsonwebtoken");
const Token = require("../models/Token");
const createTokensAndAddCookie = require("../utils/createTokensAndAddCookie");

const authenticateUser = async (req, res, next) => {
  const { refreshToken, accessToken } = req.signedCookies;

  try {
    if (accessToken) {
      const payload = jwt.verify(accessToken, process.env.JWT_SECRET);
      req.user = payload;
      return next();
    }

    const payload = jwt.verify(refreshToken, process.env.JWT_SECRET);

    const existingToken = await Token.findOne({
      user: payload.id,
      refreshToken: payload.refreshToken,
    });

    if (!existingToken || !existingToken?.isValid) {
      throw new CustomError.UnauthenticatedError("Authentication Invalid--");
    }

    createTokensAndAddCookie(
      payload.name,
      payload.id,
      payload.role,
      existingToken.refreshToken,
      res
    );

    req.user = payload.user;
    next();
  } catch (error) {
    throw new CustomError.UnauthenticatedError("Authentication Invalid++");
  }
};

module.exports = authenticateUser;
