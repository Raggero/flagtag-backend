const express = require("express");
const app = express();
const cors = require('cors');
const db = require("./database.js");
const bodyParser = require("body-parser");

app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

const port = 3000;

app.listen(port, () => {
    console.log("Server running on port %PORT%".replace("%PORT%",port))
});

//Returns all users in database
app.get("/users", (req, res, next) => {
    var sqlQuery = "select * from users"
    var params = []
    db.all(sqlQuery, params, (error, rows) => {
        if (error) {
            res.status(400).json({"error":error.message});
            return;
        }
        res.json({
            "users":rows
        })
    });
});

//Search by name and password. If no such user exists returns empty json.
//ex localhost:3000/users/Helena/asd
app.get("/users/:name/:password", (req, res, next) => {
    var searchQuery = "select * from users where userName = ? AND userPassword = ?"
    var params =[req.params.name, req.params.password]
    db.all(searchQuery, params, (error, rows) => {
        if (error) {
            res.status(400).json({"error":error.message});
            return;
        }
        res.json({
            "users":rows
        })
    });
});


