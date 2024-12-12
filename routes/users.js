const {check, validationResult}=require('express-validator') ;
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const saltRounds= 10;


const redirectLogin = (req, res, next)=> {
  if (!req.session.username ) {
    res.redirect('../users/login') // redirect to the login page
  } else { 
      next (); // move to the next middleware function
  } 
}

// Route to render registration form
router.get('/register', function (req, res, next) {
    const isLoggedIn= req.session.username ? true : false; 
    res.render('register.ejs', { isLoggedIn }); 
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

  // Input sanitization
  req.body.first = req.sanitize(req.body.first); 
  req.body.last = req.sanitize(req.body.last);  
  req.body.email = req.sanitize(req.body.email); 
  req.body.username = req.sanitize(req.body.username);
  const plainPassword = req.body.password;


    bcrypt.hash(plainPassword, saltRounds, function(err, hashedPassword) {
        if (err){
            return res.status(500).send('Error hashing password');
        }

        const sql= 'INSERT INTO users (username, firstName, lastName, email, hashedPassword) VALUES(?, ?, ?, ?, ?)';
        const values = [req.body.username, req.body.first, req.body.last,req.body.email, hashedPassword];

        db.query(sql, values, function(err, result) {
            if (err){
               return res.status(500).send('Error saving user to the database');
            }
             res.redirect('./login');
        });
    });
});

// Route to list users 
router.get('/list',redirectLogin,function (req, res, next) 
{
    const sql = 'SELECT username, firstName, lastName, email FROM users';

    db.query(sql, function (err, result)
    {
        if (err) {
            return res.status(500).send('Error fetching users from the database');
        }
        res.render('listusers.ejs', { users: result });
    });
});

// Route to display the login form
router.get( '/login', function (req, res, next){
    res.render('login.ejs');
});

router.get('/loggedin', function(req, res) {
  if (!req.session.username){
      return res.redirect('./login'); 
  }
  res.redirect('../');
});

router.post('/loggedin', function(req, res, next ) {

  const username = req.sanitize(req.body.username);
  const password = req.sanitize(req.body.password);

  if (!username || !password){
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
              req.session.username = user.username;
              req.session.userId = user.id; 
              res.redirect('./loggedin');
          } else {
              res.status(401).send('Incorrect password');
          }
      });      
  });
});

router.get('/logout', (req, res)=>{
    req.session.destroy((err) => {
        if (err) {
            console.error('Error during logout:', err);
            return res.status(500).send ( 'An error while logging out.');
        }
        res.redirect('../');
    });
});

module.exports = router;
