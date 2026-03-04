let enrolledCoursesData = localStorage.getItem("enrolledCourses");
let enrolledCourses = JSON.parse(enrolledCoursesData) || [];
let availableCoursesData = localStorage.getItem("availableCourses");
let availableCourses = JSON.parse(availableCoursesData) || [];

//for admin
function createCourse(courseCode, courseName, termDate) {
    let courseInfo ={
        id : Date.now().toString(),
        code: courseCode,
        name: courseName,
        termDate: termDate,
        assessments: []
    };
    availableCourses.push(courseInfo);
    localStorage.setItem("availableCourses", JSON.stringify(availableCourses));
    alert(`Course ${courseName} Created Successfully!`);
}

function displayCoursesToEnroll(){
    const classSection = document.getElementById("courses-section");

    availableCourses.forEach(course => {
        if (!enrolledCourses.some(e => e.id === course.id)) {
            const availableCourse = `
            <div>
                <p><span>${course.code}</span> : ${course.name}</p>
                <hr>
            </div>
            `
            classSection.innerHTML += availableCourse;
        }
    })
}
function enrollInCourse(courseCode){
    availableCourses.forEach(course => {
        if(course.code === courseCode){

            enrolledCourses.push(course);
            localStorage.setItem("enrolledCourses", JSON.stringify(enrolledCourses));
        }
    })
    window.location.reload();
}

//for student profile to display enrolled classes
function displayCourses(){
    string = "";
    for(i = 0; i < enrolledCourses.length; i++){
        if(enrolledCourses[i].name !== undefined){
            string += enrolledCourses[i].code + " ";
        }
    }
    document.getElementById("courses-enrolled").innerHTML = string;
}

//for student hub to display enrolled classes
function displayCoursesInCourseGrid(){
    const courseGrid = document.getElementById("course-grid");

    courseGrid.innerHTML = "";

    enrolledCourses.forEach((course) => {
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
        const courseId = new URLSearchParams(window.location.search).get("id");
        const currentCourse = availableCourses.find((course) => course.id === courseId);
        if (!currentCourse || !currentCourse.assessments) {
            console.log("No assessments found for this course.");
            return;
        }
        console.log(currentCourse);

        currentCourse.assessments.forEach((assessment) => {
            const assessmentBox = `
                <div class="handout">
                    <div>
                        <h3>${assessment.name}</h3>
                        <p>Date: ${assessment.dueDate}</p>
                        <p>${assessment.description}</p>
                    </div>
                    <div style="display: flex;flex-direction: column;gap: 20px">
                        <h3> / 100</h3>
                        <button>Edit grade</button>
                        <button onclick="removeAssessment('${assessment.name}')">Remove Assessment</button>
                    </div>
                </div>`;
            switch (assessment.type) {
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
function addAssessment(type, name, dueDate, description){
    event.preventDefault();
    let assessment ={
        id : Date.now().toString(),
        type: type,
        name: name,
        dueDate : dueDate,
        description : description,
        grade : 0
    };
    const urlParams = new URLSearchParams(window.location.search);
    const courseId = urlParams.get("id");
    let allCourses = enrolledCourses
    allCourses = allCourses.map(course => {
        if(course.id === courseId) {
            course.assessments.push(assessment);
        }
        return course;
    });
    localStorage.setItem("courses", JSON.stringify(allCourses));
    window.location.href = `Course.html?id=${courseId}`
}

function removeCourse(course){
    event.preventDefault();
    enrolledCourses.splice(enrolledCourses.indexOf(course), 1);
    localStorage.setItem("courses", JSON.stringify(enrolledCourses));
    window.location.href = "studentprofile.html";
}
function resetCourses(){
    localStorage.removeItem("enrolledCourses");
    enrolledCourses = []
    displayCourses();
}
function resetAssessments(){
    let allCourses = enrolledCourses
    const courseId = new URLSearchParams(window.location.search).get("id");
    allCourses.forEach(course => {
        if(course.id === courseId) {
            course.assessments = [];
        }
    })
    localStorage.setItem("courses", JSON.stringify(allCourses));
    window.location.reload();
}
function removeAssessment(assessmentName){
    let allCourses = enrolledCourses
    const courseId = new URLSearchParams(window.location.search).get("id");
    allCourses = allCourses.map(course => {
        if(course.id === courseId) {
            course.assessments = course.assessments.filter(assessment => assessment.name !== assessmentName);
        }
            return course;
    });
    localStorage.setItem("courses", JSON.stringify(allCourses));
    window.location.reload();
}

function displayCourseInfo(){
    console.log(window.location.search);
    const urlParams = new URLSearchParams(window.location.search);
    const courseId = urlParams.get("id");
    const currentCourse = availableCourses.find(course => course.id === courseId);
    if(currentCourse){
        document.getElementById("classHeader").innerHTML = currentCourse.name;
        document.getElementById("course-code").innerHTML = currentCourse.code;
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
    if(document.getElementById("courses-section")) {
        displayCoursesToEnroll();
    }
})
