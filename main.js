const config = require("config");
const express = require("express");
const app = express();

require("./startup/routes")(app);
require("./startup/database")();
require("./startup/validation")();
require("./startup/listen")(app);

// Import logger
const { main } = require("./logs/loggers");

// Uncaught errors
process.on("uncaughtException", (ex) => {
  main.error(ex.message, ex);
  process.exit(1);
});

process.on("unhandledRejection", (ex) => {
  main.error(ex.message, ex);
  process.exit(1);
});

// See if JWT key is set
if (!process.env.JWT_PK) {
  main.error("FATAL: jwtPrivateKey not set!");
  process.exit(1);
}
