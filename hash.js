const bcrypt = require("bcrypt");

// Set Debuggers
const hashDB = require("debug")("app:hash");

async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  return hashedPassword;
}

async function comparePasswords(hashedPassword, password) {
  const result = await bcrypt.compare(password, hashedPassword);
  return result;
}

module.exports.hashedPassword = hashPassword;
module.exports.comparePasswords = comparePasswords;
