const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const LabelSchema = new Schema({
  name: { type: String, unique: true },
  pins: [{ type: Schema.Types.ObjectId, ref: "Pin" }],
});

module.exports = mongoose.model("Label", LabelSchema);
