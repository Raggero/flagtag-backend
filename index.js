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

app.post("/users",
    body('username', "The username must be minimum 2 characters").isLength({min: 2}),
    body('password', "The password must be minimum 2 characters").isLength({min: 2}),
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

        const insertQuery ='INSERT INTO users (userName, userPassword) VALUES (?,?)'
        let params =[req.body.username, req.body.password]
        db.run(insertQuery, params, function (err, result) {
            if (err){
                const checkUserError = "SQLITE_CONSTRAINT: UNIQUE constraint failed: users.userName"
                if(err.message === checkUserError){
                    res.status(409).json({success: false, msg:'Username already taken'})
                }
                else{
                    res.status(400).json({success: false, error: err.message})
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


