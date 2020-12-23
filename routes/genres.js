const config = require("config");
const authorization = require("../middleware/auth");
const authentication = require("../middleware/authentication");
const express = require("express");
const router = express.Router();
const { Genre, validateGenre } = require("../models/genres");
const asyncMiddleware = require("../middleware/async");

const databaseDB = require("debug")("app:database_genres");

const {
  api: { genres: api },
} = require("../logs/loggers");

router.get(
  "",
  asyncMiddleware(async (req, res) => {
    const result = await Genre.find();
    res.send(result);
  })
);

router.get(
  "/:id",
  asyncMiddleware(async (req, res) => {
    const result = await Genre.findById(req.params.id);
    if (!result) {
      api.http(`ID ${req.params.id} not found`);
      return res.status(404).send("Genre not found");
    }
    return res.send(result);
  })
);

router.post(
  "",
  authorization,
  asyncMiddleware(async (req, res, next) => {
    // Validate the genre
    const { error } = validateGenre(req.body);
    if (error) {
      return res.status(404).send(error.details[0].message);
    }

    // Check to see if it already exists
    let genre = await Genre.findOne({ name: req.body.name });
    if (genre) {
      api.http(`Genre with name ${req.body.name} already exists`);
      return res.status(404).send("Genre already exists");
    }
    genre = new Genre({
      name: req.body.name,
    });
    const result = await genre.save();
    res.send(result);
  })
);

router.put(
  "/:id",
  authorization,
  asyncMiddleware(async (req, res) => {
    const genre = await Genre.findById(req.params.id);
    if (!genre) {
      api.http(`Genre with ID ${req.params.id} does not exists`);
      return res.status(400).send("Genre not found");
    }
    genre.name = req.body.name;
    const result = await genre.save();
    return res.send(result);
  })
);

router.delete(
  "/:id",
  authorization,
  authentication,
  asyncMiddleware(async (req, res) => {
    const genreID = req.params.id;
    const result = await Genre.deleteOne({ _id: genreID });
    if (result.deletedCount === 0)
      api.http(`Genre with ID ${req.params.id} does not exist`);
    return res.status(400).send("Genre does not exist");
    return res.send(result);
  })
);

module.exports = router;
