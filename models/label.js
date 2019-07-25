const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const LabelSchema = new Schema({
  name: { type: String },
  pin: { type: Schema.Types.ObjectId, ref: "Pin" },
});

module.exports = mongoose.model("Label", LabelSchema);
