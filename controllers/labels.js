
const Label = require("../models/label");

const Pin = require("../models/pin");

const User = require("../models/user");

module.exports = app => {
// CREATE

// get a reference to the current pin.
// check to see if the labels exist in the database.
// if the label doesn't exist, create it and push the pin reference into the new_label.pin array
// if the label does exist check to see if the current pin is in the label.pin array
    // if it does not exist in the array, add it.
// use a set method to add the new labels to the pin's existing labels string-array

// don't forget to save the new_label object, the label object, and/or the pin object.

        app.post("/labels", (req, res) => {
            let id;
            let currentUser = req.user;
            let index;
            labels = Array.from(new Set(req.body.labels.split(" ")))
            if (currentUser){
                id = currentUser._id
                console.log(id)
            }
            console.log(currentUser)
            User.findOne({_id : id}).then(user => {
                if (user){
                    index = user.pinIndex
                    console.log(index)
                }
                Pin.findOne({pinIndex: index}).then( pin => {
                    console.log(pin)
                    for (let i = 0; i < labels.length; i++){
                            Label.findOne({name: labels[i]}).then(label => {
                                if(label) {
                                    checkIfLabelIsOnPin = false
                                    for (let i = 0; i < pin.labels.length; i++){
                                        if (label == pin.labels[i]) {
                                            checkIfLabelIsOnPin = true
                                            break
                                        }}
                                    if (!checkIfLabelIsOnPin){
                                        pin.labels.push(label) // label exists, but isn't assigned to that pin
                                    }
                                } else {
                                    new_label = new Label()
                                    new_label.name = labels[i];
                                    new_label.pins.push(pin)
                                    new_label.save()
                                }
                            })
                        }
                        pin.save().then((pin) => {
                            res.redirect("/")
                        })

                    })
                })
            });

};
