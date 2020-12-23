const { Rental, validateRental } = require("../models/rentals");
const { Customer, validateCustomer } = require("../models/customers");
const { Movie, validateMovie } = require("../models/movies");
const mongoose = require("mongoose");
const vidly = mongoose.connection;

const authorization = require("../middleware/auth");
const asyncMiddleware = require("../middleware/async");
const database = require("../utilities/database");

const express = require("express");
const { startSession } = require("mongoose");

const router = express.Router();

const databaseDB = require("debug")("app:database_rentals");

const {
  api: { rentals: api },
} = require("../logs/loggers");

router.get(
  "",
  asyncMiddleware(async (req, res) => {
    const result = await Rental.find()
      .populate("movie", "title numberInStock -_id")
      .populate("customer", "name -_id phone")
      .select("-_id");
    return res.send(result);
  })
);

router.get(
  "/:id",
  asyncMiddleware(async (req, res) => {
    const rentalID = req.params.id;
    const result = await Rental.findById(rentalID)
      .populate("movie", "title numberInStock dailyRentalRate -_id")
      .populate("customer", "name -_id phone")
      .select("-_id");
    if (!result) {
      api.http(`Rental with ${rentalID} does not exist`);
      return res.status(400).send(`Rental with ${rentalID} does not exist`);
    }
    databaseDB(result.rentalFee);
    return res.send(result);
  })
);

router.post(
  "",
  authorization,
  asyncMiddleware(async (req, res) => {
    // Create collection if it does not exist
    database("rentals");

    // Validate using Joi first
    const { error } = validateRental(req.body);
    if (error) return res.status(400).send(error);

    const { movie, customer } = req.body;
    // Check if the ObjectIDs are valid
    if (!mongoose.isValidObjectId(movie)) {
      api.http(`Invalid Movie ID: ${movie}`);
      return res.status(400).send("Invalid Movie ID");
    }
    if (!mongoose.isValidObjectId(customer)) {
      api.http(`Invalid Customer ID: ${customer}`);
      return res.status(400).send("Invalid Customer ID");
    }

    // Check to see if the movie exists
    const findMovie = await Movie.findById(movie);
    if (!findMovie) {
      api.http(`Movie with ID ${movie} does not exist`);
      return res.status(400).send(`Movie with ID ${movie} does not exist`);
    }

    // Check to see if movie out of stock
    if (findMovie.numberInStock === 0) {
      api.http(`Movie with ID ${movie} out of stock`);
      return res.status(400).send("Movie is out of stock!");
    }

    // Check to see if the customer exists
    const findCustomer = await Customer.findById(customer);
    if (!findCustomer)
      return res
        .status(400)
        .send(`Customer with ID ${customer} does not exist`);

    const session = await Rental.startSession();
    try {
      session.startTransaction();

      const rental = new Rental({ movie, customer });
      await Rental.create([rental], { session });
      const result = await Movie.findByIdAndUpdate(
        movie,
        { numberInStock: findMovie.numberInStock - 1 },
        { session }
      );
      await session.commitTransaction();
      return res.send(rental);
    } catch (error) {
      databaseDB();
      databaseDB(error);
      return res.status(400).send(error);
    } finally {
      session.endSession();
    }
  })
);

router.delete(
  "/:id",
  authorization,
  asyncMiddleware(async (req, res) => {
    const rentalId = req.params.id;
    const rental = await Rental.findById(rentalId);
    if (!rental) {
      api.http(`Rental with ${rentalId} does not exist`);
      return res.status(400).send(`Rental with ${rentalId} does not exist`);
    }

    const result = await Rental.findByIdAndDelete(rentalId);
    if (result.deletedCount === 0) {
      api.http(`Failed to delete ${rentalId}`);
      return res.status(400).send("Failed to delete");
    }
    return res.send(rental);
  })
);

module.exports = router;
