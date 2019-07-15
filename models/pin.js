const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// each

const PinSchema = new Schema({

// all of the associated pin data from the pinterest API goes here...

// "al:ios:url": “pinterest://pin/765119424176215441",
//
// "locale": “en-US",
//
// "og:description": "Leonardo Albiero”,
//
// "og:image": "https://i.pinimg.com/736x/6f/3b/fe/6f3bfe2b9f35b109b561596f45ca88cc.jpg",
//
// "og:image:height": "829", "og:image:width": "564",
//
// "og:title": "Leonardo Albiero | Greek statue in 2019 | Vampire the masquerade bloodlines, Vampire art, Gothic vampire”,
//
// "og:type": “pinterestapp:pin"
//
// "og:updated_time": "2019-07-14 09:07:57”
//
// "og:url": "https://www.pinterest.com/pin/765119424176215441/"
//
// "theme-color": “#e60023”,
//
// "twitter:app:id:ipad": "429047995", "twitter:app:id:iphone": "429047995", "twitter:app:url:googleplay": "pinterest://pin/765119424176215441", "twitter:app:url:ipad": "pinterest://pin/765119424176215441", "twitter:app:url:iphone": "pinterest://pin/765119424176215441", "twitter:card": “summary_large_image"
//
// "twitter:description": "Leonardo Albiero",
//
// "twitter:image:src": "https://i.pinimg.com/736x/6f/3b/fe/6f3bfe2b9f35b109b561596f45ca88cc.jpg"

// Attribute	Type	Description
// id	string	The unique string of numbers and letters that identifies the Pin on Pinterest.
// link	string	The URL of the webpage where the Pin was created.
// url	string	The URL of the Pin on Pinterest.
// creator	map<string,string>	The first and last name, ID and profile URL of the user who created the board.
// board	board	The board that the Pin is on.
// created_at	string in ISO 8601 format	The date the Pin was created.
// note	string	The user-entered description of the Pin.
// color	string	The dominant color of the Pin’s image in hex code format.
// counts	map<string,i32>	The Pin’s stats, including the number of repins, comments.
// media	map<string,string>	The media type of the Pin (image or video).
// attribution	map<string,string>	The source data for videos, including the title, URL, provider, author name, author URL and provider name.
// image	map<string,image>	The Pin’s image. The default response returns the image’s URL, width and height.
// metadata	map<string,object>	Extra information about the Pin for Rich Pins. Includes the Pin type (e.g., article, recipe) and related information (e.g., ingredients, author).

  labels: [{ type: Schema.Types.ObjectId, ref: "Label" }]
});

module.exports = mongoose.model("Pin", PinSchema);
