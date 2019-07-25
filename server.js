const dotenv = require('dotenv').config();

var cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');

const express = require('express');
const app = express();

app.use(cookieParser()); // Add this after you initialize express.

const exphbs = require('express-handlebars');

const mongoose = require('mongoose');

// Set db
// const db = require('./data/pinterest');

//middleware for JSON data
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');

//middleware for putting something when you post it
const methodOverride = require('method-override');

// socket io
const http = require('http').createServer(app);
const io = require('socket.io')(http);



// Use Body Parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

var checkAuth = (req, res, next) => {
  console.log("Checking authentication");
  if (typeof req.cookies.nToken === "undefined" || req.cookies.nToken === null) {
    req.user = null;
  } else {
    var token = req.cookies.nToken;
    var decodedToken = jwt.decode(token, { complete: true }) || {};
    req.user = decodedToken.payload;
  }

  next();
};
app.use(checkAuth);

const User = require('./models/user.js');
const auth = require('./controllers/auth.js')(app);
const labels = require('./controllers/labels')(app);
const pins = require('./controllers/pins')(app);

const port = process.env.PORT || 13000;

// Add after body parser initialization!
app.use(expressValidator());

//must come below const app, but before routes
app.use(bodyParser.urlencoded({ extended: true }));

// override with POST having ?_method=DELETE or ?_method=PUT
app.use(methodOverride('_method'))

app.use(express.static('public'));
// app.use(express.static('/'));

// //heroku database.
mongoose.connect((process.env.MONGODB_URI || 'mongodb://localhost/pinterest'), { useNewUrlParser: true });

// local host database
// mongoose.connect('mongodb://localhost/pinterest');

//views middleware
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

app.listen(port);

// mongoose.connect(process.env.COMPOSE_URI, function (error) {
//     if (error) console.error(error);
//     else console.log('mongo connected');
// });

app
  .use(bodyParser.json()) // support json encoded bodies
  .use(bodyParser.urlencoded({ extended: true })) // support encoded bodies

  // from: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set
  // function union(setA, setB) {
  //     var _union = new Set(setA);
  //     for (var elem of setB) {
  //         _union.add(elem);
  //     }
  //         return _union;
  //     }
  //
  //
  // io.on('connection', function(socket){
  //     console.log("hey connection")
  //   socket.on('add label', function(labels){
  //
  // let id;
  // let currentUser = req.user;
  // let index;
  //
  // let new_labels = {}
  //
  // let inputLabels = Array.from(new Set(labels.split(" ")))
  //
  // let current_label;
  //
  // if (currentUser){
  //     id = currentUser._id
  // }
  //
  // User.findOne( { _id : id } ).then( user => {
  //
  //     if (user){
  //         index = user.pinIndex
  //     }
  //
  //     Pin.findOne( { pinIndex: index } ).then( pin => {
  //
  //         let arr = [];
  //         for (let i = 0; i < inputLabels.length; i++){
  //             arr.push({name: inputLabels[i], pin: pin})
  //         }
  //
  //         Label.insertMany(arr, {ordered:false}).then(() => {
  //             pinLabels = new Set(pin.labels)
  //             inputLabels = new Set(inputLabels)
  //             unionOfLabels = union(pinLabels, inputLabels)
  //             newArrayFromUnion = Array.from(unionOfLabels)
  //             pin.labels = newArrayFromUnion
  //             pin.save().then((pin) => {
  //                 console.log(socket.id +' message: ' + label);
  //                 io.emit('add label', label);
  //                 })
  //             });
  //         });
  // });
  // });
  // });
  //
  //
  // http.listen(port, function(){
  //   console.log('listening on *:13000');
  // });

module.exports = app;
