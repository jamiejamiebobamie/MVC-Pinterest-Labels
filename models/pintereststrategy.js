const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Schema = mongoose.Schema;


const PinterestStrategy = new Schema({
    clientID: { type: String, required: true },
    clientSecret: { type: String, required: true },
    scope: { type: Array, required: true },
    callbackURL: { type: String, required: true },
    state: { type: Boolean, required: true }
});

module.exports = mongoose.model("PinterestStrategy", PinterestStrategy);
