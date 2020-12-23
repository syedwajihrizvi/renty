const { genreSchema } = require("./genres");
const Joi = require("joi");
const mongoose = require("mongoose");

const movieSchema = new mongoose.Schema({
  title: {
    type: String,
    minlength: 1,
    maxlength: 255,
    lowercase: true,
    required: true,
  },
  genre: { type: genreSchema, required: true },
  numberInStock: {
    type: Number,
    min: 0,
    required: true,
  },
  dailyRentalRate: {
    type: Number,
    min: 0,
    required: true,
  },
});

const Movie = mongoose.model("Movie", movieSchema);

function validateMovie(movie) {
  const schema = Joi.object({
    title: Joi.string().min(1).max(255).required(),
    genre: Joi.objectId().required(),
    numberInStock: Joi.number().min(0).required(),
    dailyRentalRate: Joi.number().min(0).required(),
  });
  return schema.validate(movie);
}

module.exports.Movie = Movie;
module.exports.validateMovie = validateMovie;
