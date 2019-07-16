const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const LabelSchema = new Schema({
  createdAt: { type: Date },
  updatedAt: { type: Date },
  name: { type: String },
  associations: [{ type: Schema.Types.ObjectId, ref: "Edge" }], // source edges
  pins: [{ type: Schema.Types.ObjectId, ref: "Pin" }],
  author: [{ type: Schema.Types.ObjectId, ref: "User" }]
});

module.exports = mongoose.model("Label", LabelSchema);
