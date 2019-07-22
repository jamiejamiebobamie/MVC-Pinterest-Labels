const jwt = require('jsonwebtoken');
const User = require("../models/user");





module.exports = app => {

    function getData(title,data,target,stop){
        let shiftEnd
        if (title){
            shiftEnd = 0
        } else {
            shiftEnd = 1
        }
        const len_target = target.length
        console.log(len_target)
        var descriptionIndex = parseInt(fss.indexOf(data, target,0,1))+len_target;
        var shift = parseInt(fss.indexOf(data, stop ,descriptionIndex,1))-shiftEnd;
        return data.slice(descriptionIndex,shift)
    }


    // INDEX // display current pin the user left-off on...
    // primary pin-labelling functionality.
    // pins are pulled from database and referenced by index.
        app.get('/', (req, res) => {
            let id;
            let pictureURL = "/images/missing_image.png";
            let admin;
            const currentUser = req.user;
            console.log(currentUser)
            if (currentUser){
                id = currentUser._id
            }
            User.findOne({_id: id}).then( user => {
                if (user){
                    admin = user.admin
                }
                console.log(user, currentUser,admin)
                res.render('main', {currentUser, pictureURL, admin});
            })
        });

    // get new pin route
    // displays last added pin at top: enlarged and with stats
    // display pins in database
    app.get("/admin", (req,res)=> {
        let admin = true
        const currentUser = req.user;
        res.render("admin", {currentUser, admin})
    });

    // add new pin to database
    // redirects to /admin page
    app.get("/add-pins", (req,res)=> {
        // NOTE: Change this route to get '/new' to add pins to the database
        // before calling the api check to see if the user is authorized: admin == true
        // if authorized, get the pin data:

    //     locale: { type: String }, // "locale": “en-US",
    //     description: { type: String }, // "og:description": "Leonardo Albiero”,
    //     imageURL: { type: String, unique: true }, // "og:image": "https://i.pinimg.com/736x/6f/3b/fe/6f3bfe2b9f35b109b561596f45ca88cc.jpg",
    //     imageHeight: { type: Number }, // "og:image:height": "829",
    //     imageWidth: { type: Number }, // "og:image:width": "564",
    //     title: { type: String }, // "og:title": "Leonardo Albiero | Greek statue in 2019 | Vampire the masquerade bloodlines, Vampire art, Gothic vampire”,
    //     color: { type: String }, // "theme-color": “#e60023”,
    //
    // // Some of these fields are returned as empty strings when the API is called.
    // // Empty strings are not stored.
    //     pinterestUrl: { type: String }, // pinterestUrl	string	The URL of the Pin on Pinterest.
    //     pinterestNote: { type: String }, // pinterestNote	string	The user-entered description of the Pin.
    //     pinterestId: { type: String }, // pinterestId	string	The unique string of numbers and letters that identifies the Pin on Pinterest.
    //     pinterestLink: { type: String }, // pinterestLink	string	The URL of the webpage where the Pin was created.
    //
    //     contributors: [{ type: Schema.Types.ObjectId, ref: "User" }], //users who have contributed labels to the pin
    //     labels: [{ type: Schema.Types.ObjectId, ref: "Label" }] // associated labels

        // add get the newPinIndex, and increment it by one
        // (as only admisn have this and at most that'll probably just be me)

    // newPinIndex: {type: Number}, // global variable that keeps track of the highest pin index. (the highest "page" number)

        let title;
        let hexCode;
        let locale;
        let description;
        let pictureURL;
        let imgWidth;
        let imgHeight;
        let target;
        let admin;

        request = require('request');

        request("https://api.pinterest.com/v1/me/pins/?access_token=" + process.env.A_TOKEN, function(error, response, body) {

            current_info = JSON.parse(body);
            console.log(current_info)

            if (!current_info.message) {
                current_url = current_info.data[2].url
                request.get(current_url, function(error,response,data) {
                    const text = data

                    target =  "\"og:title\": \""
                    title = getData(true, text, target, "\",") // Edited this to attempt to get the last character in the string
                    console.log(title)

                    target = "\"dominant_color\": \""
                    hexCode = getData(false,text, target, ",")
                    console.log(hexCode)

                    target = "\"locale\": \""
                    locale = getData(text, target, ",")
                    console.log(locale)

                    target = "\"og:description\": \""
                    description = getData(false,text, target, ",") // the stop character is incorrect here.
                    console.log(description)

                    target = "og:image\" name=\"og:image\" content=\""
                    pictureURL = getData(false,text,target,">")
                    console.log(pictureURL)

                    target = "og:image:width\": \""
                    imgWidth = getData(false,text,target,",")
                    console.log(imgWidth)

                    target = "og:image:height\": \""
                    imgHeight = getData(false,text,target,",")
                    console.log(imgHeight)
                });
            } else {
                pictureURL = "/images/missing_image.png"
            }
                const currentUser = req.user;
                if (currentUser){
                console.log(currentUser)
                User.findOne({ _id: currentUser._id }).then ( user => {
                    console.log(user, user.username, user.password, user.admin)
                    if (user.admin == true) {
                        admin = true;
                    } else {
                        admin = false;
                    }
                res.redirect("/add-pins")
                });
            } else {
                res.render('main', {currentUser, pictureURL, admin});
            }
        });
    });

};
