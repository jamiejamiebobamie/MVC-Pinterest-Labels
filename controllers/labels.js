
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
        console.log("fire"+req.body.labels)
        let labels = Array.from(new Set(req.body.labels.split(" ")))

        if (currentUser){
            id = currentUser._id
        }

        User.findOne( { _id : id } ).then( user => {

            if (user){
                index = user.pinIndex
            }

            Pin.findOne( { pinIndex: index } ).then( pin => {

                    for (let i = 0; i < labels.length; i++){
                        console.log(i,labels.length, labels, labels[i])

                            Label.findOne( { name: labels[i] } ).then( label => {
                                console.log("returned label " + label)
                                if (label) {
                                    console.log(label)
                                    pinPresentInArray = false
                                    for (let j = 0; j < label.pins.length; j++){
                                        console.log(typeof pin, typeof label.pins[j], (label.pins[j] == pin))
                                        if (label.pins[j] === pin){
                                            console.log("ice crystal")
                                            pinPresentInArray = true
                                        }
                                    }
                                    if (!pinPresentInArray) {
                                        label.pins.push(pin)
                                        label.save()
                                    }
                                } else {
                                    new_label = new Label()
                                    new_label.name = labels[i];
                                    new_label.pins.push(pin)
                                    new_label.save()
                                }
                            });
                        }
                    pinLabels = new Set(pin.labels)
                    labels = new Set(labels)
                    unionOfLabels = union(pinLabels, labels)
                    console.log(pinLabels, labels)
                    console.log(unionOfLabels)
                    newArrayFromUnion = Array.from(unionOfLabels)
                    pin.labels = newArrayFromUnion
                    console.log(unionOfLabels, newArrayFromUnion)
                    pin.save().then((pin) => {
                            res.redirect("/")
                        })
                    });
                });
        });

        // app.post("/labels", (req, res) => {
        //     let id;
        //     let currentUser = req.user;
        //     let index;
        //     labels = Array.from(new Set(req.body.labels.split(" ")))
        //     if (currentUser){
        //         id = currentUser._id
        //         console.log(id)
        //     }
        //     console.log(currentUser)
        //     User.findOne({_id : id}).then(user => {
        //         if (user){
        //             index = user.pinIndex
        //             console.log(index)
        //         }
        //         Pin.findOne({pinIndex: index}).then( pin => {
        //             console.log(pin)
        //             for (let i = 0; i < labels.length; i++){
        //                     Label.findOne({name: labels[i]}).then(label => {
        //                         if(label) {
        //                             checkIfLabelIsOnPin = false
        //                             for (let i = 0; i < pin.labels.length; i++){
        //                                 if (label == pin.labels[i]) {
        //                                     checkIfLabelIsOnPin = true
        //                                     break
        //                                 }}
        //                             if (!checkIfLabelIsOnPin){
        //                                 pin.labels.push(label) // label exists, but isn't assigned to that pin
        //                             }
        //                         } else {
        //                             new_label = new Label()
        //                             new_label.name = labels[i];
        //                             new_label.pins.push(pin)
        //                             new_label.save()
        //                         }
        //                     })
        //                 }
        //                 pin.save().then((pin) => {
        //                     res.redirect("/")
        //                 })
        //
        //             })
        //         })
        //     });

};
