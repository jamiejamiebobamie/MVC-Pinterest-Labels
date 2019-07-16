// the edge between two labels
// an edge is "directed" from the first word typed in a description to the next word
// Description: "ninja turtle sword attack"
// ninja -> turtle -> sword -> attack

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const EdgeSchema = new Schema({
  weight: { type: Number },
  source: { type: Schema.Types.ObjectId, ref: "Label" },
  target: { type: Schema.Types.ObjectId, ref: "Label" },
});

module.exports = mongoose.model("Edge", EdgeSchema);
