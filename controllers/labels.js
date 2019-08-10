
const Label = require("../models/label");
const Pin = require("../models/pin");
const User = require("../models/user");

// from: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set
function union(setA, setB) {
    var _union = new Set(setA);
    for (var elem of setB) {
        _union.add(elem);
    }
    return _union;
}

module.exports = app => {

    // POST labels route, desktop :: creates new documents of the Label schema and inserts them into the database
    // this route is not optimized, but the label documents in general might be removed in later versions of the site
    // in favor of the labels string array that every pin document contains
    app.post("/labels", (req, res) => {
        const ALPHA_NUMERIC_LOOKUP = new Set("abcdefghijklmnopqrstuvwxyz1234567890".split(""))

        let id;
        let currentUser = req.user;
        let index;

        let inputLabels = Array.from(new Set(req.body.labels.toLowerCase().split(" ")))

        if (currentUser){
            id = currentUser._id
        }

        User.findOne( { _id : id } ).then( user => {

            if (user){
                index = user.pinIndex
            } else {
                // sometimes the user's session expires.
                // if this occurs, redirect to the login page.
                return res.redirect('/login')
            }

            Pin.findOne( { pinIndex: index } ).then( pin => {

                if (pin) {
                    // an attempt to sanitize the input of all labels
                    // to only include labels of chars a-z
                    // DOES NOT WORK!
                    // empty strings "", foreign characters, and symbols (#&%) are still being added.
                    for(let i = 0; i < inputLabels.length; i++){
                        new_string = ""
                        if (inputLabels[i].length > 0){
                            // iterate through the string and add characters that are in the lookout to new_string
                            for (let j = 0; j < inputLabels[i].length; j++){
                                if (ALPHA_NUMERIC_LOOKUP.has(inputLabels[i][j])){
                                    new_string+=inputLabels[i][j]
                                }
                            }
                            // if new_string is not an empty string: ""
                            if (new_string == ""){
                                inputLabels.splice(i,1)
                            } else {
                            // set the item in the inputLabels array to be the sanitzied string
                                inputLabels[i] = new_string;
                            }
                        }
                    }

                // if at the end of the day the first entry of the inputLabels array is not an empty string
                // create a new array of label objects
                if (inputLabels[0].length > 0) {
                    let arr = [];
                    for (let i = 0; i < inputLabels.length; i++){
                        arr.push({name: inputLabels[i], pin: pin})
                    }

                    // insert the label objects into the database
                    Label.insertMany(arr, {ordered:false}).then(() => {
                        // then add the strings from inputLabels to the pin object labels array of strings
                        pinLabels = new Set(pin.labels)
                        inputLabels = new Set(inputLabels)
                        unionOfLabels = union(pinLabels, inputLabels)
                        newArrayFromUnion = Array.from(unionOfLabels)
                        pin.labels = newArrayFromUnion
                        pin.save().then((pin) => {
                                res.redirect("/next")
                            })
                        });
                    } else {
                        // if the user attempts to enter an empty string "" do not add the label
                        // and redirect to the next pin object / index.
                        res.redirect("/next")
                    }
                } else {
                    // if users attempt to add labels to a deleted pin object / index.
                    // redirect to the next pin
                    res.redirect("/next")
                }
            });
        });
    });

    // POST labels route, mobile :: creates new documents of the Label schema and inserts them into the database
    // redirects to either the next pin or the previous pin depending on the input
    // this website is for personal use and was made in the span of a couple of weeks
    // many of the routes (like this one) do not adhere to good standards
    app.get("/mobile/:label", (req, res) => {

            const LABEL_LOOKUP = ["male", "female", "monster", "environment"]

            let id;
            let currentUser = req.user;
            let index;

            let labels              // an array of one or two items taken from the url: "/mobile/:label"
            let pinLabels           // a set of the labels already present in the pin document's labels array
            let inputLabels         // a set of the 'labels' variable (an array)
            let unionOfLabels       // a set of the union of the pinLabels and the inputLabels
            let newArrayFromUnion   // an array of the 'unionOfLabels' set

            if (currentUser){
                id = currentUser._id
            }

            User.findOne( { _id : id } ).then( user => {

                if (user){
                    index = user.pinIndex
                    // this is probably a security vulnerability
                    // or at the very least the most hack-ey way of doing this:
                    labels = req.url.split("/").pop().split("+")
                } else {
                    // sometimes the user's session expires.
                    // if this occurs, redirect to the login page.
                    res.redirect("/login")
                }

                if (labels[0] != "next" && labels[0] != "previous") {

                    Pin.findOne( { pinIndex: index } ).then( pin => {

                        if (pin) {
                            pinLabels = pin.labels
                        }
                        // create a new array of label objects
                        let arr = [];
                        for (let i = 0; i < labels.length; i++){
                            if (LABEL_LOOKUP.includes(labels[i])) {
                                arr.push({name: labels[i], pin: pin})
                            }
                        }
                        // insert the label objects into the database
                        Label.insertMany(arr, {ordered:false}).then(() => {
                            // then add the strings from inputLabels to the pin object labels array of strings
                            pinLabels = new Set(pinLabels)
                            inputLabels = new Set(labels)
                            unionOfLabels = union(pinLabels, inputLabels)
                            newArrayFromUnion = Array.from(unionOfLabels)
                            pin.labels = newArrayFromUnion
                            pin.save().then((pin) => {
                                user.pinIndex += 1
                                user.save().then(() => {
                                    res.redirect("/mobile")
                                })
                            })
                        });
                    });
                } else {
                    // if the label is "next" increment the pin index by one
                    if (labels[0] == "next") {
                        user.pinIndex += 1 // need to increment the user's pin index
                        user.save().then(() => {
                            res.redirect("/mobile")
                        })
                    // if the label is "previous" increment the pin index by minus one
                    } else if ( labels[0] == "previous") {
                        user.pinIndex -= 1
                        user.save().then(() => {
                            res.redirect("/mobile")
                        })
                    }
                }
        });
    });

// GET route to delete a label document from the database
// a string is passed in using the route's url and then used to look up the respective label,
// labels with foriegn characters cannot be deleted from the database...
// THIS ROUTE IS BROKEN!
// ALL LABELS IN THE DATABASE ARE BEING DELETED
    app.get("/remove/:label", (req, res) => {
            let id;
            let currentUser = req.user;
            let index;

            if (currentUser){
                id = currentUser._id
            }

            User.findOne( { _id : id } ).then( user => {

                if (user){
                    index = user.pinIndex
                    label_name = req.url.split("/").pop()
                } else {
                    return res.redirect('/login')
                }

                Pin.findOne( { pinIndex : index } ).then( pin => {
                    if(pin){

                        for (let i = 0; i < pin.labels.length; i++) {
                            if (pin.labels[i] == label_name){
                                let popped_label = pin.labels.splice(i, 1)
                            }
                        }

                        pin.save().then( pin => {
                        Label.findOne({name: label_name, pin: pin} ).then( label => {
                            // FOR SOME REASON THIS IS DELETING EVERY LABEL IN THE DATABASE!!
                             Label.remove( label ).then(() => {
                                 res.redirect("/")
                                })
                            })
                        })
                    }
                })
            });
        });

};
