const express = require("express");
const authorization = require("../middleware/auth");
const asyncMiddleWare = require("../middleware/async");
const { Genre } = require("../models/genres");
const router = express.Router();

const { Movie, validateMovie } = require("../models/movies");

const databaseDB = require("debug")("app:database_movies");

const {
  api: { movies: api },
} = require("../logs/loggers");

router.get(
  "",
  asyncMiddleWare(async (req, res) => {
    const result = await Movie.find();
    res.send(result);
  })
);

router.get(
  "/:id",
  asyncMiddleWare(async (req, res) => {
    const movieID = req.params.id;
    const result = await Movie.findById(movieID);
    if (!result) {
      api.http(`Movie with ${movieID} not found`);
      return res.status(400).send(`Movie with ${movieID} not found`);
    }
    res.send(result);
  })
);

router.post(
  "",
  authorization,
  asyncMiddleWare(async (req, res) => {
    // Check schema using Joi
    const { error } = validateMovie(req.body);
    if (error) {
      api.http(error);
      return res.status(400).send(error.details);
    }

    const {
      title,
      genre: genreName,
      numberInStock,
      dailyRentalRate,
    } = req.body;

    // If movie exists, then cannot add it
    const movie = await Movie.findOne({ title });
    if (movie) {
      api.http(`${title} already exists`);
      return res.status(400).send(`${title} already exists`);
    }

    // Check to see if genre exists or a new genre must be created
    let genre = await Genre.findOne({ name: genreName });
    if (!genre) {
      genre = new Genre({ name: genreName });
      const result = await genre.save();
    }

    // Create and save the new movie
    const newMovie = new Movie({
      title,
      genre,
      numberInStock,
      dailyRentalRate,
    });

    const result = await newMovie.save();
    return res.send(result);
  })
);

router.put(
  "/:id",
  authorization,
  asyncMiddleWare(async (req, res) => {
    const movieID = req.params.id;
    const movie = await Movie.findById(movieID);
    if (!movie) api.http(`Movie with ID ${movieID} not found`);
    return res.status(400).send(`Movie with ID ${movieID} not found`);

    // Check to see if genre hasto be updated
    if (req.body.genre) {
      let genre = await Genre.findOne({ name: req.body["genre"] });
      if (!genre) {
        databaseDB("CREATED NEW GENRE");
        genre = new Genre({ name: req.body.genre });
      }
      genre = await genre.save();
      req.body["genre"] = genre;
      databaseDB(genre);
    }

    // Update the fields
    const fieldsToUpdate = Object.keys(req.body);

    fieldsToUpdate.forEach((field) => {
      movie[field] = req.body[field];
    });

    const result = await movie.save();
    return res.send(result);
  })
);

router.delete(
  "/:id",
  authorization,
  asyncMiddleWare(async (req, res) => {
    const movieID = req.params.id;
    const movie = await Movie.findById(movieID);
    if (!movie) {
      api.http(`Movie with ${movieID} not found`);
      return res.status(400).send(`Movie with ${movieID} not found`);
    }

    const result = await Movie.deleteOne({ _id: movieID });
    if (result.deletedCount === 0) {
      api.http(`Delete for movie ID ${movieID} failed`);
      return res.status(400).send("Delete failed");
    }
    return res.send(movie);
  })
);

module.exports = router;
