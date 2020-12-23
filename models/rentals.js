const { date } = require("joi");
const Joi = require("joi");
const mongoose = require("mongoose");

const modelDB = require("debug")("app:schma_rentals");

const rentalSchema = new mongoose.Schema({
  movie: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Movie",
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Customer",
  },
  dateIssued: {
    type: Date,
    default: Date.now(),
  },
  dateReturned: {
    type: Date,
  },
  rentalFee: {
    type: Number,
    min: 0,
    get: calculateRentalFee,
  },
});

rentalSchema.methods.formatDate = function () {
  return `${this.dateIssued.getUTCFullYear()}/${
    this.dateIssued.getUTCMonth() + 1
  }/${this.dateIssued.getUTCDate()}`;
};

function calculateRentalFee() {
  const today = Date.now();
  const dateIssued = this.dateIssued.getTime();
  return (
    (Math.floor((today - dateIssued) / 60000 / 60 / 24) + 1) *
    this.movie.dailyRentalRate
  );
}

const Rental = mongoose.model("Rental", rentalSchema);

function validateRental(rental) {
  const schema = Joi.object({
    movie: Joi.objectId().required(),
    customer: Joi.objectId().required(),
  });

  return schema.validate(rental);
}

module.exports.Rental = Rental;
module.exports.validateRental = validateRental;
