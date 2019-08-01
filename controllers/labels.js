
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


app.post("/labels", (req, res) => {
    const ALPHA_NUMERIC_LOOKUP = new Set("abcdefghijklmnopqrstuvwxyz1234567890".split(""))

        let id;
        let currentUser = req.user;
        let index;

        let new_labels = {}

        let inputLabels = Array.from(new Set(req.body.labels.toLowerCase().split(" ")))
        console.log(inputLabels, inputLabels[0].length)

        let current_label;

        if (currentUser){
            id = currentUser._id
        }

        User.findOne( { _id : id } ).then( user => {

            if (user){
                index = user.pinIndex
            }

            Pin.findOne( { pinIndex: index } ).then( pin => {

                if (pin) {
                    for(let i = 0; i < inputLabels.length; i++){
                        new_string = ""
                        if (inputLabels[i].length > 0){
                        for (let j = 0; j < inputLabels[i].length; j++){
                            if (ALPHA_NUMERIC_LOOKUP.has(inputLabels[i][j])){
                                new_string+=inputLabels[i][j]
                            }
                        }
                        if (new_string == ""){
                            console.log('spliced')
                            inputLabels.splice(i,1)
                        } else {
                            console.log(new_string)
                            inputLabels[i] = new_string;
                        }
                    }
                }
                if (inputLabels[0].length > 0) { // this is the main thing that matters
                                                 // refactor around this


                let arr = [];
                for (let i = 0; i < inputLabels.length; i++){
                        arr.push({name: inputLabels[i], pin: pin})
                    }

                Label.insertMany(arr, {ordered:false}).then(() => {
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
                    res.redirect("/next")
                }
            } else {
                    res.redirect("/next")
                }
                });
        });
    });

    app.get("/mobile/:label", (req, res) => {

            const LABEL_LOOKUP = ["male", "female", "monster", "environment"]
            console.log(LABEL_LOOKUP)

            let id;
            let currentUser = req.user;
            let index;

            let labels // an array of one or two items

            let pinLabels
            let inputLabels
            let unionOfLabels
            let newArrayFromUnion

            if (currentUser){
                id = currentUser._id
            }

            User.findOne( { _id : id } ).then( user => {

                if (user){
                    index = user.pinIndex
                    labels = req.url.split("/").pop().split("+")
                    console.log("labels are ", labels)
                    console.log(labels[0], labels[0] == "next", labels[0] == "previous", labels[0] != "next" && labels[0] != "previous")
                } else {
                    res.redirect("/login")
                }

                if (labels[0] != "next" && labels[0] != "previous") {

                Pin.findOne( { pinIndex: index } ).then( pin => {

                    if (pin) {
                        pinLabels = pin.labels
                    }

                    let arr = [];
                    for (let i = 0; i < labels.length; i++){
                        if (LABEL_LOOKUP.includes(labels[i])) {
                            arr.push({name: labels[i], pin: pin})
                            console.log("inserting ", labels[i])
                        }
                    }

                    console.log("actually insterting", arr)

                    Label.insertMany(arr, {ordered:false}).then(() => {
                        pinLabels = new Set(pinLabels)
                        inputLabels = new Set(labels)
                        unionOfLabels = union(pinLabels, inputLabels)
                        newArrayFromUnion = Array.from(unionOfLabels)
                        pin.labels = newArrayFromUnion
                        pin.save().then((pin) => {
                                user.pinIndex += 1 // need to increment the user's pin index
                                user.save().then(() => {
                                    res.redirect("/mobile")
                                })
                            })
                        });
                    });
                } else {
                    if (labels[0] == "next") {
                    user.pinIndex += 1 // need to increment the user's pin index
                    user.save().then(() => {
                        res.redirect("/mobile")
                    })
                    } else if ( labels[0] == "previous") {
                    console.log("hello previous")
                    user.pinIndex -= 1 // need to increment the user's pin index
                    user.save().then(() => {
                        res.redirect("/mobile")
                    })
                }}
            });
    });

// as a string is passed in through the url and then used to look up the respective pin,
// labels with foriegn characters cannot be deleted from the database...

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
