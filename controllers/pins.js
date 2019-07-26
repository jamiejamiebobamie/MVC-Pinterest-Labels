const jwt = require('jsonwebtoken');
const User = require("../models/user");
const Pin = require("../models/pin");
const Label = require("../models/label")
const fss = require('fast-string-search');
const cheerio = require('cheerio');
const request = require('request');

module.exports = app => {

    // from: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set
    function union(setA, setB) {
        var _union = new Set(setA);
        for (var elem of setB) {
            _union.add(elem);
        }
            return _union;
        }

    // INDEX // display current pin the user left-off on...
    // primary pin-labelling functionality.
    // pins are pulled from database and referenced by index.
        app.get('/', (req, res) => {

            let id;
            let admin;
            let pinIndex;
            const admin_page = false;
            const currentUser = req.user;

            if (currentUser){
                id = currentUser._id
            }

            User.findOne({_id: id}).then( user => {

                if (user){
                    admin = user.admin
                    pinIndex = user.pinIndex
                }

                Pin.findOne({pinIndex : pinIndex}).then( pin => {
                    res.render('main', {currentUser, pin, admin, admin_page, pinIndex});
                });
            });
        });

        // INDEX -- See the next pin
        app.get('/next', (req, res) => {
            const ALPHA_NUMERIC_LOOKUP = new Set("abcdefghijklmnopqrstuvwxyz1234567890".split(""))
            const admin_page = false;
            let id;
            let pinIndex;
            const currentUser = req.user;

            let new_string;

            if (currentUser){
                id = currentUser._id
            }

            User.findOne({_id: id}).then( user => {

                if (user){
                    User.findOne( { admin : true } ).then( administrator => {
                    pinIndex = user.pinIndex
                    highestIndex = administrator.newPinIndex
                    if (pinIndex + 1 <= highestIndex){
                        pinIndex += 1
                        user.pinIndex = pinIndex
                    } else {
                        pinIndex = 1
                        user.pinIndex = pinIndex
                    }
                    user.save()
                    });
                }

                Pin.findOne( { pinIndex : user.pinIndex } ).then( pin => {
                    if (pin){
                    if (pin.labels.length == 0) {
                        array = Array.from(new Set(pin.title.toLowerCase().split(" ")));
                        for(let i = 0; i < array.length; i++){
                            new_string = ""
                            if (array[i].length > 0){
                            for (let j = 0; j < array[i].length; j++){
                                if (ALPHA_NUMERIC_LOOKUP.has(array[i][j])){
                                    new_string+=array[i][j]
                                }
                            }
                            if (new_string == ""){
                                array.splice(i,1)
                            } else {
                                array[i] = new_string;
                            }

                        }
                    }
                        // checks for an array of a single empty string
                        if (array.length >= 1 && array[0].length >= 1){

                        pin.labels = array;
                        let labels = []
                        for (let i = 0; i < array.length; i++){
                            labels.push({name:array[i], pin: pin})
                        }
                        labels.push({name: pin.hexCode, pin: pin})
                        pin.save().then( () => {
                            Label.insertMany(labels, {ordered:false}).then(() => {
                                        res.redirect("/")
                                    })
                                });
                        } else {
                            res.redirect('/');
                        }
                            } else {
                            res.redirect('/');
                        }
                    } else {
                        res.redirect('/');
                    }
                })
                });
            });

        // INDEX -- See the previous pin
        app.get('/previous', (req, res) => {

            const ALPHA_NUMERIC_LOOKUP = new Set("abcdefghijklmnopqrstuvwxyz1234567890".split(""))

            const admin_page = false;
            let id;
            let pinIndex;
            const currentUser = req.user;
            let new_string

            if (currentUser){
                id = currentUser._id
            }

            User.findOne({_id: id}).then( user => {

                if (user){
                    User.findOne( { admin : true } ).then( administrator => {
                    pinIndex = user.pinIndex
                    highestIndex = administrator.newPinIndex
                    if (pinIndex > 1){
                        pinIndex -= 1
                        user.pinIndex = pinIndex
                    } else {
                        user.pinIndex = highestIndex
                    }
                    user.save()
                    });
                }

                Pin.findOne( { pinIndex : user.pinIndex } ).then( pin => {
                    if (pin){

                    if (pin.labels.length == 0) {
                        array = Array.from(new Set(pin.title.toLowerCase().split(" ")));
                        for(let i = 0; i < array.length; i++){
                            new_string = ""
                            if (array[i].length > 0){
                            for (let j = 0; j < array[i].length; j++){
                                if (ALPHA_NUMERIC_LOOKUP.has(array[i][j])){
                                    new_string+=array[i][j]
                                }
                            }
                             if (new_string == ""){
                                array.splice(i,1)
                            } else {
                                array[i] = new_string;
                            }            // otherwise remove element from array or (better) don't add element to new array
                        }
                    }

                        // checks for an array of a single empty string
                        if (array.length >= 1 && array[0].length >= 1){

                        pin.labels = array;
                        let labels = []
                        for (let i = 0; i < array.length; i++){
                            labels.push({name:array[i], pin: pin})
                        }
                        labels.push({name: pin.hexCode, pin: pin})
                        pin.save().then( () => {
                            Label.insertMany(labels, {ordered:false}).then(() => {
                                        res.redirect("/")
                                    })
                                });
                        } else {
                            res.redirect('/');
                        }} else {
                            res.redirect('/');
                        }
                    } else {
                        res.redirect('/');
                    }
                })
                });
            });

    // get admin page
    // displays last added pin at top: enlarged and with stats
    // display pins in database
    app.get("/admin", (req,res)=> {
        const admin = true
        const admin_page = true;
        const currentUser = req.user;
        let latestPinIndex;
        let id;


        if (currentUser){
            id = currentUser._id
        }

        User.findOne({_id: id}).then( user => {

            if (user){
                latestPinIndex = user.newPinIndex
            }

            Pin.find().then( pins => {
                Pin.findOne( { pinIndex: latestPinIndex } ).then( latestPin => {
                    slicedPins = pins.slice(0,pins.length-1);
                    pins = slicedPins.reverse();
                    res.render("admin", {currentUser, admin, admin_page, pins, latestPin})
                });
            });
        });
    });



    app.get("/add-pins", (req,res)=> {

        // store the 'next' URL as an admin variable
        // how often to call it / how many pins can i store at a time?
        // also using the next URL doesn't provide me with another next url...

        let pins = [];
        let pullPinIndex; // the index to pull from on pinterest.
        const currentUser = req.user;
        const admin = true;
        let current_info;
        let info;
        let next;
        let index;

        if (currentUser){

            User.find({ admin: true }).then ( users => {
                if (users){
                    next = users[0].next
                    pullPinIndex = users[0].pullPinIndex
                }

        if (next){

            request(next+"&fields=note,color,url,image", function(error,response,body) {
                current_info = JSON.parse(body);

                if (!current_info.message) {

                        info = current_info.data
                        next = current_info.page.next

                    for (let i = 0; i < info.length; i++) {

                        if (users[0].freeIndices.length > 0){

                            for (let j = 0; j < users.length; j++){
                                pinIndex = users[j].freeIndices.pop() // what if this is for whatever reason different among admins?
                                users[j].pullPinIndex += 1
                                // users[j].save()
                            }

                        } else {

                            for (let k = 0; k < users.length; k++){
                                pinIndex = users[k].newPinIndex
                                pinIndex += 1
                                users[k].newPinIndex = pinIndex
                                users[k].pullPinIndex += 1
                                // users[k].save()
                            }

                        }
                        pins.push( { pinIndex: pinIndex, title: info[i].note, hexCode: info[i].color, imgWidth: info[i].image.original.width, imgHeight: info[i].image.original.height, imgUrl: info[i].image.original.url, pinterestUrl: info[i].url } )
                    }

                    for (let l = 0; l < users.length; l++){
                        users[l].next = next;
                        users[l].save()
                    }

                    Pin.insertMany(pins, {ordered:false}).then(() => {
                        res.redirect("/admin")
                 });
            } else {

                if (current_info.message){
                    console.log(current_info.message)
                }

                res.redirect("/admin")
            }

            })

        } else {
            next = "https://api.pinterest.com/v1/me/pins/?access_token=" + process.env.A_TOKEN
            request(next+"&fields=note,color,url,image", function(error,response,body) {
                current_info = JSON.parse(body);

                if (!current_info.message) {

                        info = current_info.data
                        next = current_info.page.next

                    for (let i = 0; i < info.length; i++) {

                        if (users[0].freeIndices.length > 0){

                            for (let j = 0; j < users.length; j++){
                                pinIndex = users[j].freeIndices.pop() // what if this is for whatever reason different among admins?
                                users[j].pullPinIndex += 1
                                // users[j].save()
                            }

                        } else {

                            for (let k = 0; k < users.length; k++){
                                pinIndex = users[k].newPinIndex
                                pinIndex += 1
                                users[k].newPinIndex = pinIndex
                                users[k].pullPinIndex += 1
                                // users[k].save()
                            }

                        }
                        pins.push( { pinIndex: pinIndex, title: info[i].note, hexCode: info[i].color, imgWidth: info[i].image.original.width, imgHeight: info[i].image.original.height, imgUrl: info[i].image.original.url, pinterestUrl: info[i].url } )
                    }

                    for (let l = 0; l < users.length; l++){
                        users[l].next = next;
                        users[l].save()
                    }

                    Pin.insertMany(pins, {ordered:false}).then(() => {
                        res.redirect("/admin")
                 });
            } else {

                if (current_info.message){
                    console.log(current_info.message)
                }

                res.redirect("/admin")
            }
        })
    }
 });
}
  });


     // DELETE THE PIN AND INDEX FROM DATABASE
     app.get('/delete/:index', (req, res) => {

         const admin_page = false;
         let id;
         let index;
         const currentUser = req.user;

         if (currentUser){
             id = currentUser._id
         }

         User.findOne({_id: id}).then( user => {
             if (user){
                 User.find( { admin : true } ).then( administrators => {
                 index = user.pinIndex
                 if (index){
                     for (let i = 0; i < administrators.length; i++) {
                        notPresent = true;
                        for (let j = 0; j < administrators[i].freeIndices.length; j++){
                            if (index == administrators[i].freeIndices[j]){
                                notPresent = false
                                break
                            }
                        }
                        if (notPresent){
                            administrators[i].freeIndices.push(index)
                            administrators[i].save()
                        }
                     }
                 }
                     Pin.findOne( { pinIndex : index } ).then( pin => {
                         if (pin){
                                 Label.remove( {pin: pin._id} ).then(() => {
                                     Pin.remove({ pinIndex : index }).then(() => {
                                         res.redirect('/');
                                     })
                             })
                         } else {
                             res.redirect('/');
                         }
                     });
                 });
                }
            });
        });

        app.get('/edit/:id', (req, res) => {

            let id;
            let admin;
            let pinIndex;
            const admin_page = false;
            const currentUser = req.user;

            if (currentUser){
                id = currentUser._id
            }

            User.findOne({_id: id}).then( user => {

                if (user){
                    admin = user.admin
                    pinIndex = user.pinIndex
                }

                Pin.findOne({pinIndex : pinIndex}).then( pin => {
                    res.render('edit_info', {currentUser, pin, admin, admin_page, pinIndex});
                });
            });
            });

        app.get('/submit_edit/:pinIndex', (req, res) => {
            let title = req.url.split("=").pop().replace(/\+/g, " ")
            let flagged = req.body

            let id;
            const currentUser = req.user;

            if (currentUser){
                id = currentUser._id
            }

            User.findOne({_id: id}).then( user => {
                Pin.findOne({pinIndex : user.pinIndex}).then( pin => {
                    pin.title = title
                    pin.flagged = false;
                    pin.save().then((pin) => {
                        res.redirect('/');
                    })
                });
            });
    });

        app.get('/goToPin/:index', (req, res) => {
            let index = req.url.split('/').pop()

            let id;
            let pinIndex;
            let admin = true;
            const admin_page = false;
            const currentUser = req.user;

            if (currentUser){
                id = currentUser._id
            }

            User.findOne({_id: id}).then( user => {

                if (user){
                    user.pinIndex = index
                    user.save()
                }

                Pin.findOne({pinIndex : index}).then( pin => {
                    res.redirect('/');
                });
            });
            });

        app.get('/flagPin/:index', (req, res) => {
            let index = req.url.split('/').pop()

                Pin.findOne({pinIndex : index}).then( pin => {
                    if (pin) {
                        pin.flagged = true;
                        pin.save()
                    }
                    res.redirect('/');
                });
            });

};
