
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
        let id;
        let currentUser = req.user;
        let index;

        let new_labels = {}

        let inputLabels = Array.from(new Set(req.body.labels.split(" ")))

        let current_label;

        if (currentUser){
            id = currentUser._id
        }

        User.findOne( { _id : id } ).then( user => {

            if (user){
                index = user.pinIndex
            }

            Pin.findOne( { pinIndex: index } ).then( pin => {

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
                            res.redirect("/")
                        })
                    });
                });
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
