const { User } = require("../models/users");
const express = require("express");
const router = express.Router();
const { hashedPassword, comparePasswords } = require("../hash");
const _ = require("lodash");
const Joi = require("joi");
const passwordComplexity = require("joi-password-complexity").default;
const config = require("config");

// Set debugger
const databaseDB = require("debug")("app:database_users");

router.post("", async (req, res) => {
  // Validate with Joi Schema
  const { error } = validateUser(req.body);
  if (error) {
    databaseDB(error);
    return res.status(400).send(error);
  }

  // Does user exists
  const { email, password } = req.body;
  let user = await User.findOne({ email });
  if (!user) return res.status(400).send("Invalid login");

  // See if passwords match or not
  try {
    // Hash password
    const match = await comparePasswords(user.password, password);
    if (!match) return res.status(400).send("Invalid login");

    const token = user.generateAuthToken();
    return res.header("x-auth-token", token).send(true);
  } catch (error) {
    databaseDB(error);
    return res.status(400).send(error);
  }
});

function validateUser(req) {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  });
  return schema.validate(req);
}

module.exports = router;
