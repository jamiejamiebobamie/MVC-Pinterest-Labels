const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PinSchema = new Schema({
    // attributes assigned on pin creation:
    pinIndex: { type: Number, unique: true }, // the index of the pin. starts at 0. used when accessing the pin in the app.
    locale: { type: String }, // "locale": “en-US",
    description: { type: String }, // "og:description": "Leonardo Albiero”,
    imgUrl: { type: String}, // "og:image": "https://i.pinimg.com/736x/6f/3b/fe/6f3bfe2b9f35b109b561596f45ca88cc.jpg",
    imgHeight: { type: Number }, // "og:image:height": "829",
    imgWidth: { type: Number }, // "og:image:width": "564",
    title: { type: String }, // "og:title": "Leonardo Albiero | Greek statue in 2019 | Vampire the masquerade bloodlines, Vampire art, Gothic vampire”,
    hexCode: { type: String }, // "theme-color": “#e60023”,
    pinterestUrl: { type: String }, // pinterestUrl	string	The URL of the Pin on Pinterest.

    flagged: {type: Boolean },
    
    // attributes assigned when labels are assigned to the pin:
    contributors: [{ type: Schema.Types.ObjectId, ref: "User" }], //users who have contributed labels to the pin
    labels: [{ type: String }] // associated labels
});

module.exports = mongoose.model("Pin", PinSchema);
