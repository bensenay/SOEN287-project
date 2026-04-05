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
            return response.status(401).json({error: "Invalid email or password"});
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

app.get("/progress-summary", (request, response) => {
    if (!request.session.userId) {
        return response.status(401).json({error: "Unauthorized"});
    }
    const userId = request.session.userId;

    // get enrolled courses for this student
    const coursesSql = `
        SELECT courses.* FROM courses
        JOIN student_courses ON courses.id = student_courses.course_id
        WHERE student_courses.student_id = ?
    `;
    db.query(coursesSql, [userId], (err, courses) => {
        if (err)
            return response.status(500).json({error: "Database error"});

        if (courses.length === 0) {
            return response.json({
                estimatedGpa: 0,
                totalCourses: 0,
                completedAssessments: 0,
                pendingAssessments: 0,
                courseProgress: [],
                upcomingAssessments: []
            });
        }

        // get all assessments for this student's enrolled courses
        const assessmentsSql = `
            SELECT assessments.id, assessments.course_id, assessments.type, assessments.name,
                   assessments.due_date, assessments.description, assessments.due_date AS dueDate,
                   COALESCE(sg.grade, 0) AS grade, COALESCE(sg.completed, 0) AS completed
            FROM assessments
            JOIN student_courses ON assessments.course_id = student_courses.course_id
            LEFT JOIN student_grades sg ON sg.assessment_id = assessments.id AND sg.student_id = ?
            WHERE student_courses.student_id = ?
        `;
        db.query(assessmentsSql, [userId, userId], (err, assessments) => {
            if (err)
                return response.status(500).json({error: "Database error"});

            let completedCount = 0;
            let pendingCount = 0;
            assessments.forEach(a => {
                if (a.completed) completedCount++;
                else pendingCount++;
            });

            let totalAverage = 0;
            let coursesWithGrades = 0;

            const courseProgress = courses.map(course => {
                const courseAssessments = assessments.filter(a => a.course_id === course.id);
                let gradeSum = 0;
                let gradedCount = 0;
                let completedInCourse = 0;
                const totalInCourse = courseAssessments.length;

                courseAssessments.forEach(a => {
                    if (a.completed) completedInCourse++;
                    if (!isNaN(a.grade)) {
                        gradeSum += Number(a.grade);
                        gradedCount++;
                    }
                });

                let average = 0;
                if (gradedCount > 0) {
                    average = Math.round(gradeSum / gradedCount);
                    totalAverage += average;
                    coursesWithGrades++;
                }

                const progressPercent = totalInCourse > 0 ? Math.round((completedInCourse / totalInCourse) * 100) : 0;

                return {
                    code: course.code,
                    name: course.name,
                    average: average,
                    completedCount: completedInCourse,
                    totalCount: totalInCourse,
                    progressPercent: progressPercent
                };
            });

            let estimatedGpa = 0;
            if (coursesWithGrades > 0) {
                const overallAverage = totalAverage / coursesWithGrades;
                if (overallAverage >= 90) estimatedGpa = 4.3;
                else if (overallAverage >= 85) estimatedGpa = 4.0;
                else if (overallAverage >= 80) estimatedGpa = 3.7;
                else if (overallAverage >= 77) estimatedGpa = 3.3;
                else if (overallAverage >= 73) estimatedGpa = 3.0;
                else if (overallAverage >= 70) estimatedGpa = 2.7;
                else if (overallAverage >= 67) estimatedGpa = 2.3;
                else if (overallAverage >= 63) estimatedGpa = 2.0;
                else if (overallAverage >= 60) estimatedGpa = 1.7;
                else if (overallAverage >= 57) estimatedGpa = 1.3;
                else if (overallAverage >= 53) estimatedGpa = 1.0;
                else if (overallAverage >= 50) estimatedGpa = 0.7;
                else estimatedGpa = 0.0;
            }

            const upcomingAssessments = assessments
                .filter(a => !a.completed)
                .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
                .slice(0, 5)
                .map(a => ({ id: a.id, name: a.name, dueDate: a.dueDate, description: a.description, grade: a.grade }));

            response.json({
                estimatedGpa: estimatedGpa,
                totalCourses: courses.length,
                completedAssessments: completedCount,
                pendingAssessments: pendingCount,
                courseProgress: courseProgress,
                upcomingAssessments: upcomingAssessments
            });
        });
    });
});

app.get("/courses/:id/students", (request, response) => {
    const sql = `
        SELECT users.id, users.firstName, users.lastName FROM users
        JOIN student_courses ON users.id = student_courses.student_id
        WHERE student_courses.course_id = ?
    `;
    db.query(sql, [request.params.id], (err, results) => {
        if (err) return response.status(500).json({error: "Database error"});
        response.json(results);
    });
});

