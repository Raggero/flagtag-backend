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
    console.log(`Server running on port ${port}`);
});

//Returns all users in database
app.get("/users", (req, res, next) => {
    const sqlQuery = "select * from users"
    let params = []
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
    const searchQuery = "select * from users where userName = ? AND userPassword = ?"
    let params =[req.params.name, req.params.password]
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

// Add new user to database. Validates that username is unique and at at least 2 characters and that
// password is at least two characters.
app.post("/users",
    body('username', "The username must be minimum 2 characters").isLength({min: 2}),
    body('password', "The password must be minimum 2 characters").isLength({min: 2}),
    (req, res, next) => {
        console.log(req.body.username);
        console.log(req.body.password);

        let errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).json({
                success: false,
                errors: errors.array()
            })
        }

        const insertQuery ='INSERT INTO users (userName, userPassword) VALUES (?,?)'
        let params =[req.body.username, req.body.password]
        db.run(insertQuery, params, function (err, result) {
            if (err){
                const checkUserError = "SQLITE_CONSTRAINT: UNIQUE constraint failed: users.userName"
                let error = [];
                if(err.message === checkUserError){
                    let responseMsg = {value: req.body.username ,msg: "Username already taken", param: "username"}
                    error.push(responseMsg)
                    res.status(409).json({success: false, errors: error})
                }
                else{
                    let responseError = {error: err.message}
                    error.push(responseError)
                    res.status(400).json({success: false, errors: error})
                }
                return;
            }
            res.json({
                success: true,
                message: 'Account created',
                "users": {
                    "userId" : this.lastID,
                    username: req.body.username,
                    password: req.body.password
                }
            })
        });
    });

//Search by name and password. If no such user exists returns empty json.
//ex localhost:3000/users/Helena/asd
app.put("/users/update", (req, res, next) => {
    const searchQuery = "update users set userName=? where id = ?"
    let params =[req.params.newUser, req.params.id]
    console.log(params);
    db.run(searchQuery, params, (error, rows) => {
        if (error) {
            res.status(400).json({"error":error.message});
            return;
        }
        res.json({
            success: true,
            message: 'Username updated',
            "user": {
                "userId" : req.params.id,
                username: req.params.name,
            }
        })
    });
});