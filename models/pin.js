const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// each

const PinSchema = new Schema({

// all of the associated pin data from the pinterest API goes here...

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
