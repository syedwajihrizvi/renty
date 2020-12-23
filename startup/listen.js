// Set up port
const port = process.env.PORT || 3000;

const startupDB = require("debug")("app:startup");

module.exports = function (app) {
  app.listen(port, () => {
    startupDB(`Listening on ${port}`);
  });
};
