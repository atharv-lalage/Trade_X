const { Schema } = require("mongoose");

const HoldingsSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  symbol: { type: String, required: true },   // e.g. RELIANCE.NS
  name: { type: String, required: true },       // e.g. RELIANCE INDUSTRIES LTD
  qty: { type: Number, required: true },
  avg: { type: Number, required: true },         // average buy price
  createdAt: { type: Date, default: Date.now },
});

// Compound index: one holding per symbol per user
HoldingsSchema.index({ userId: 1, symbol: 1 }, { unique: true });

module.exports = { HoldingsSchema };
