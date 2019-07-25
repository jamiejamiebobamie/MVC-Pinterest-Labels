
// FUTURE IMPLEMENTATION

// Might not be neccessary but when I implement the search feature and I am
 // attempting to search by labels it would be easier (?) to look up one 

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const LabelSchema = new Schema({
  name: { type: String, unique: true },
  pin: [{ type: Schema.Types.ObjectId, ref: "Pin" }],
});

module.exports = mongoose.model("Label", LabelSchema);
