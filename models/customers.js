const Joi = require("joi");
const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema({
  isGold: {
    type: Boolean,
    default: false,
  },
  name: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 255,
    lowercase: true,
  },
  phone: {
    type: String,
    required: true,
    match: /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im,
  },
});

const Customer = mongoose.model("Customer", customerSchema);

function validateCustomer(customer) {
  const schema = Joi.object({
    isGold: Joi.boolean(),
    name: Joi.string().min(3).max(255).required(),
    phone: Joi.string()
      .pattern(
        new RegExp("^[+]?[(]?[0-9]{3}[)]?[-s.]?[0-9]{3}[-s.]?[0-9]{4,6}$")
      )
      .required(),
  });

  return schema.validate(customer);
}

module.exports.Customer = Customer;
module.exports.validateCustomer = validateCustomer;
