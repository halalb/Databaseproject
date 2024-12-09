const redirectLogin = (req, res, next) => {
    if (!req.session.username ) {
      res.redirect('/users/login') // redirect to the login page
    } else { 
        next (); // move to the next middleware function
    } 
  }
  

const express = require("express");
const axios = require("axios");
const router = express.Router();

// CurrencyLayer API Key
const API_KEY = '486ad0ca136085b77d2f92679048bcb0';

// Home Route
router.get('/', (req, res) => {
    const isLoggedIn = req.session.username ? true : false;
    const username = req.session.username || null;
    res.render('index', { isLoggedIn, username });
});

// About Route
router.get('/about', (req, res) => {
    res.render('about.ejs');
});

// Convert Route
router.get('/convert', redirectLogin, (req, res) => {
    res.render('convert.ejs');
});

// Currency Converter Route
router.post('/convertResult', async (req, res) => {
   const to = req.body.to;
   const from = req.body.from;
   const amount = req.body.amount;

    if (!from || !to || !amount) {
        return res.status(400).send("Please provide 'from', 'to', and 'amount' query parameters.");
    }

    try {
        const url = `http://api.currencylayer.com/convert?access_key=${API_KEY}&from=${from}&to=${to}&amount=${amount}`;
        const response = await axios.get(url);

        if (response.data.success) {
            const conversionResult = response.data.result;

        const sql = 'INSERT INTO conversion_history ( from_currency, to_currency, amount, converted_amount) VALUES (?, ?, ?, ?)';

            let params = [from, to, amount, conversionResult]
            db.query(sql, params, (err, results) => {
                if (err) {
                    console.error("Error fetching conversion history:", err);
                    return res.status(500).send("Error fetching conversion history.");
                }else{
                    res.render('conversionResult.ejs', { from, to, amount, conversionResult });

                }

            });
        } else {
            res.status(400).send("Error with the CurrencyLayer API: " + response.data.error.info);
        }
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});


// Route for users conversion history 
router.get('/history', redirectLogin, (req, res) => {
    const userId = req.session.userId; // Ensure `userId` is stored in the session upon login

    const query = `SELECT from_currency, to_currency, amount, converted_amount FROM conversion_history`

    db.query(query, (err, results) => {
        if (err) {
            console.error("Error fetching conversion history:", err);
            return res.status(500).send("Error fetching conversion history.");
        }
        console.log(results)
        res.render('history.ejs', { conversions: results });
    });
});



// Route to fetch exchange rates
router.get('/exchangerates', async (req, res) => {
    try {
        const apiKey = process.env.FIXER_API_KEY;
        const url = `https://data.fixer.io/api/latest?access_key=${apiKey}&symbols=USD,GBP,EUR`;

        // Fetch exchange rates
        const response = await axios.get(url);
        const rates = response.data.rates;

        // Render the rates on a new EJS page
        res.render('exchangerates.ejs', { rates });
    } catch (error) {
        console.error('Error fetching exchange rates:', error);
        res.status(500).send('Error fetching exchange rates.');
    }
});


module.exports = router;
