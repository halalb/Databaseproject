const express = require("express");
const router = express.Router();



router.get('/users', (req, res) => {
    const sqlQuery = "SELECT * FROM users";

    db.query(sqlQuery, (err, results) => {
        if (err) {
            console.error("Error fetching users:", err.message);
            res.status(500).json({ error: "Database error" });
        } else {
            res.json(results);
        }
    });
});

router.get('/history/:userId', (req, res) => {
    let userId = req.params.userId;
    console.log(userId)
    if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
    }

    const sqlQuery = `
        SELECT 
            from_currency, to_currency, amount, converted_amount, conversion_rate, 
            DATE_FORMAT(timestamp, '%d/%m/%Y') AS formatted_date 
        FROM conversion_history 
        WHERE user_id = ?`;

    db.query(sqlQuery, [userId], (err, results) => {
        if (err) {
            console.error("Error fetching conversion history:", err.message);
            res.status(500).json({ error: "Database error" });
        } else {
            res.json(results);
        }
    });
});



router.post('/users', (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ error: "All fields are required" });
    }

    const sqlQuery = "INSERT INTO users (username, email, password) VALUES (?, ?, ?)";

    db.query(sqlQuery, [username, email, password], (err, results) => {
        if (err) {
            console.error("Error inserting user:", err.message);
            res.status(500).json({ error: "Database error" });
        } else {
            res.json({ message: "User added successfully", userId: results.insertId });
        }
    });
});



module.exports = router;
