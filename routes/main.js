const redirectLogin = (req, res, next) => {
    if (!req.session.username ) {
      res.redirect('./users/login') 
    } else { 
        next (); 
    } 
  }

const express = require("express");
const axios = require("axios");
const router = express.Router();

// CurrencyLayer API Key
const API_KEY = 'd166de82237f0f32e4f8f3f55c06a622';

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

    if (!from || !to || !amount || isNaN(amount)) {
        console.error("Validation Error:Invalid input");
        return res.status(400).send("Validation Error: Please provide valid 'from', 'to', and numeric 'amount' values.");
    }
    if (!userId) {
        console.error("Authorization Error: User ID missing.");
        return res.status(403).send("Authorization Error: You are not logged in.");
    }

    try {
        console.log("Calling CurrencyLayer API...");

        const url = `http://api.currencylayer.com/convert?access_key=${API_KEY}&from=${from}&to=${to}&amount=${amount}`;
        const response = await axios.get(url);

        if (!response.data.success) {
            console.error("CurrencyLayer API Error:", response.data.error);
            return res.status(400).send("API Error: " + response.data.error.info);
        }

        const conversionResult = response.data.result;
let conversionRate = response.data.info.quote;

if (from === to) {
    conversionRate = 1.0; 
}

if (isNaN(conversionRate) || conversionRate === null || conversionRate === undefined) {
    console.error("Error: Invalid conversion rate received from API:", conversionRate);
    return res.status(400).send("Error: Invalid conversion rate received from the API.");
}

if (isNaN(conversionRate) || conversionRate === null || conversionRate === undefined) {
    console.error("Error: Invalid conversion rate received from API:", conversionRate);
    return res.status(400).send("Error: Invalid conversion rate received from the API.");
    }

        const insertSql = `
            INSERT INTO conversion_history (user_id, from_currency, to_currency, amount, converted_amount, conversion_rate) 
            VALUES (?, ?, ?, ?, ?, ?)`;
        const params = [userId, from, to, parseFloat(amount), parseFloat(conversionResult), parseFloat(conversionRate)];

        console.log("SQL Query:", insertSql);
        console.log("Params:", params);

        db.query(insertSql, params, (err, insertResults) => {
            if (err) {
                console.error("Database Error", err.message);
                return res.status(500).send("Database Error");
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
                    console.error("Logic Error: No record found.");
                    return res.status(500).send("Logic Error: record not found.");
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
        res.status(500).send("Unexpected Server Error: Something went wrong");
    }
});

router.get('/history', redirectLogin, (req, res) => {
    const userId = req.session.userId; 
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
            console.error("Error fetching history:", err.message);
            return res.status(500).send("Error fetching history.");
        }
        res.render('history.ejs', { conversions: results });
    });
});

router.get('/history/search', redirectLogin, (req, res) => {
    const userId = req.session.userId; 
    const currency = req.query.currency; 

    if (!currency) {
        return res.redirect('/history'); 
    }

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
            console.error("Error searching history:", err.message);
            return res.status(500).send("Error searching history.");
        }
        res.render('history.ejs', { conversions: results }); 
    });
});


module.exports = router;