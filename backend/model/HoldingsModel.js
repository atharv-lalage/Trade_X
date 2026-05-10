const { model } = require("mongoose");
const { HoldingsSchema } = require("../schemas/HoldingsSchema"); // <-- fix name

const HoldingsModel = model("holding", HoldingsSchema); // <-- remove 'new'

module.exports = { HoldingsModel };
