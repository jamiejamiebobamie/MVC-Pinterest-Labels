const jwt = require('jsonwebtoken');
const User = require("../models/user");
const Pin = require("../models/pin");
const Label = require("../models/label")
const fss = require('fast-string-search');
const cheerio = require('cheerio');
const request = require('request');

module.exports = app => {

    // used to search the url html when adding a new pin
    // app.get('/add-pins')
    function getData(title,data,target,stop){
        let shiftEnd
        if (title){
            shiftEnd = 0
        } else {
            shiftEnd = 1
        }
        const len_target = target.length
        var descriptionIndex = parseInt(fss.indexOf(data, target,0,1))+len_target;
        var shift = parseInt(fss.indexOf(data, stop ,descriptionIndex,1))-shiftEnd;
        return data.slice(descriptionIndex,shift)
    }

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
            const admin_page = false;
            let id;
            let pinIndex;
            const currentUser = req.user;

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
                        array = Array.from(new Set(pin.title.split(" ")));
                        pin.labels = array;
                        let labels = []
                        for (let i = 0; i < array.length; i++){
                            labels.push({name:array[i], pin: pin})
                        }
                        labels.push({name: pin.hexCode, pin: pin})
                        console.log(labels)
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
                })
                });
            });

        // INDEX -- See the previous pin
        app.get('/previous', (req, res) => {

            const admin_page = false;
            let id;
            let pinIndex;
            const currentUser = req.user;

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
                        array = Array.from(new Set(pin.title.split(" ")));
                        pin.labels = array;
                        let labels = []
                        for (let i = 0; i < array.length; i++){
                            labels.push({name:array[i], pin: pin})
                        }
                        labels.push({name: pin.hexCode, pin: pin})
                        console.log(labels)
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

// add new pin to database
// redirects to /admin page

// experiment with iterating through the pages with while loop / calling the "next" page in the pinterest api successively.

// app.get("/add-pins", (req,res)=> {
//     let pinsArray = [];
//     let count = 5;
//     let pullPinIndex; // the index to pull from on pinterest.
//     const currentUser = req.user;
//     const admin = true;
//
//     let title;          //     title: { type: String }, // "og:title": "Leonardo Albiero | Greek statue in 2019 | Vampire the masquerade bloodlines, Vampire art, Gothic vampire”,
//     let hexCode;        //     color: { type: String }, // "theme-color": “#e60023”,
//     let locale;         //     locale: { type: String }, // "locale": “en-US",
//     let description;    //     description: { type: String }, // "og:description": "Leonardo Albiero”,
//     let imgUrl;         //     imgURL: { type: String, unique: true }, // "og:image": "https://i.pinimg.com/736x/6f/3b/fe/6f3bfe2b9f35b109b561596f45ca88cc.jpg",
//     let imgWidth;       //     imgWidth: { type: Number }, // "og:image:width": "564",
//     let imgHeight;      //     imgHeight: { type: Number }, // "og:image:height": "829",
//     let pinIndex;       //     pinIndex: { type: Number, unique: true }, // the index of the pin. starts at 0. used when accessing the pin in the app.
//     let pinterestUrl;   //     pinterestUrl: { type: String }, // pinterestUrl	string	The URL of the Pin on Pinterest.
//
//     let target; // the target string to look for when searching current_info
//
//     request = require('request');
//
//     if (currentUser){
//
//         User.find({ admin: true }).then ( users => {
//             if (users){
//                 pullPinIndex = users[0].pullPinIndex
//             }
//
//
//     request("https://api.pinterest.com/v1/me/pins/?access_token=" + process.env.A_TOKEN, function(error, response, body) {
//
//             let current_info = JSON.parse(body);
//             console.log(current_info)
//             // if the current_info has a message then the app has exceeded
//             // its rate limit on calls to Pinterest.
//             if (!current_info.message) {
//
//                 // while(count > 0)
//                 pinterestUrl = current_info.data[pullPinIndex].url // need to increment this index and keep track of it with the highestPinIndex variable.
//                                                         // pages return pins in increments of 25 (though this can be changed to 100).
//                                                         // need to figure out a way of using current_info.cursor or current_info.next(?)
//                                                         // to skip ahead to the correct pin once 25/100 pins are in the database.
//
//                 request.get(pinterestUrl, function(error,response,data) {
//                     const text = data
//
//                     target =  "\"og:title\": \""
//                     title = getData(true, text, target, "\",")
//                     console.log(title)
//
//                     target = "\"dominant_color\": \""
//                     hexCode = getData(false,text, target, ",")
//                     console.log(hexCode)
//
//                     target = "\"locale\": \""
//                     locale = getData(false, text, target, ",") // changed this to false
//                     console.log(locale)
//
//                     target = "\"og:description\": \""
//                     description = getData(false,text, target, ",")
//                     console.log(description)
//
//                     target = "og:image\" name=\"og:image\" content=\""
//                     imgUrl = getData(false,text,target,">")
//                     console.log(imgUrl)
//
//                     target = "og:image:width\": \""
//                     imgWidth = getData(false,text,target,",")
//                     console.log(imgWidth)
//
//                     target = "og:image:height\": \""
//                     imgHeight = getData(false,text,target,",")
//                     console.log(imgHeight)
//
//                             pinIndex = users[0].newPinIndex;
//
//                             const new_pin = new Pin()
//                             new_pin.title        = title
//                             new_pin.hexCode      = hexCode
//                             new_pin.locale       = locale
//                             new_pin.description  = description
//                             new_pin.imgUrl       = imgUrl
//                             new_pin.imgWidth     = imgWidth
//                             new_pin.imgHeight    = imgHeight
//                             new_pin.pinIndex     = pinIndex // setting this below
//                             new_pin.pinterestUrl = pinterestUrl
//                             new_pin.labels.push(hexCode)
//
//                             console.log(users[0].freeIndices,"amount of freeIndices",users[0].freeIndices.length > 0)
//                             // if users[i].freeIndices.length > 0
//                             // pop the last item in the array and use that as the pinIndex
//                                 // else increment the newPinIndex by one and use that as the pinIndex
//                             if (users[0].freeIndices.length > 0){
//
//                                 for (let i = 0; i < users.length; i++){
//                                     pinIndex = users[i].freeIndices.pop() // what if this is for whatever reason different among admins?
//                                     users[i].pullPinIndex += 1
//                                     users[i].save()
//                                     new_pin.pinIndex = pinIndex
//                                     console.log("popped" + pinIndex)
//                                 }
//                             } else {
//                                 for (let i = 0; i < users.length; i++){
//                                     pinIndex = users[i].newPinIndex
//                                     pinIndex += 1
//                                     users[i].newPinIndex = pinIndex
//                                     users[i].pullPinIndex += 1
//                                     users[i].save()
//                                     console.log("didn't pop" + pinIndex)
//                                 }
//                                 console.log("outside if/else statement" + pinIndex)
//                                 new_pin.pinIndex = pinIndex
//                             }
//                             new_pin.save().then( (new_pin) => {
//                                 console.log(new_pin)
//                                 const new_label      = Label()
//                                 new_label.name       = hexCode
//                                 new_label.pin        = new_pin
//                                 new_label.save().then(() => {
//                                         res.redirect("/admin")
//                                 })
//
//                             })
//                         });
//                     } else { res.redirect("/admin") };
//                 });
//         });
//         } else { res.redirect("/admin") }
//  });

    // add new pin to database
    // redirects to /admin page
    // app.get("/add-pins", (req,res)=> {
    //     let pullPinIndex; // the index to pull from on pinterest.
    //     const currentUser = req.user;
    //     const admin = true;
    //     let iterateThroughPagesNumber;
    //     let pageResults;
    //
    //     let title;          //     title: { type: String }, // "og:title": "Leonardo Albiero | Greek statue in 2019 | Vampire the masquerade bloodlines, Vampire art, Gothic vampire”,
    //     let hexCode;        //     color: { type: String }, // "theme-color": “#e60023”,
    //     let locale;         //     locale: { type: String }, // "locale": “en-US",
    //     let description;    //     description: { type: String }, // "og:description": "Leonardo Albiero”,
    //     let imgUrl;         //     imgURL: { type: String, unique: true }, // "og:image": "https://i.pinimg.com/736x/6f/3b/fe/6f3bfe2b9f35b109b561596f45ca88cc.jpg",
    //     let imgWidth;       //     imgWidth: { type: Number }, // "og:image:width": "564",
    //     let imgHeight;      //     imgHeight: { type: Number }, // "og:image:height": "829",
    //     let pinIndex;       //     pinIndex: { type: Number, unique: true }, // the index of the pin. starts at 0. used when accessing the pin in the app.
    //     let pinterestUrl;   //     pinterestUrl: { type: String }, // pinterestUrl	string	The URL of the Pin on Pinterest.
    //
    //     let target; // the target string to look for when searching current_info
    //
    //     request = require('request');
    //
    //     if (currentUser){
    //
    //         User.find({ admin: true }).then ( users => {
    //             if (users){
    //                 pullPinIndex = users[0].pullPinIndex
    //                 iteratorCount = pullPinIndex
    //             }
    //
    //
    //     request("https://api.pinterest.com/v1/me/pins/?access_token=" + process.env.A_TOKEN, function(error, response, body) {
    //
    //             let current_info = JSON.parse(body);
    //             console.log(current_info)
    //
    //             // if the current_info has a message then the app has exceeded
    //             // its rate limit on calls to Pinterest.
    //             if (!current_info.message) {
    //
    //                 // if the current pullPinIndex is greater than 25...
    //                 // move to the correct page of results
    //                 iterateThroughPagesNumber = Math.floor(pullPinIndex/25)
    //
    //                 console.log(iterateThroughPagesNumber, iterateThroughPagesNumber > 0)
    //
    //                 while (iterateThroughPagesNumber > 0) {
    //                     request(current_info.page.next, function(error,response,data) {
    //                         current_info = JSON.parse(data);
    //                         console.log(iterateThroughPagesNumber,current_info)
    //                      })
    //                      iterateThroughPagesNumber -=1
    //                 }
    //                 while (iteratorCount < iteratorCount+25){
    //
    //                 console.log(iterateThroughPagesNumber,current_info);
    //
    //                 pinterestUrl = current_info.data[pullPinIndex].url // need to increment this index and keep track of it with the highestPinIndex variable.
    //                                                         // pages return pins in increments of 25 (though this can be changed to 100).
    //                                                         // need to figure out a way of using current_info.cursor or current_info.next(?)
    //                                                         // to skip ahead to the correct pin once 25/100 pins are in the database.
    //
    //                 request.get(pinterestUrl, function(error,response,data) {
    //                     const text = data
    //
    //                     target =  "\"og:title\": \""
    //                     title = getData(true, text, target, "\",")
    //                     console.log(title)
    //
    //                     target = "\"dominant_color\": \""
    //                     hexCode = getData(false,text, target, ",")
    //                     console.log(hexCode)
    //
    //                     target = "\"locale\": \""
    //                     locale = getData(false, text, target, ",") // changed this to false
    //                     console.log(locale)
    //
    //                     target = "\"og:description\": \""
    //                     description = getData(false,text, target, ",")
    //                     console.log(description)
    //
    //                     target = "og:image\" name=\"og:image\" content=\""
    //                     imgUrl = getData(false,text,target,">")
    //                     console.log(imgUrl)
    //
    //                     target = "og:image:width\": \""
    //                     imgWidth = getData(false,text,target,",")
    //                     console.log(imgWidth)
    //
    //                     target = "og:image:height\": \""
    //                     imgHeight = getData(false,text,target,",")
    //                     console.log(imgHeight)
    //
    //                             pinIndex = users[0].newPinIndex;
    //
    //                             const new_pin = new Pin()
    //                             new_pin.title        = title
    //                             new_pin.hexCode      = hexCode
    //                             const new_label      = Label()
    //                             new_label.name       = hexCode
    //                             new_label.pin        = new_pin
    //                             new_label.save()
    //                             new_pin.locale       = locale
    //                             new_pin.description  = description
    //                             new_pin.imgUrl       = imgUrl
    //                             new_pin.imgWidth     = imgWidth
    //                             new_pin.imgHeight    = imgHeight
    //                             // new_pin.pinIndex     = pinIndex // setting this below
    //                             new_pin.pinterestUrl = pinterestUrl
    //
    //                             console.log(users[0].freeIndices,"amount of freeIndices",users[0].freeIndices.length > 0)
    //                             // if users[i].freeIndices.length > 0
    //                             // pop the last item in the array and use that as the pinIndex
    //                                 // else increment the newPinIndex by one and use that as the pinIndex
    //                             if (users[0].freeIndices.length > 0){
    //
    //                                 for (let i = 0; i < users.length; i++){
    //                                     pinIndex = users[i].freeIndices.pop() // what if this is for whatever reason different among admins?
    //                                     users[i].pullPinIndex += 1
    //                                     users[i].save()
    //                                     new_pin.pinIndex = pinIndex
    //                                     console.log("popped" + pinIndex)
    //                                 }
    //                             } else {
    //                                 for (let i = 0; i < users.length; i++){
    //                                     pinIndex = users[i].newPinIndex
    //                                     pinIndex += 1
    //                                     users[i].newPinIndex = pinIndex
    //                                     users[i].pullPinIndex += 1
    //                                     users[i].save()
    //                                     console.log("didn't pop" + pinIndex)
    //                                 }
    //                                 console.log("outside if/else statement" + pinIndex)
    //                                 new_pin.pinIndex = pinIndex
    //                             }
    //                             new_pin.save()
    //                             })
    //                             iteratorCount += 1;
    //                         }
    //                         res.redirect("/admin")
    //                     } else { res.redirect("/admin") } });
    //                 });
    //         } else { res.redirect("/admin") }
    //  });


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
                                // console.log("Already Present.")
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
                             console.log(typeof pin._id, pin._id)
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
            console.log(title, flagged)

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

            // UPDATE
//     app.put('/starters/:slug', (req, res) => {
//         console.log("googly "+ req.params.slug)
//     var currentUser = req.user;
//     if (req.body.content == ""){
//         Starter.findById(req.params.id).then(starter => {
//         res.render('errorEditStarter', {currentUser, starter}); //NEED TO MAKE AN ERROR PAGE FOR BOTH STARTERS AND THREADS FOR CORRECT REDIRECT
//     });
//     } else {
//         Starter.findOne( {slug: req.params.slug})
//         .then(starter => {
//             console.log("POOOgly "+ starter.slug)
//             starter.content = req.body.content
//       // Starter.findByIdAndUpdate(req.params.id, req.body).then(starter => {
//           starter.authorName = req.user.username
//           starter.author = req.user._id;
//           starter.save()
//           res.redirect(`/starters/${starter.slug}`);
//         })
//         .catch(err => {
//           console.log(err.message)
//         })
//     };
// });

        app.get('/goToPin/:index', (req, res) => {
            let index = req.url.split('/').pop()
            console.log(index)

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
