//Load modules
const express = require('express');
const exphbs = require('express-handlebars');
const mongoose = require('mongoose');
const passport = require('passport');
const session = require("express-session");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
// Connect to MongoURI exported from external file
const keys = require('./config/keys');
//User collection
const User = require('./models/user');
require('./passport/google-passport');
// Initialize application
const app = express();
//Express Config
app.use(express.cookieParser()); 
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
//set global vars for user
app.use((req, res, next) => {
    res.locals.user = req.user || null;
    next();
});
//Setup template engine
app.engine('handlebars', exphbs({
    defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');
// Setup static files to serve CSS, JS and Images
app.use(express.static('public'));
// connect to remote database
mongoose.Promise = global.Promise;
mongoose.connect(keys.MongoURI, {
    useNewUrlParser: true
})
.then(() => {
    console.log('Connected to Remote Database....');
}).catch((err) => {
    console.log(err);
});

//Set environment variable for port
const port = process.env.PORT || 3000;

//Handle routes
app.get('/', (req, res) => {
    res.render('home');
});

app.get('/about', (req, res) => {
    res.render('about');
});

//Google auth route
app.get('/auth/google',
  passport.authenticate('google', {
       scope: ['profile', 'email']
    }));

app.get('/auth/google/callback', 
  passport.authenticate('google', { 
    failureRedirect: '/login'
    }),
    (req, res) => {
    // Successful authentication, redirect home.
    res.redirect('/profile');
  });

app.get('/profile', (req, res) => {
    User.findById({_id: req.user._id})
    .then((user) => {
        res.render('profile', {
            user: user
        });
    })
});
//handle User logout route
app.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
});

app.listen(port, () => {
    console.log(`Server is running by Nodemon on port ${port}`);
});





