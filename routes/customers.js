const express = require("express");
const router = express.Router();
const { Customer, validateCustomer } = require("../models/customers");

const asyncMiddleware = require("../middleware/async");

const authorization = require("../middleware/auth");
const authentication = require("../middleware/authentication");

// Set Debuggers
const databaseDB = require("debug")("app:database_customers");

const {
  api: { customers: api },
} = require("../logs/loggers");

router.get(
  "",
  asyncMiddleware(async (req, res) => {
    const result = await Customer.find();
    return res.send(result);
  })
);

router.get(
  "/:id",
  asyncMiddleware(async (req, res) => {
    const customerId = req.params.id;
    const result = await Customer.findById(customerId);
    if (!result) {
      api.http(`Customer with ${customerId} does not exist`);
      return res.status(400).send(`Customer with ${customerId} does not exist`);
    }
    return res.send(result);
  })
);

router.post(
  "",
  authorization,
  asyncMiddleware(async (req, res) => {
    // Validate the customer
    const { error } = validateCustomer(req.body);
    if (error) {
      api.http(error.message);
      return res.status(400).send(error.message);
    }

    const customer = new Customer(req.body);
    const result = await customer.save();
    return res.send(result);
  })
);

router.put(
  "/:id",
  authorization,
  asyncMiddleware(async (req, res) => {
    const customerID = req.params.id;
    const customer = await Customer.findById(customerID);
    if (!customer) {
      api.http(`Customer with ID ${customerID} not found`);
      return res.status(400).send(`Customer with ID ${customerID} not found`);
    }

    const fieldsToUpdate = Object.keys(req.body);
    fieldsToUpdate.forEach((field) => {
      customer[field] = req.body[field];
    });

    const result = await customer.save();
    return res.send(result);
  })
);

router.delete(
  "/:id",
  authorization,
  authentication,
  asyncMiddleware(async (req, res) => {
    const customerID = req.params.id;
    const customer = await Customer.findById(customerID);
    if (!customer) {
      api.http(`Customer with ${customerID} not found`);
      return res.status(400).send("Customer not found");
    }
    const result = await Customer.deleteOne({ _id: customerID });
    if (result.deletedCount === 0) {
      api.http(`Delete of ${customerID} failed`);
      return res.status(400).send(`Delete of ${customerID} failed`);
    }
    return res.send(customer);
  })
);

module.exports = router;
