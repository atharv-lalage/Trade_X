const Joi = require("joi");

// ─── Auth Validation Schemas ────────────────────────────────────────────

const signupSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Please provide a valid email address",
    "any.required": "Email is required",
  }),
  username: Joi.string().min(3).max(30).required().messages({
    "string.min": "Username must be at least 3 characters",
    "string.max": "Username cannot exceed 30 characters",
    "any.required": "Username is required",
  }),
  password: Joi.string().min(6).max(128).required().messages({
    "string.min": "Password must be at least 6 characters",
    "string.max": "Password cannot exceed 128 characters",
    "any.required": "Password is required",
  }),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Please provide a valid email address",
    "any.required": "Email is required",
  }),
  password: Joi.string().required().messages({
    "any.required": "Password is required",
  }),
});

// ─── Order Validation Schema ────────────────────────────────────────────

const orderSchema = Joi.object({
  symbol: Joi.string().trim().uppercase().required().messages({
    "any.required": "Stock symbol is required",
  }),
  name: Joi.string().allow("", null).optional(),
  qty: Joi.number().integer().positive().min(1).required().messages({
    "number.base": "Quantity must be a number",
    "number.integer": "Quantity must be a whole number",
    "number.positive": "Quantity must be greater than 0",
    "number.min": "Minimum quantity is 1",
    "any.required": "Quantity is required",
  }),
  price: Joi.number().positive().required().messages({
    "number.base": "Price must be a number",
    "number.positive": "Price must be greater than 0",
    "any.required": "Price is required",
  }),
  mode: Joi.string().valid("BUY", "SELL").required().messages({
    "any.only": "Mode must be either BUY or SELL",
    "any.required": "Order mode (BUY/SELL) is required",
  }),
});

// ─── Validation Middleware Factory ──────────────────────────────────────

/**
 * Creates an Express middleware that validates req.body against a Joi schema.
 * Returns 400 with detailed error messages on validation failure.
 */
const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, {
    abortEarly: false, // return all errors, not just the first
    stripUnknown: true, // remove unknown fields
  });

  if (error) {
    const errors = error.details.map((detail) => detail.message);
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors,
    });
  }

  req.body = value; // use the sanitized/validated data
  next();
};

module.exports = {
  signupSchema,
  loginSchema,
  orderSchema,
  validate,
};
