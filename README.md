# 💱 Currency Converter Web App

**Module:** Databases and the Web (IS53064A)
**Author:** Hasib Uddin
**Course:** BSc Computer Science – Goldsmiths, University of London
**Project:** Portfolio Assessment
**Instructor:** Llewelyn Fernandes

---

## 📌 Project Summary

This is a full-stack web application built with Node.js and MySQL, allowing users to register, log in securely, and convert between currencies using a third-party currency exchange API. Users can also view a history of their conversions.

This application showcases the use of:

* Secure authentication (bcrypt, express-session)
* Form input validation and sanitation
* SQL database interactions
* Integration with external Web APIs
* Server-side rendering with EJS templates
* User session management and protected routes

---

## 🌐 Live Website

[Module Deployment Instructions on Goldsmiths VM](https://www.doc.gold.ac.uk/usr/741/)

---

## 🚀 Features

* 🔐 User authentication (registration + login)
* 💱 Currency conversion via public API
* 🧾 Conversion history saved to MySQL DB
* ✅ Input validation and sanitation (express-validator)
* 📊 Responsive, styled UI using CSS
* 🔒 Secure password hashing using bcrypt
* 📦 Modular route structure for scalability

---

## 📂 File Structure

```
/public          → Static assets (CSS)
/views           → EJS templates for pages
/routes          → Route handlers (api.js, users.js, main.js)
index.js         → App entry point (Express setup)
/createdb.sql    → SQL to set up initial schema
```

---

## 🧪 How to Run Locally

### 📦 Prerequisites

* Node.js
* MySQL (running locally)
* Git (for cloning the repo)

### ⚙️ Installation Steps

```bash
# Clone the repo
git clone https://github.com/halalb/Databaseproject
cd Databaseproject

# Install dependencies
npm install

# Create MySQL user
# You may run this in your MySQL shell:
# CREATE USER IF NOT EXISTS 'hasib'@'localhost' IDENTIFIED BY 'hasib';
# GRANT ALL PRIVILEGES ON *.* TO 'hasib'@'localhost';

# Run the app
node index.js
```

🔐 Default login:

* **Username**: `test1234`
* **Password**: `test1234`

---

## 🧠 Technologies Used

| Category        | Stack                                                      |
| --------------- | ---------------------------------------------------------- |
| Server          | Node.js, Express.js                                        |
| Templating      | EJS                                                        |
| Authentication  | bcrypt, express-session                                    |
| Validation      | express-validator                                          |
| Database        | MySQL2                                                     |
| API Integration | Currency Exchange API (e.g., exchangerate.host or similar) |
| Styling         | CSS                                                        |

---

## 📘 Key Lessons Applied (Based on Module)

* **Week 2:** Password Hashing (`bcrypt`)
* **Week 3:** Authentication and Authorisation (session-based)
* **Week 4:** Form Input Validation (express-validator)
* **Week 5:** Web APIs (external API usage + internal API endpoint)
* **Week 6–7:** Advanced SQL, Joins, Schema normalization
* **Week 8:** NoSQL (exploration - not implemented here)
* **Security:** Input sanitation, secure password storage, data-in-transit awareness

---

## 📸 Screenshots

| Login Page                    | Conversion Page                   | History Table                     |
| ----------------------------- | --------------------------------- | --------------------------------- |
| ![Login](./path/to/login.png) | ![Convert](./path/to/convert.png) | ![History](./path/to/history.png) |

*(Replace with actual paths or GitHub-hosted images)*

---

## ✅ Future Improvements

* Add multi-user currency conversion stats
* Support JWT-based APIs for mobile integration
* Deploy to public cloud (e.g., Render, Heroku, or AWS Lightsail)

---

## 📜 License

This project is for academic use under the Databases and the Web module (Goldsmiths University). Not licensed for commercial deployment without instructor approval.

---
