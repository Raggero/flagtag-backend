const express = require("express");
const app = express();
const cors = require('cors');
const db = require("./database.js");
const bodyParser = require("body-parser");
const { body, validationResult } = require('express-validator');

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
    console.log(params);
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

app.post("/users",
    body('username').isLength({min: 2}),
    body('password').isLength({min: 2}),
    (req, res, next) => {
        console.log(req.body.username);
        console.log(req.body.password);

        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).json({
                success: false,
                errors: errors.array()
            })
        }

        var insertQuery ='INSERT INTO users (userName, userPassword) VALUES (?,?)'
        var params =[req.body.username, req.body.password]
        db.run(insertQuery, params, function (err, result) {
            if (err){
                res.status(400).json({"error": err.message})
                return;
            }
            res.json({
                success: true,
                message: 'Login successful',
                "users": {
                    "userId" : this.lastID,
                    username: req.body.username,
                    password: req.body.password
                }
            })
        });
    });


