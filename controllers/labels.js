
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


// when someone types a label, the label could already exist in the database
// if the label already exists in the database, the given label could already have the pin's reference
// in its pins array

// Model.insertMany()
//
// Parameters
//
// doc(s) «Array|Object|*»
// [options] «Object» see the mongodb driver options
// [options.ordered «Boolean» = true] if true, will fail fast on the first error encountered. If false, will insert all the documents it can and report errors later. An insertMany() with ordered = false is called an "unordered" insertMany().
// [options.rawResult «Boolean» = false] if false, the returned promise resolves to the documents that passed mongoose document validation. If true, will return the raw result from the MongoDB driver with a mongoose property that contains validationErrors if this is an unordered insertMany.
// [callback] «Function» callback
// Returns:
//
// «Promise»
// Shortcut for validating an array of documents and inserting them into MongoDB if they're all valid. This function is faster than .create() because it only sends one operation to the server, rather than one for each document.
//
// Mongoose always validates each document before sending insertMany to MongoDB. So if one document has a validation error, no documents will be saved, unless you set the ordered option to false.
//
// This function does not trigger save middleware.
//
// This function triggers the following middleware.
//
// insertMany()
// Example:
//
// var arr = [{ name: 'label' pin: pin }, { name: 'label2' pin: pin }, { name: 'label3' pin: pin }];
// Movies.insertMany(arr, function(error, docs) {});

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

    app.get("/remove/:label", (req, res) => {
            let id;
            let currentUser = req.user;
            let index;

            if (currentUser){
                id = currentUser._id
            }
            console.log(id)

            User.findOne( { _id : id } ).then( user => {

                if (user){
                    index = user.pinIndex
                    label_name = req.url.split("/").pop()
                }

                console.log(index, label_name)
                Pin.findOne( { pinIndex : index } ).then( pin => {
                    console.log(pin)
                    if(pin){

                    for (let i = 0; i < pin.labels.length; i++) {
                        if (pin.labels[i] == label_name){
                        let popped_label = pin.labels.splice(i, 1)
                            console.log("popped " + popped_label)
                        }
                    }
                    pin.save().then( pin => {
                    Label.findOne({name: label_name, pin: pin} ).then( label => {
                        console.log(label)
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



// io.on('connection', function(socket){
//   socket.on('add label', function(label){
//       if (label != "" && label != ""){
//           console.log(label)
//           // User.find() (pass in the currentUser)
//           // get the user's current picture index
//           // Picture.find() (pass in the picture index)
//           // check the current picture's labels and ensure the label is unique to the picture and not an empty string
//                       Picture.findOne().then(
//                       picture => {
//                         console.log(picture.name)
//                           picture.labels.push(label)
//                           picture.save()
//                       })
//                   }
//
//     console.log(socket.id +' message: ' + label);
//     io.emit('add label', label);
//   });
// });
// }
