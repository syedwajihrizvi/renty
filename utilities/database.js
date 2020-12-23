const { Mongoose } = require("mongoose");

const mongoose = require("mongoose");
const vidly = mongoose.connection;

module.exports = async function (collection) {
  vidly.db.listCollections({ name: collection }).next(function (err, info) {
    if (info === null) {
      vidly.db.createCollection(collection);
    }
  });
};
