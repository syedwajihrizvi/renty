const errorDB = require("debug")("app:error_middleware");
const { errorMiddleware } = require("../logs/loggers");

module.exports = function (err, req, res, next) {
  errorDB(err);
  errorMiddleware.info(err);
  return res.status(500).send(err);
};
