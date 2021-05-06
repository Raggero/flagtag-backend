var express = require("express")
var app = express()
var cors = require('cors')
var db = require("./database.js")
var bodyParser = require("body-parser")

app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

var port = 3000

// Start server
app.listen(port, () => {
    console.log("Server running on port %PORT%".replace("%PORT%",port))
});

app.get("/users", (request, response, next) => {
    var sqlQuery = "select * from users"
    var params = []
    db.all(sqlQuery, params, (error, rows) => {
        if (error) {
            response.status(400).json({"error":error.message});
            return;
        }
        response.json({
            "users":rows
        })
    });
});

app.get("/users/:name", (request, response, next) => {
    console.log(request.query)
    var searchQuery = "select * from users where userName = ? AND userPassword = ?"
    var params =[request.params.name, request.query.password]
    db.all(searchQuery, params, (error, rows) => {
        if (error) {
            response.status(400).json({"error":error.message});
            return;
        }
        response.json({
            "users":rows
        })
    });
});


