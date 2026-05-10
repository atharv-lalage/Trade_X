const { Schema } = require("mongoose");

const PositionsSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  symbol: { type: String, required: true },
  name: { type: String, required: true },
  product: { type: String, default: "MIS" },  // MIS (intraday) or CNC (delivery)
  qty: { type: Number, required: true },
  avg: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});

PositionsSchema.index({ userId: 1, symbol: 1 }, { unique: true });

module.exports = { PositionsSchema };
