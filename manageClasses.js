// let courses = ["SOEN228","SOEN287","SOEN249"];
let coursesData = localStorage.getItem("courses");
let courses = coursesData? JSON.parse(coursesData) : [];

let assessmentData = localStorage.getItem("assessments");
let assessments = assessmentData? JSON.parse(assessmentData) : [];

function displayCourses(){
    string = "";
    for(i = 0; i < courses.length; i++){
        if(courses[i].name !== undefined){
            string += courses[i].code + " ";
        }
    }
    document.getElementById("courses-enrolled").innerHTML = string;
}
function displayCoursesInCourseGrid(){
    const courseGrid = document.getElementById("course-grid");

    courseGrid.innerHTML = "";

    courses.forEach((course) => {
        const courseBox = `
        <a href="Course.html?id=${course.id}">
            <div class="course-box">
                <img src="https://img.uxcel.com/cdn-cgi/image/format=auto/tags/basic-shapes-1721717546217-2x.jpg" alt="">
                <p>${course.name}</p>
            </div>
        </a>`;
        courseGrid.innerHTML += courseBox;
    })
}
function displayAssessments(){
    assessments.forEach((assessment) => {
        const assessmentBox = `
            <div class="handout">
                <div>
                    <h3>${assessment.name}</h3>
                    <p>Date: ${assessment.dueDate}</p>
                    <p>${assessment.description}</p>
                </div>
                <div style="display: flex;flex-direction: column;gap: 20px">
                    <h3 style="text-align: center">~/100</h3>
                    <button>Edit grade</button>
                    <button>Remove Assessment</button>
                </div>
            </div>`;
        switch (assessment.type){
            case "Assignment":
                document.getElementById("assessment-grid").innerHTML += assessmentBox;
                break;
            case "Exam":
                document.getElementById("exam-section").innerHTML += assessmentBox;
                break;
            case "Quiz":
                document.getElementById("quiz-section").innerHTML += assessmentBox;
                break;
            case "Lab":
                document.getElementById("lab-section").innerHTML += assessmentBox;
                break;
        }
    })
}
function addCourses(courseCode, courseName, instructorName, termDate){
    event.preventDefault();
    let courseInfo ={
        id : Date.now().toString(),
        code: courseCode,
        name: courseName,
        instructorName: instructorName,
        termDate: termDate,
        assignments: [],
        exams : [],
        quizzes: [],
        labs:[]
    };
    courses.push(courseInfo);
    localStorage.setItem("courses", JSON.stringify(courses));
    window.location.href = "studentprofile.html"

}
function addAssessment(type, name, dueDate, description){
    event.preventDefault();
    let assessment ={
        type: type,
        name: name,
        dueDate : dueDate,
        description : description
    };
    assessments.push(assessment);
    console.log(assessment);
    localStorage.setItem("assessments", JSON.stringify(assessments));
    // window.location.href = "student.html"
}
function removeCourse(course){
    event.preventDefault();
    courses.splice(courses.indexOf(course), 1);
    localStorage.setItem("courses", JSON.stringify(courses));
    window.location.href = "studentprofile.html";
}
function resetCourses(){
    localStorage.removeItem("courses");
    courses = []
    displayCourses();
    displayCoursesInCourseGrid();
}
function resetAssessments(){
    localStorage.removeItem("assessments");
    assessments = []
    displayAssessments();

}
function displayCourseInfo(){
    console.log(window.location.search);
    const urlParams = new URLSearchParams(window.location.search);
    const courseId = urlParams.get("id");
    const currentCourse = courses.find(course => course.id === courseId);
    if(currentCourse){
        document.getElementById("classHeader").innerHTML = currentCourse.name;
        document.getElementById("course-code").innerHTML = currentCourse.code;
        document.getElementById("professor").innerHTML = currentCourse.instructorName;
    }
}
window.addEventListener("load",()=>{
    if (document.getElementById("course-grid")) {
        displayCoursesInCourseGrid();
    }
    if (document.getElementById("classHeader")) {
        displayCourseInfo();
    }
    if(document.getElementById("assessment-grid")) {
        displayAssessments();
    }
})
