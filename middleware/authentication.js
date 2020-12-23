const auth = require("./auth");

const { authentication: logger } = require("../logs/loggers");

function authentication(req, res, next) {
  if (process.env.NODE_ENV != "development") {
    const isAdmin = req.user.isAdmin;
    if (!isAdmin) logger.error(`Not authorized to make change: ${req.user}`);
    return res.status(403).send("Unauthorized to make the change");
    next();
  } else {
    next();
  }
}

module.exports = authentication;
