const redirectLogin = (req, res, next) => {
    if (!req.session.username ) {
      res.redirect('./users/login') // redirect to the login page
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
    const { from, to, amount } = req.body;
    const userId = req.session.userId;

    // Validate input
    if (!from || !to || !amount || isNaN(amount)) {
        console.error("Validation Error: Invalid input values.");
        return res.status(400).send("Validation Error: Please provide valid 'from', 'to', and numeric 'amount' values.");
    }
    if (!userId) {
        console.error("Authorization Error: User ID is missing in the session.");
        return res.status(403).send("Authorization Error: You are not logged in.");
    }

    try {
        console.log("Calling CurrencyLayer API...");

        const url = `http://api.currencylayer.com/convert?access_key=${API_KEY}&from=${from}&to=${to}&amount=${amount}`;
        const response = await axios.get(url);

        // Check API response success
        if (!response.data.success) {
            console.error("CurrencyLayer API Error:", response.data.error);
            return res.status(400).send("API Error: " + response.data.error.info);
        }

        const conversionResult = response.data.result;
let conversionRate = response.data.info.quote; // Use let instead of const

// Handle same currency conversion
if (from === to) {
    conversionRate = 1.0; // No error now
}

// Validate conversion rate
if (isNaN(conversionRate) || conversionRate === null || conversionRate === undefined) {
    console.error("Error: Invalid conversion rate received from API:", conversionRate);
    return res.status(400).send("Error: Invalid conversion rate received from the API.");
}


        // Validate conversion rate
        if (isNaN(conversionRate) || conversionRate === null || conversionRate === undefined) {
            console.error("Error: Invalid conversion rate received from API:", conversionRate);
            return res.status(400).send("Error: Invalid conversion rate received from the API.");
        }

        // Insert into database
        const insertSql = `
            INSERT INTO conversion_history (user_id, from_currency, to_currency, amount, converted_amount, conversion_rate) 
            VALUES (?, ?, ?, ?, ?, ?)`;
        const params = [userId, from, to, parseFloat(amount), parseFloat(conversionResult), parseFloat(conversionRate)];

        console.log("SQL Query:", insertSql);
        console.log("Params:", params);

        db.query(insertSql, params, (err, insertResults) => {
            if (err) {
                console.error("Database Error: Failed to insert conversion history.", err.message);
                return res.status(500).send("Database Error: Could not insert conversion history.");
            }

            console.log("Insert successful. Insert ID:", insertResults.insertId);

            const selectSql = `
                SELECT 
                    from_currency, 
                    to_currency, 
                    amount, 
                    converted_amount, 
                    formatted_date 
                FROM conversion_history 
                WHERE id = ?`;

            db.query(selectSql, [insertResults.insertId], (err, selectResults) => {
                if (err) {
                    console.error("Database Error: Failed to fetch inserted record.", err.message);
                    return res.status(500).send("Database Error: Could not fetch inserted record.");
                }

                if (selectResults.length === 0) {
                    console.error("Logic Error: No record found with the inserted ID.");
                    return res.status(500).send("Logic Error: Inserted record not found.");
                }

                const { from_currency, to_currency, amount, converted_amount, formatted_date } = selectResults[0];
                console.log("Fetched inserted record:", selectResults[0]);

                res.render('conversionResult.ejs', {
                    from: from_currency,
                    to: to_currency,
                    amount,
                    conversionResult: converted_amount,
                    conversionDate: formatted_date
                });
            });
        });
    } catch (error) {
        console.error("Unexpected Server Error:", error.message);
        res.status(500).send("Unexpected Server Error: Something went wrong on our end.");
    }
});

// Route for users conversion history 
router.get('/history', redirectLogin, (req, res) => {
    const userId = req.session.userId; // Ensure `userId` is stored in the session upon login

    // Fetch history for the logged-in user
    const query = `
        SELECT 
            DATE_FORMAT(timestamp, '%d/%m/%Y') AS formatted_date, 
            from_currency, 
            to_currency, 
            amount, 
            converted_amount 
        FROM conversion_history 
        WHERE user_id = ?`;

    db.query(query, [userId], (err, results) => {
        if (err) {
            console.error("Error fetching conversion history:", err.message);
            return res.status(500).send("Error fetching conversion history.");
        }
        res.render('history.ejs', { conversions: results });
    });
});

// Route for searching conversion history by currency
router.get('/history/search', redirectLogin, (req, res) => {
    const userId = req.session.userId; 
    const currency = req.query.currency; 

    if (!currency) {
        return res.redirect('/history'); 
    }

    // SQL query to fetch records that match the currency
    const query = `
        SELECT 
            DATE_FORMAT(timestamp, '%d/%m/%Y') AS formatted_date, 
            from_currency, 
            to_currency, 
            amount, 
            converted_amount 
        FROM conversion_history 
        WHERE user_id = ? AND (from_currency = ? OR to_currency = ?)`;

    db.query(query, [userId, currency, currency], (err, results) => {
        if (err) {
            console.error("Error searching conversion history:", err.message);
            return res.status(500).send("Error searching conversion history.");
        }
        res.render('history.ejs', { conversions: results }); // Render the history page with filtered results
    });
});


module.exports = router;