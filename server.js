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

app.get("/courses/available", (request, response) => {
    if (!request.session.userId) {
        return response.status(401).json({error: "Unauthorized"});
    }
    const sql = `
        SELECT * FROM courses
        WHERE enabled = 1
        AND id NOT IN (
            SELECT course_id FROM student_courses WHERE student_id = ?
        )
    `;
    db.query(sql, [request.session.userId], (err, results) => {
        if (err)
            return response.status(500).json({error: "Database error"});
        response.json(results);
    });
});

app.get("/courses/enrolled", (request, response) => {
    if (!request.session.userId) {
        return response.status(401).json({error: "Unauthorized"});
    }
    const sql = `
        SELECT courses.* FROM courses
        JOIN student_courses ON courses.id = student_courses.course_id
        WHERE student_courses.student_id = ?
    `;
    db.query(sql, [request.session.userId], (err, results) => {
        if (err)
            return response.status(500).json({error: "Database error"});
        response.json(results);
    });
});

app.post("/courses/enroll", (request, response) => {
    if (!request.session.userId) {
        return response.status(401).json({error: "Unauthorized"});
    }
    const { courseCode } = request.body;
    db.query("SELECT * FROM courses WHERE code = ?", [courseCode], (err, results) => {
        if (err)
            return response.status(500).json({error: "Database error"});
        if (results.length === 0)
            return response.status(404).json({error: "Course not found"});
        const course = results[0];
        db.query("SELECT * FROM student_courses WHERE student_id = ? AND course_id = ?", [request.session.userId, course.id], (err, existing) => {
            if (err)
                return response.status(500).json({error: "Database error"});
            if (existing.length > 0)
                return response.status(400).json({error: "Already enrolled"});
            db.query("INSERT INTO student_courses (student_id, course_id) VALUES (?, ?)", [request.session.userId, course.id], (err) => {
                if (err)
                    return response.status(500).json({error: "Database error"});
                response.json({ok: true});
            });
        });
    });
});

app.get("/courses/:id", (request, response) => {
    db.query("SELECT * FROM courses WHERE id = ?", [request.params.id], (err, results) => {
        if (err)
            return response.status(500).json({error: "Database error"});
        if (results.length === 0)
            return response.status(404).json({error: "Course not found"});
        response.json(results[0]);
    });
});

app.get("/admin/courses", (request, response) => {
    db.query("SELECT * FROM courses", (err, results) => {
        if (err)
            return response.status(500).json({error: "Database error"});
        response.json(results);
    });
});

app.post("/admin/courses/create", (request, response) => {
    const { code, name, term } = request.body;
    db.query("SELECT * FROM courses WHERE code = ?", [code], (err, results) => {
        if (err)
            return response.status(500).json({error: "Database error"});
        if (results.length > 0)
            return response.status(400).json({error: "Course code already exists"});
        db.query("INSERT INTO courses (code, name, term, enabled) VALUES (?, ?, ?, 1)", [code, name, term], (err) => {
            if (err)
                return response.status(500).json({error: "Database error"});
            response.json({ok: true});
        });
    });
});

app.post("/admin/courses/delete", (request, response) => {
    const { courseId } = request.body;
    db.query("DELETE FROM student_courses WHERE course_id = ?", [courseId], (err) => {
        if (err)
            return response.status(500).json({error: "Database error"});
        db.query("DELETE FROM courses WHERE id = ?", [courseId], (err) => {
            if (err)
                return response.status(500).json({error: "Database error"});
            response.json({ok: true});
        });
    });
});

app.post("/admin/courses/restrict", (request, response) => {
    const { courseId, action } = request.body;
    const enabled = action === "enable" ? 1 : 0;
    db.query("UPDATE courses SET enabled = ? WHERE id = ?", [enabled, courseId], (err) => {
        if (err)
            return response.status(500).json({error: "Database error"});
        response.json({ok: true});
    });
});

app.post("/courses/drop", (request, response) => {
    if (!request.session.userId) {
        return response.status(401).json({error: "Unauthorized"});
    }
    const { courseCode } = request.body;
    db.query("SELECT * FROM courses WHERE code = ?", [courseCode], (err, results) => {
        if (err)
            return response.status(500).json({error: "Database error"});
        if (results.length === 0)
            return response.status(404).json({error: "Course not found"});
        const course = results[0];
        db.query("DELETE FROM student_courses WHERE student_id = ? AND course_id = ?", [request.session.userId, course.id], (err) => {
            if (err)
                return response.status(500).json({error: "Database error"});
            response.json({ok: true});
        });
    });
});


app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
