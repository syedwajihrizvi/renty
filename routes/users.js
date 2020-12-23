const { User, validateUser } = require("../models/users");
const express = require("express");
const router = express.Router();
const { hashedPassword } = require("../hash");
const _ = require("lodash");
const config = require("config");
const authorization = require("../middleware/auth");
const asyncMiddleware = require("../middleware/async");

// Set debugger
const databaseDB = require("debug")("app:database_users");

const {
  api: { users: api },
} = require("../logs/loggers");

router.get(
  "/me",
  authorization,
  asyncMiddleware(async (req, res) => {
    const user = User.findById(req.user._id).select("-password -_id");
    if (!user) {
      api.http(`User not found ${req.user._id}`);
      return res.status(400).send("User not found");
    }
    return res.send(user);
  })
);

router.post(
  "",
  asyncMiddleware(async (req, res) => {
    // Validate with Joi Schema
    const { error } = validateUser(req.body);
    if (error) {
      api.http(error);
      databaseDB(error);
      return res.status(400).send(error);
    }

    // Does user exists
    let user = await User.findOne({ email: req.body.email });
    if (user) {
      api.http(`User with ${req.body.email} already exists`);
      return res.status(400).send(`User with ${req.body.email} already exists`);
    }

    // Add new user
    user = new User(_.pick(req.body, ["_id", "name", "email", "password"]));
    // Hash password
    user.password = await hashedPassword(user.password);
    const token = user.generateAuthToken();
    const result = await user.save();
    return res
      .header("x-auth-token", token)
      .send(_.pick(result, ["_id", "name", "email"]));
  })
);

module.exports = router;
