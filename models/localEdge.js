// the edge between two labels
// an edge is "directed" from the first word typed in a description to the next word
// Description: "ninja turtle sword attack"
// ninja -> turtle -> sword -> attack

// maybe make a local edge and a global edge.
// local edges are just part of

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const LocalEdgeSchema = new Schema({
  weight: { type: Number },
  source: { type: Schema.Types.ObjectId, ref: "Label" },
  target: { type: Schema.Types.ObjectId, ref: "Label" },
});

module.exports = mongoose.model("LocalEdge", LocalEdgeSchema);
