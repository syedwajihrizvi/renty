const jwt = require("jsonwebtoken");
const config = require("config");
const { authorization: logger } = require("../logs/loggers");

// Set Debugger
const authDB = require("debug")("app:auth");

function auth(req, res, next) {
  if (process.env.NODE_ENV != "development") {
    const token = req.header("x-auth-token");
    if (!token) {
      logger.error(`REJECTED, NO TOKEN: ${req.body}`);
      return res.status(401).send("No token provided");
    }

    // Is valid token
    try {
      const valid = jwt.verify(token, config.get("jwtPrivateKey"));
      req.user = valid;
      next();
    } catch (error) {
      logger.log(`'INVALID TOKEN PROVIDED for ${req.body}`);
      authDB(error);
      return res.status(401).send("Invalid token provided");
    }
  } else {
    next();
  }
}

module.exports = auth;
