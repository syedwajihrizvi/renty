const mongoose = require("mongoose");
const databaseDB = require("debug")("app:database");
const { main } = require("../logs/loggers");
const config = require("config");

// Connect to Database
const dbUrl = config.get("database");

module.exports = function () {
  mongoose
    .connect(dbUrl, { useNewUrlParser: true })
    .then(() => databaseDB("Connected Successfully to database", dbUrl))
    .catch((err) => {
      databaseDB("Failed to Connect to genres database");
      main.error("Failed to connect to database");
    });
};
