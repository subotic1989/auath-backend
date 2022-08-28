const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

// schema
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide name!"],
  },
  email: {
    type: String,
    required: [true, "Please provide email!"],
    validate: {
      validator: validator.isEmail,
      message: "Please provide valid email",
    },
  },
  password: {
    type: String,
    required: [true, "Please provide password!"],
    minlength: [6, "Must be at least 6 characters"],
  },
  role: {
    type: String,
    enum: ["admin", "user"],
    default: "user",
  },
  verificationToken: {
    type: String,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  verified: {
    type: Date,
  },
  passwordToken: {
    type: String,
  },
  passwordTokenExpirationDate: {
    type: Date,
  },
});

// crypt password
UserSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);

  this.password = await bcrypt.hash(this.password, salt);
});

//compare password
UserSchema.methods.comparePassword = async function (loginPassword) {
  return await bcrypt.compare(loginPassword, this.password);
};

module.exports = mongoose.model("User", UserSchema);
