changement faite le 28 mars :

- database.sql :
 ajout: courses, student_courses, course_weights, student_grades 

- server.js : 
ajout: weight routes (GET/POST /courses/:id/weights), POST /courses/drop-all, GET /courses/:id/students; 
modification: assessment routes to use student_grades 

- manageClasses.js : 
remaining local storage fait;  moved weight system to backend; 
added selectedStudentId + loadStudentAssessments() for custom student grading

- adminCourse.html : 
ajout:  student selector dropdown menu to see which student is enrolled in that class; gives custom grade per student

 a faire 

- Graphs: dynamic charts connected to DB (grade trends per student/course)
- Student schedule: connect weekly schedule view to DB (courses, times, rooms)
- GPA estimation: already done per course; extend to cumulative GPA across all semesters
- Export grades: allow admin to export student grades to PDF or CSV
- Deadline reminders: send email notifications before assessment due dates
- Dark/light mode: toggle theme support across all pages
