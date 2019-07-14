
const Schema = mongoose.Schema;

// each

const LabelSchema = new Schema({
  createdAt: { type: Date },
  updatedAt: { type: Date },
  name: { type: String },
  associations: [{ type: Schema.Types.ObjectId, ref: "Label" }],
  pin: [{ type: Schema.Types.ObjectId, ref: "Pin" }],
  author: [{ type: Schema.Types.ObjectId, ref: "User" }]
});

module.exports = mongoose.model("Label", LabelSchema);
