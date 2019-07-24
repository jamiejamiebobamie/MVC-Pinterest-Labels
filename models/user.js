const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  createdAt: { type: Date },
  updatedAt: { type: Date },
  password: { type: String, select: false },
  username: { type: String, required: true, unique: true },
  pinIndex: {type: Number}, // the current index the user is currently on (like page number:: where did the user leave off?)
  admin: {type: Boolean}, // only admins (me) can call the get '/new' pin route . and increment the...
  newPinIndex: {type: Number}, // global variable that keeps track of the highest pin index. (the highest "page" number). only admin's can edit.
  freeIndices: [{type: Number}], // global variable that keeps track of the indices of pins that have been deleted.

                                // TEMPORARY!!
  pullPinIndex: {type: Number} // the count of the pins. used when referencing the json array of pin info.
                              // need to pull 10+ pins at a time and reference pins past 25/100 in the JSON object.
});

// Must use function here! ES6 => functions do not bind this!
UserSchema.pre("save", function(next) {
  // SET createdAt AND updatedAt
  const now = new Date();
  this.updatedAt = now;
  if (!this.createdAt) {
    this.createdAt = now;
  }

  // ENCRYPT PASSWORD
  const user = this;
  if (!user.isModified("password")) {
    return next();
  }
  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(user.password, salt, (err, hash) => {
      user.password = hash;
      next();
    });
  });
});

// Need to use function to enable this.password to work.
UserSchema.methods.comparePassword = function(password, done) {
  bcrypt.compare(password, this.password, (err, isMatch) => {
    done(err, isMatch);
  });
};

module.exports = mongoose.model("User", UserSchema);
