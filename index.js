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
    const sqlQuery = "SELECT * FROM users"
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
    const searchQuery = "SELECT * FROM users WHERE userName = ? AND userPassword = ?"
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

app.put("/users/update",
    body('newUser', "The username must be minimum 2 characters").isLength({min: 2}),
    (req, res, next) => {

        let errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).json({
                success: false,
                errors: errors.array()
            })
        }

        const searchQuery = "UPDATE users SET userName=? WHERE userId = ?"
        let params =[req.body.newUser, req.body.userId]
        console.log(params);
        db.all(searchQuery, params, (err, rows) => {
            if(err){
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
                message: 'Username updated',
                "user": {
                    "userId" : req.body.userId,
                    "username" : req.body.newUser,
                }
            })
        });
    });

app.delete("/users/:name", (req, res, next) => {
    const searchQuery = "select * from users where userName = ?"
    const deleteQuery = "DELETE FROM users WHERE userName = ?"
    let params =req.params.name
    let accountExists;

    db.all(searchQuery, params, (error, result) =>{
        if(error){
            res.status(400).json({"error":error.message});
            console.log(error.message)
        }
        accountExists = result.length >= 1;

        if(accountExists){
            db.all(deleteQuery, params, (error, rows) => {
                if (error) {
                    res.status(400).json({"error":error.message});
                    return;
                }
                res.json({
                    success:true,
                    msg:"Account deleted"
                })
            });
        } else {
            res.status(400).json({
                success: false,
                msg:"Account not found"});
        }
    });
});

app.get("/highscore", (req, res, next) => {
    const searchQuery = "SELECT * FROM users WHERE userId >1 ORDER BY highscoreAllRegions desc LIMIT 5"
    let params = []
    db.all(searchQuery, params, (error, rows) => {
        if (error) {
            res.status(400).json({"error":error.message});
            return;
        }
        res.json({
            success:true,
            "users":rows
        });
    });
});

app.post("/highScore",
    (req ,res , next )=> {
    console.log(req.body.userId);
    console.log(req.body.highScore);
    console.log(req.body.region)
    let regionColumn = "highScore" + req.body.region
        const insertQuery =`UPDATE users SET ${regionColumn} = (?) WHERE userId = (?)`
        let params =[req.body.highScore, req.body.userId]
        db.run(insertQuery, params, function (){
            res.status(200)
            //Error handling not fixed
            if(error){
                console.log(error)
            }
        },
        res.json({
            success: true,
            message: 'Highscore Saved',
            "highscore" : {
                "userId" : req.body.userId,
                "highScore" : req.body.highScore,
                "region": req.body.region
            }
        })
        )
    }
)

app.put("/highscore", (req, res, next) => {
    const sqlQuery = "UPDATE users SET highScoreAllRegions = 0"
    let params = []
    db.all(sqlQuery, params, (error, rows) => {
        if (error) {
            res.status(400).json({"error":error.message});
            return;
        }
        res.json({
            success:true
        })
    });
});

app.put("/highscore/:name", (req, res, next) => {
    const searchQuery = "select * from users where userName = ?"
    const updateQuery = "UPDATE users SET highScoreAllRegions = 0 WHERE userName = ?"
    let params =req.params.name
    let accountExists;

    db.all(searchQuery, params, (error, result) =>{
        if(error){
            res.status(400).json({"error":error.message});
            console.log(error.message)
        }
        accountExists = result.length >= 1;

        if(accountExists){
            db.all(updateQuery, params, (error, rows) => {
                if (error) {
                    res.status(400).json({"error":error.message});
                    return;
                }
                res.json({
                    success:true,
                    msg:"Reset successful"
                })
            });
        }else {
            res.status(400).json({
                success: false,
                msg:"Account not found"});
        }
    });
});
