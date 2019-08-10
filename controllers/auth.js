const jwt = require('jsonwebtoken');
const User = require("../models/user");

module.exports = app => {

    // GET the sign up view
    app.get('/sign-up', (req, res) => {
        var currentUser = req.user;
        if (currentUser) {
            res.redirect('/');
        } else {
            res.render('sign-up', currentUser);
        }
    });

    // POST create a new user
    app.post("/sign-up", (req, res) => {
      // Create User and JWT
      let highestPinIndex;
      let pullPinIndex;
      let adminPinIndex;
      const user = new User(req.body);

      // if users type in the right admin code
      if (req.body.adminCode == process.env.ADMIN_CODE){
            user.admin = true;
        } else {
            user.admin = false;
      }

      User.findOne( { admin: true } ).then( administrator => {
          if (administrator) {
              // the highest number of the pins on the my site
              highestPinIndex = administrator.newPinIndex;
              // the number to pull from on the Pinterest site.
              // iterates from the last image I pinned to the first one I ever pinned (22,000+)
              pullPinIndex = administrator.pullPinIndex;
              // the the index that I am currently on as admin
              adminPinIndex = administrator.pinIndex;
          }

          if (highestPinIndex) {

              // these don't really matter to regular users
              user.newPinIndex = highestPinIndex;
              user.pullPinIndex = pullPinIndex;

              // an attempt to start the user off where I am
              user.pinIndex = adminPinIndex;
          } else {
              // if this new user is the first user to ever use the site
              user.newPinIndex = 0;
              user.pullPinIndex = 0;
              user.pinIndex = 1;
          }

      user.save().then((user) => {
          var token = jwt.sign({ _id: user._id }, process.env.SECRET, { expiresIn: "60 days" });
          // 3 600 000 == 60 minutes, originally 900 000 == 15 minutes
          // THIS DOES NOT WORK!!
          res.cookie('nToken', token, { maxAge: 3600000, httpOnly: true });
          res.redirect('/');
          })
        .catch(err => {
          console.log(err.message);
          return res.status(400).send({ err: err });
        });
    });
    });

    // GET the login form
     app.get('/login', (req, res) => {
       res.render('login');
     });

     // POST to the login route (ie "sign-in")
     // this like the POST sign-up route is pure tutorial copy-paste
    app.post("/login", (req, res) => {
      const username = req.body.username;
      const password = req.body.password;
      // Find this user name
      User.findOne({ username }, "username password")
        .then(user => {
          if (!user) {
            // User not found
            return res.status(401).send({ message: "Wrong Username or Password" });
          }
          // Check the password
          user.comparePassword(password, (err, isMatch) => {
            if (!isMatch) {
              // Password does not match
              return res.status(401).send({ message: "Wrong Username or password" });
            }
            // Create a token
            const token = jwt.sign({ _id: user._id, username: user.username }, process.env.SECRET, {
              expiresIn: "60 days"
            });
            // Set a cookie and redirect to root
            res.cookie("nToken", token, { maxAge: 900000, httpOnly: true });
            res.redirect("/");
          });
        })
        .catch(err => {
          console.log(err);
        });
    });

    // GET the logout route / signout
    app.get('/logout', (req, res) => {
      res.clearCookie('nToken');
      res.redirect('/');
    });

    // GET the info page view
    app.get('/info', (req, res) => {
     let mobile = false;
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

         res.render('info_page', {currentUser, admin_page, admin, pinIndex});
        });
        });
    };
