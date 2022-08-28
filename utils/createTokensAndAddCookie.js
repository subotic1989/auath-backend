const jwt = require("jsonwebtoken");

const createTokensAndAddCookie = (name, id, role, refreshToken, res) => {
  const accessTokenJWT = jwt.sign({ name, id, role }, process.env.JWT_SECRET);

  const refreshTokenJWT = jwt.sign(
    { name, id, role, refreshToken },
    process.env.JWT_SECRET
  );

  const fifteenMinutes = 1000 * 60 * 15;
  const oneDay = 1000 * 60 * 60 * 24;

  res.cookie("accessToken", accessTokenJWT, {
    httpOnly: true,
    expires: new Date(Date.now() + fifteenMinutes),
    secure: process.env.NODE_ENV === "production",
    signed: true,
  });

  res.cookie("refreshToken", refreshTokenJWT, {
    httpOnly: true,
    expires: new Date(Date.now() + oneDay),
    secure: process.env.NODE_ENV === "production",
    signed: true,
  });
};

module.exports = createTokensAndAddCookie;
