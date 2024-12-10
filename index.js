const expressSanitizer = require('express-sanitizer');
// Import express, ejs, and other dependencies
var express = require('express');
var ejs = require('ejs');
var mysql = require('mysql2');
var bcrypt = require('bcrypt');
var session = require('express-session');
var validator = require('express-validator');
const axios = require('axios');

// Create the express application object
const app = express();
const port = 8000;

app.use(expressSanitizer());
// Set up the view engine and static files
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: 'somerandomstuff',
    resave: false,
    saveUninitialized: false,
    cookie: { expires: 600000 }
}));
app.use(express.static(__dirname + '/public'));
app.set('views', __dirname + '/views');

// CurrencyLayer API Key
const API_KEY = '486ad0ca136085b77d2f92679048bcb0';



// Define the database connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'hasib',
    password: 'hasib',
    database: 'login'
});

// Connect to the database
db.connect((err) => {
    if (err) {
        throw err;
    }
    console.log('Connected to database');
});
global.db = db; // Make the database connection available globally

// Load the route handlers
const mainRoutes = require("./routes/main");
app.use('/', mainRoutes);

// Load the route handlers for /users
const usersRoutes = require('./routes/users');
app.use('/users', usersRoutes);

// Start the web app listening
app.listen(port, () => console.log(`Node app listening on port ${port}!`));