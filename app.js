require("dotenv").config();
require("express-async-errors");

// express
const express = require("express");
const app = express();
app.use(express.json());

// db
const connectDB = require("./db/connect");

// extra security packages
const helmet = require("helmet");
const cors = require("cors");
const xss = require("xss-clean");
const rateLimiter = require("express-rate-limit");

// import route
const authRouter = require("./routes/authRoutes");

// import rest middleware
const morgan = require("morgan");
const cookieParser = require("cookie-parser");

// use rest middleware

app.use(helmet());
app.use(cors());
app.use(xss());
app.set("trust proxy", 1);
app.use(cookieParser(process.env.JWT_SECRET));
app.use(
  rateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
  })
);

// import middleware
const notFoundMiddleware = require("./middleware/not-found");
const errorHandlerMiddleware = require("./middleware/error-handler");

// use route
app.use("/api/v1/auth", authRouter);

// use middleware
app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

// port
const port = 5000;

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URL);
    app.listen(port, console.log("------x------"));
  } catch (error) {
    console.log(error);
  }
};
start();
