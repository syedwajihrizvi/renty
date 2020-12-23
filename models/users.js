const Joi = require("joi");
const mongoose = require("mongoose");
const passwordComplexity = require("joi-password-complexity").default;
const jwt = require("jsonwebtoken");
const config = require("config");

// Set Debuggers
const userDB = require("debug")("app:schema_users");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    maxlength: 255,
  },
  email: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 255,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    maxlength: 1024,
  },
  isAdmin: {
    type: Boolean,
    default: true,
  },
});

userSchema.methods.generateAuthToken = function () {
  const token = jwt.sign(
    { _id: this._id, isAdmin: this.isAdmin },
    config.get("jwtPrivateKey")
  );
  return token;
};

const User = mongoose.model("User", userSchema);

function validateUser(user) {
  const schema = Joi.object({
    name: Joi.string().max(255).required(),
    email: Joi.string().email().required(),
    password: passwordComplexity().required(),
    isAdmin: Joi.boolean(),
  });
  return schema.validate(user);
}

module.exports.User = User;
module.exports.validateUser = validateUser;
