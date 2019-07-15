const dotenv = require('dotenv').config();

var cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');

const express = require('express');
const app = express();

app.use(cookieParser()); // Add this after you initialize express.

const exphbs = require('express-handlebars');

const mongoose = require('mongoose');

// Set db
const db = require('./data/pinterest');

//middleware for JSON data
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');

//middleware for putting something when you post it
const methodOverride = require('method-override');

// const passport = require('passport-pinterest')
// const passport = require('passport')

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

const iex = require('iex-api');

const User = require('./models/user.js');
const auth = require('./controllers/auth.js')(app);
const labels = require('./controllers/labels')(app);



const port = process.env.PORT || 13000;

// const PinterestStrategy = require('./models/pintereststrategy.js');

// passport.use(new PinterestStrategy({
//         clientID: process.env.PINTEREST_APP_ID,
//         clientSecret: process.env.PINTEREST_APP_SECRET,
//         scope: ['read_public', 'read_relationships'],
//         callbackURL: "https://localhost:13000/auth/pinterest/callback",
//         state: true
//     },
//     function(process.env.A_TOKEN, refreshToken, process.env.PINTEREST_USERNAME, done) {
//         User.findOrCreate({ pinterestId: profile.id }, function (err, user) {
//             return done(err, user);
//         });
//     }
// ));

// const PDK = require('node-pinterest');
//
// const pinterest = PDK.init(process.env.A_TOKEN);
// pinterest.api('me').then(console.log);
//
// app.get('/auth/pinterest',
//     passport.authenticate('pinterest')
// );
//
// app.get('/auth/pinterest/callback',
//     passport.authenticate('pinterest', { failureRedirect: '/login' }),
//     function(req, res) {
//         // Successful authentication, redirect home.
//         res.redirect('main', {currentUser,});
//     }
// );




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

// require("dotenv").config();


const http   = require('http').Server(app)
const io     = require('socket.io')(http)
const extend = require('extend')

    // Mongoose Schema definition
    Edge = mongoose.model('Edge', {
      id: String,
      source: {
        id: String,
        weight: Number
      },
      target: {
        id: String,
        weight: Number
      }
    }),

    Vertex = mongoose.model('Vertex', {
      id: String,
      color: String,
      label: String
    });

/*
 * I’m sharing my credential here.
 * Feel free to use it while you’re learning.
 * After that, create and use your own credential.
 * Thanks.
 *
 * COMPOSE_URI=mongodb://example:example@dogen.mongohq.com:10089/graph
 * COMPOSE_URI=mongodb://example:example@127.0.0.1:27017/graph
 * 'mongodb://example:example@dogen.mongohq.com:10089/graph'
 */
mongoose.connect(process.env.COMPOSE_URI, function (error) {
    if (error) console.error(error);
    else console.log('mongo connected');
});
/** END */


app
  // .use(express.static(__dirname + '/'))
  // https://scotch.io/tutorials/use-expressjs-to-get-url-and-post-parameters
  .use(bodyParser.json()) // support json encoded bodies
  .use(bodyParser.urlencoded({ extended: true })) // support encoded bodies
  ;

// http.listen(process.env.PORT || 5000, function(){
//   console.log('listening on *:5000');
// });

io.on('connection', function(socket) {
    console.log("yay")

  function removeLinkIfNodeWasDeleted(linkId, nodeId) {
    Vertex.findById( nodeId, function(err, vertex) {
      if (vertex) {
        return;
      }
      Edge.findById(linkId, function(err, link) {
        link.remove();
      });
    } );
  }

  function cleanUpLinkIfNeeded(link) {
    removeLinkIfNodeWasDeleted( link.id, link.source.id );
    removeLinkIfNodeWasDeleted( link.id, link.target.id );
  }

  console.log('a user connected');
  socket.on('disconnect', function(){
    console.log('user disconnected');
  });

  socket.on('retrieve-all-nodes', function() {
    Vertex.find( function( err, nodes) {
      nodes.forEach(function(node) {
        node.id = node._id;
        socket.emit( 'node-added', node );
      });
      Edge.find( function(err, links) {
        links.forEach(function(link) {
          link.id = link._id;
          socket.emit( 'link-added', link );
          cleanUpLinkIfNeeded( link );
        });
      } );
    });
  });

  // socket.on('remove-all-nodes', function() {
  // ...
  // });

  socket.on('add-node', function( node, cb ) {
    var vertex = new Vertex( node );
    node.id = vertex._id;
    vertex.color = '#' + Math.random().toString(16).slice(2, 8).toUpperCase();
    vertex.save(function (err) {
      cb && cb(node);
      socket.broadcast.emit( 'node-added', node );
      socket.emit( 'node-added', node );
    });
  });

  socket.on('edit-node', function(node) {
    if (node && node.id) {
      Vertex.findById( node.id, function (err, vertex) {
        vertex.label = node.label;
        vertex.color = node.color;
        vertex.save( function(err) {
          socket.emit( 'node-edited', node );
          socket.broadcast.emit( 'node-edited', node );
        });
      } );
    }
  } );

  socket.on('remove-node', function(node) {
    if (node && node.id) {
      Vertex.findById( node.id, function(err, vertex) {
        vertex.remove( function(err) {
          socket.emit( 'node-removed', node );
          socket.broadcast.emit( 'node-removed', node );
        });
      } );
    }
  });

  socket.on('add-link', function(link, cb) {
    var edge = new Edge( link );
    link.id = edge._id;
    edge.save( function(err) {
      cb && cb(link);
      socket.broadcast.emit( 'link-added', link );
      socket.emit( 'link-added', link );
    } );
  });

  socket.on('remove-link', function(link) {
    if (link && link.id) {
      Edge.findById( link.id, function(err, edge) {
        edge.remove( function(err) {
          socket.broadcast.emit( 'link-removed', link );
          socket.emit( 'link-removed', link );
        } );
      });
    }
  });

});

// INDEX
    app.get('/', (req, res) => {
    //     request = require('request');
    //     console.log("heyheye")
    //     request('http://demo.traccar.org/api/devices/uniqueId=333331', function(error, response, body) {
    //     current_info = JSON.parse(body);
    //     console.log(current_info)
    // })

        var currentUser = req.user;
        process.env.A_TOKEN
        console.log("good")
        res.render('main', {currentUser});
    });


module.exports = app;
