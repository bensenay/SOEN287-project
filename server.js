const express = require('express');
const mysql = require('mysql2');
const session = require('express-session');

// create connection to MySQL database
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'users_db'
});
db.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL database:', err);
    } else {
        console.log('Connected to MySQL database');
    }
});

const app = express();
app.use(express.json()); // for parsing application/json
app.use(session({
    secret: 'your_secret',
    resave: true,
    saveUninitialized: true,
}));
app.use(express.static('public')); // serve static files from the 'public' directory

app.post("/signup", (request, response) => {
    try {
        const { firstName, lastName, email, password, typeOfUser } = request.body;
        console.log("Signup body", request.body)
        const user = {
            firstName : firstName,
            lastName : lastName,
            email : email,
            password : password,
            typeOfUser : typeOfUser,
            studentId: typeOfUser === 'Student' ? Math.round(Math.random() * 100000000) : 0
        };
        let sql = "INSERT INTO users SET ?";
        db.query(sql, user, (err, result) => {
            if (err) {
                response.status(500).json({error: err.message});
            } else {
                response.json({ok:true});
            }
        });
    } catch (error) {
        console.error("Error during sign-up:", error);
        response.status(500).send("Internal Server Error");
    }
});
app.post("/signin", (request, response) => {
    const{ email, password } = request.body;
    db.query("SELECT * FROM users WHERE email = ? AND password = ?", [email, password], (err, results) => {
        if(err)
            response.status(500).json({error: "Database error"})
        const user = results[0];   
        if(!user)
            response.status(401).json({error: "Invalid email or password"});
        request.session.userId = Number(user.id); // store user ID in session for authentication
        request.session.save((err) =>{
        if(err){
            console.error("Error saving session:", err);
        }
        console.log("Session saved successfully");
        response.json({typeOfUser: user.typeOfUser})
    });

    }); // save session to ensure it's stored before sending response
});

app.get("/profile", (request, response) => {
    if(!request.session.userId){
        response.status(401).send({error: "Unauthorized"});
        return;
    }
    db.query("SELECT * FROM users WHERE id = ?", [request.session.userId], (err, results) => {
        if(err)
            return response.status(500).json({error: "Database error"});
        response.json(results[0]);
    });
});

app.get("/", (request, response) => {
    response.sendFile(__dirname + "/public/SignIn.html");
});


app.listen(5000, () => {
    console.log('Server is running on http://localhost:5000');
});
