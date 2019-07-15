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

const fss = require('fast-string-search');
const cheerio = require('cheerio')

// $('h2.title').text('Hello there!')
// $('h2').addClass('welcome')
//
// $.html()

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
        let pictureURL;
        let imgWidth;
        let imgHeight;

        request = require('request');
        // <username>/<board_name>
        // "https://api.pinterest.com/v1/boards/" + process.env.PINTEREST_USERNAME+"/"+process.env.CURRENT_BOARDNAME+ "/pins/"
//
// "https://api.pinterest.com/v1/boards/" + process.env.PINTEREST_USERNAME+"/"+process.env.CURRENT_BOARDNAME+ "/pins/"

// <div class="XiG zI7 iyn Hsu" style="background-color:transparent;padding-bottom:137.58865248226954%"><img alt="Old One by Kisufisu on deviantART" class="hCL kVc L4E MIw" src="https://i.pinimg.com/564x/8a/12/e9/8a12e9a0e554be70f657a7a7a5eda733.jpg"></div>
// <div class="XiG zI7 iyn Hsu" style="background-color:transparent;padding-bottom:131.4%"><img alt=" " class="hCL kVc L4E MIw" src="https://i.pinimg.com/564x/81/82/73/8182730d4227ac27c0f175beaf740e75.jpg"></div>
// <div class="XiG zI7 iyn Hsu" style="background-color:transparent;padding-bottom:145.2%"><img alt="John Constantine - Simon Bisley" class="hCL kVc L4E MIw" src="https://i.pinimg.com/564x/bb/71/85/bb718537833d92c480f484769fea398e.jpg"></div>
// XiG zI7 iyn Hsu
// XiG zI7 iyn Hsu

// <img alt=" " class="hCL kVc L4E MIw" src="https://i.pinimg.com/564x/81/82/73/8182730d4227ac27c0f175beaf740e75.jpg">
// <img alt="Leonardo Albiero" class="hCL kVc L4E MIw" src="https://i.pinimg.com/564x/6f/3b/fe/6f3bfe2b9f35b109b561596f45ca88cc.jpg">

        request("https://api.pinterest.com/v1/me/pins/?access_token=" + process.env.A_TOKEN, function(error, response, body) {
        // request("https://api.pinterest.com/v1/pins/765119424176229442/?access_token=" + process.env.A_TOKEN, function(error, response, body) {
        // const $ = cheerio.load('<h2 class="title">Hello world</h2>')
        // const txt = $('.title').text()
        // console.log(txt)
        current_info = JSON.parse(body);
        console.log(current_info.page.next)
        // const image = current_info.data[2]
        // console.log('hello '+image)
        current_url = current_info.data[9].url
        // console.log(current_url)
        request.get(current_url, function(error,response,data) {
            const text = data
            const target = "og:image\" name=\"og:image\" content=\""
            const len_target = target.length
            // console.log(len_target)
            var descriptionIndex = parseInt(fss.indexOf(text, target,0,1))+len_target;
            var shift = parseInt(fss.indexOf(text, ">",descriptionIndex,1))-1;
            // descriptionIndex+=len_target;
            // console.log(descriptionIndex,shift)
            pictureURL = text.slice(descriptionIndex,shift)
            console.log(pictureURL)
            // const $ = cheerio.load(data);
        // const $ = cheerio.load(current_url)
        // console.log(data)
        // const image = $('twitter:image:src').attr('class')
        // const image = $('https://i.pinimg.com/564x/6f/3b/fe/6f3bfe2b9f35b109b561596f45ca88cc.jpg').text()
        // console.log('hello '+image)
        // console.log(current_info.data[0].url)
// console.log(current_info.data)


// get route queries pins in order of pin
// users current pin count / 25 == number while (i < number) request -> ??
        // request(current_info.page.next,function(error, response, body) {
        //     const data = JSON.parse(body)
        //     console.log(data)
        // })


        var currentUser = req.user;
        // process.env.A_TOKEN
        res.render('main', {currentUser, pictureURL, imgWidth, imgHeight});
    })
})
    });


module.exports = app;
