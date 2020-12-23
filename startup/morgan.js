const morgan = require("morgan");

// Debuggers
const connectDB = require("debug")("app:connect");

module.exports = function (app) {
  if (app.get("env") === "development") {
    app.use(
      morgan("combined", {
        stream: { write: (msg) => connectDB(msg.trimEnd()) },
      })
    );
    connectDB("Morgan Enabled");
  }
};
