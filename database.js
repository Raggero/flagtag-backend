var sqlite3 = require('sqlite3').verbose()

const DBSOURCE = "flagtag.db"

let db = new sqlite3.Database(DBSOURCE, (error) => {
    if (error) {
        console.error(err.message)
        throw error
    }else{
        console.log('Connected to the SQlite database.')
        db.run(`CREATE TABLE "users" (
            "userId"	INTEGER,
            "userName"	TEXT UNIQUE,
            "userPassword"	TEXT,
            "highScoreAllRegions"	INTEGER,
            "highScoreAsia"	INTEGER,
            "highScoreEurope"	INTEGER,
            "highScoreAfrica"	INTEGER,
            "highScoreAmericas"	INTEGER,
            "highScoreOceania"	INTEGER,
            PRIMARY KEY("userId")
            )`,(error) => {
            if (error) {
                // Table already created
            }else{
                // Table created, inserting default users
                var insert = 'INSERT INTO users (userName, userPassword) VALUES (?,?)'
                db.run(insert, ["Helena","asd"])
                db.run(insert, ["Albert","zxc"])
                db.run(insert, ["Sean","qwe"])
                db.run(insert, ["Oskar","dsa"])
                db.run(insert, ["Peter","cxz"])
            }
        })
    }
})

module.exports = db