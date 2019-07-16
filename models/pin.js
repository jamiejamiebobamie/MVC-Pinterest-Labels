const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PinSchema = new Schema({
    pinIndex: { type: Number, unique: true }, // the index of the pin. starts at 0. used when accessing the pin in the app.
    locale: { type: String }, // "locale": “en-US",
    description: { type: String }, // "og:description": "Leonardo Albiero”,
    imageURL: { type: String, unique: true }, // "og:image": "https://i.pinimg.com/736x/6f/3b/fe/6f3bfe2b9f35b109b561596f45ca88cc.jpg",
    imageHeight: { type: Number }, // "og:image:height": "829",
    imageWidth: { type: Number }, // "og:image:width": "564",
    title: { type: String }, // "og:title": "Leonardo Albiero | Greek statue in 2019 | Vampire the masquerade bloodlines, Vampire art, Gothic vampire”,
    color: { type: String }, // "theme-color": “#e60023”,

// Some of these fields are returned as empty strings when the API is called.
// Empty strings are not stored.
    pinterestUrl: { type: String }, // pinterestUrl	string	The URL of the Pin on Pinterest.
    pinterestNote: { type: String }, // pinterestNote	string	The user-entered description of the Pin.
    pinterestId: { type: String }, // pinterestId	string	The unique string of numbers and letters that identifies the Pin on Pinterest.
    pinterestLink: { type: String }, // pinterestLink	string	The URL of the webpage where the Pin was created.

    contributors: [{ type: Schema.Types.ObjectId, ref: "User" }], //users who have contributed labels to the pin
    labels: [{ type: Schema.Types.ObjectId, ref: "Label" }] // associated labels
});

module.exports = mongoose.model("Pin", PinSchema);
