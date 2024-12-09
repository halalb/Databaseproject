const { check, validationResult } = require('express-validator');
const express = require("express");
const router = express.Router();
const bcrypt = require('bcrypt');
const saltRounds = 10;

const redirectLogin = (req, res, next) => {
  if (!req.session.username ) {
    res.redirect('/users/login') // redirect to the login page
  } else { 
      next (); // move to the next middleware function
  } 
}

// Route to render registration form
router.get('/register', function (req, res, next) {
    res.render('register.ejs');
});

// Route to handle user registration
router.post('/registered',[
  check('email').isEmail(),
  check('password').isLength({ min: 8 }),
  check('username').isLength({ min: 3 }),
  check('first').not().isEmpty().withMessage('First name is required'),
  check('last').not().isEmpty().withMessage('Last name is required')
], function (req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
      return res.redirect('./register'); }
  else { 
  }
  req.body.first = req.sanitize(req.body.first); // Sanitize first name
  req.body.last = req.sanitize(req.body.last);   // Sanitize last name
  req.body.email = req.sanitize(req.body.email); // Sanitize email
  req.body.username = req.sanitize(req.body.username);
  const plainPassword = req.body.password;

    // Hash the password before storing it in the database

    bcrypt.hash(plainPassword, saltRounds, function(err, hashedPassword) {
        if (err) {
            return res.status(500).send('Error hashing password');
        }

        // Save the user details in the database
        const sql = 'INSERT INTO users (username, firstName, lastName, email, hashedPassword) VALUES (?, ?, ?, ?, ?)';
        const values = [req.body.username, req.body.first, req.body.last, req.body.email, hashedPassword];

        db.query(sql, values, function(err, result) {
            if (err) {
               return res.status(500).send('Error saving user to the database');
            }

            // Respond with a success message
            let resultMessage = 'Hello ' + req.body.first + ' ' + req.body.last + ', you are now registered! ';
            resultMessage += 'We will send an email to you at ' + req.body.email + '. ';
            res.send('Registration successful');
            // res.redirect('../');
        });
    });
});

// Route to list users (excluding passwords)
router.get('/list', redirectLogin, function (req, res, next) {
    const sql = 'SELECT username, firstName, lastName, email FROM users';

    db.query(sql, function (err, result) {
        if (err) {
            return res.status(500).send('Error fetching users from the database');
        }
// Render the list of users using the 'listusers.ejs' view
        res.render('listusers.ejs', { users: result });
    });
});

// Route to display the login form
router.get('/login', function (req, res, next) {
    res.render('login.ejs');
});

router.get('/loggedin', function(req, res) {
  // Check if the user is logged in by verifying the session
  if (!req.session.username) {
      return res.redirect('/users/login'); // Redirect to the login page if not authenticated
  }
  // Render the loggedin.ejs page and pass the username from the session
  res.redirect('../');
});

router.post('/loggedin', function(req, res, next) {
  const username = req.sanitize(req.body.username);
  const password = req.sanitize(req.body.password);

  if (!username || !password) {
      return res.status(400).send('Username and password are required');
  }

  const query = 'SELECT * FROM users WHERE username = ?';
  db.query(query, [username], function(err, results) {
      if (err) {
          console.error('Database error:', err);
          return res.status(500).send('Database error');
      }

      if (results.length === 0) {
          return res.status(401).send('Username not found');
      }

      const user = results[0];
      bcrypt.compare(password, user.hashedPassword, function(err, result) {
          if (err) {
              console.error('Password comparison error:', err);
              return res.status(500).send('Error during password comparison');
          }

          if (result === true) {
              req.session.username = user.username; // Save username in the session
              res.redirect('/users/loggedin'); // Redirect to the logged-in page
          } else {
              res.status(401).send('Incorrect password');
          }
      });      
  });
});

router.get('/logout', (req, res) => {
    // Destroy the session
    req.session.destroy((err) => {
        if (err) {
            console.error('Error during logout:', err);
            return res.status(500).send('An error occurred while logging out.');
        }
        // Redirect to the login page or home page after logout
        res.redirect('../');
    });
});


module.exports = router;
// Export the router so that index.js can access it