app.get("/courses/:id/assessments", (request, response) => {
    const studentId = request.query.studentId || request.session.userId || null;
    const sql = `
        SELECT assessments.id, assessments.course_id, assessments.type, assessments.name,
            assessments.due_date, assessments.description, assessments.due_date AS dueDate,
            COALESCE(sg.grade, 0) AS grade, COALESCE(sg.completed, 0) AS completed
        FROM assessments
        LEFT JOIN student_grades sg ON sg.assessment_id = assessments.id AND sg.student_id = ?
        WHERE assessments.course_id = ?
    `;
    db.query(sql, [studentId, request.params.id], (err, results) => {
        if (err)
            return response.status(500).json({error: "Database error"});
        response.json(results);
    });
});
app.get("/courses/:id/allAssessments", (request, response) => {
    const sql = `
        SELECT assessments.id, assessments.course_id, assessments.type, assessments.name,
            assessments.due_date, assessments.description, assessments.due_date AS dueDate,
        ROUND(AVG(COALESCE(sg.grade, 0))) AS grade,
        SUM(COALESCE(sg.completed, 0)) AS completedCount,
        ROUND((SUM(COALESCE(sg.completed, 0)) / (SELECT COUNT(*) FROM student_courses WHERE course_id = assessments.course_id)) * 100) AS completedPercent
        FROM assessments
        LEFT JOIN student_grades sg ON sg.assessment_id = assessments.id
        WHERE assessments.course_id = ?
        GROUP BY assessments.id, assessments.course_id, assessments.type, assessments.name,
            assessments.due_date, assessments.description
    `;
    db.query(sql, [request.params.id], (err, results) => {
        if (err)
            return response.status(500).json({error: "Database error : " + err.message});
        response.json(results);
    });
});

app.post("/courses/:id/assessments/add", (request, response) => {
    const { type, name, dueDate, description } = request.body;
    db.query("INSERT INTO assessments (course_id, type, name, due_date, description, grade, completed) VALUES (?, ?, ?, ?, ?, 0, 0)",
        [request.params.id, type, name, dueDate, description],
        (err) => {
            if (err)
                return response.status(500).json({error: "Database error"});
            response.json({ok: true});
        });
});

app.post("/courses/:id/assessments/reset", (request, response) => {
    db.query("DELETE FROM assessments WHERE course_id = ?", [request.params.id], (err) => {
        if (err)
            return response.status(500).json({error: "Database error"});
        response.json({ok: true});
    });
});

app.post("/assessments/remove", (request, response) => {
    const { assessmentId } = request.body;
    db.query("DELETE FROM assessments WHERE id = ?", [assessmentId], (err) => {
        if (err)
            return response.status(500).json({error: "Database error"});
        response.json({ok: true});
    });
});

app.post("/assessments/grade", (request, response) => {
    const { assessmentId, grade, studentId } = request.body;
    const targetStudent = studentId || request.session.userId;
    if (!targetStudent) return response.status(401).json({error: "Unauthorized"});
    db.query(
        "INSERT INTO student_grades (student_id, assessment_id, grade) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE grade = ?",
        [targetStudent, assessmentId, grade, grade],
        (err) => {
            if (err) return response.status(500).json({error: "Database error"});
            response.json({ok: true});
        }
    );
});

app.post("/assessments/complete", (request, response) => {
    const { assessmentId, studentId } = request.body;
    const targetStudent = studentId || request.session.userId;
    if (!targetStudent) return response.status(401).json({error: "Unauthorized"});
    db.query(
        "INSERT INTO student_grades (student_id, assessment_id, completed) VALUES (?, ?, 1) ON DUPLICATE KEY UPDATE completed = IF(completed = 1, 0, 1)",
        [targetStudent, assessmentId],
        (err) => {
            if (err) return response.status(500).json({error: "Database error"});
            response.json({ok: true});
        }
    );
});

app.get("/assessments", (request, response) => {
    if (!request.session.userId) {
        return response.status(401).json({error: "Unauthorized"});
    }
    const sql = `
        SELECT assessments.id, assessments.course_id, assessments.type, assessments.name,
               assessments.due_date, assessments.description, assessments.due_date AS dueDate,
               COALESCE(sg.grade, 0) AS grade, COALESCE(sg.completed, 0) AS completed
        FROM assessments
        JOIN student_courses ON assessments.course_id = student_courses.course_id
        LEFT JOIN student_grades sg ON sg.assessment_id = assessments.id AND sg.student_id = ?
        WHERE student_courses.student_id = ?
    `;
    db.query(sql, [request.session.userId, request.session.userId], (err, results) => {
        if (err)
            return response.status(500).json({error: "Database error"});
        response.json(results);
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


app.get("/courses/:id/weights", (request, response) => {
    const courseId = request.params.id;
    db.query("SELECT type, weight FROM course_weights WHERE course_id = ?", [courseId], (err, results) => {
        if (err) return response.status(500).json({error: "Database error"});
        const defaults = { Assignment: 25, Exam: 25, Quiz: 25, Lab: 25 };
        results.forEach(row => { defaults[row.type] = row.weight; });
        response.json(defaults);
    });
});

app.post("/courses/:id/weights", (request, response) => {
    const courseId = request.params.id;
    const { type, weight } = request.body;
    db.query(
        "INSERT INTO course_weights (course_id, type, weight) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE weight = ?",
        [courseId, type, weight, weight],
        (err) => {
            if (err) return response.status(500).json({error: "Database error"});
            response.json({ok: true});
        }
    );
});

app.post("/courses/drop-all", (request, response) => {
    if (!request.session.userId) {
        return response.status(401).json({error: "Unauthorized"});
    }
    db.query("DELETE FROM student_courses WHERE student_id = ?", [request.session.userId], (err) => {
        if (err)
            return response.status(500).json({error: "Database error"});
        response.json({ok: true});
    });
});

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
