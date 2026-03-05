let enrolledCoursesData = localStorage.getItem("enrolledCourses");
let enrolledCourses = JSON.parse(enrolledCoursesData) || [];

let availableCoursesData = localStorage.getItem("availableCourses");
let availableCourses = JSON.parse(availableCoursesData) || [];

let globalAssessmentsData = localStorage.getItem("assessments");
let globalAsssessments = JSON.parse(globalAssessmentsData) || [];

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
    location.reload();
}
function deleteCourse(courseCode) {
    availableCourses.forEach(course => {
        if(course.code === courseCode){
            availableCourses.splice(availableCourses.indexOf(course), 1);
            localStorage.setItem("availableCourses", JSON.stringify(availableCourses));
        }
    })
    window.location.reload();
}

function displayAvailableCourses(){
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
function displayEnrolledCourses() {

    enrolledCourses.forEach(course => {
        const enrolledCourse = `
            <div>
                <p><span>${course.code}</span> : ${course.name}</p>
                <hr>
            </div>
            `
        document.getElementById('droppable-courses-section').innerHTML += enrolledCourse;
    })
}
function enrollInCourse(courseCode){
    availableCourses.forEach(course => {
        if(course.code === courseCode && !enrolledCourses.some(e => e.id === course.id)) {

            enrolledCourses.push(course);
            localStorage.setItem("enrolledCourses", JSON.stringify(enrolledCourses));
        }
    })
    window.location.href = "studentprofile.html";
}
function unenrollFromCourse(courseCode){
    event.preventDefault();
    enrolledCourses.forEach(course => {
        if(course.code === courseCode){
            enrolledCourses.splice(enrolledCourses.indexOf(course), 1);
            localStorage.setItem("enrolledCourses", JSON.stringify(enrolledCourses));
        }
    })
    window.location.href = "studentprofile.html";
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

function displayAssessmentsInDashboard(){
        globalAsssessments.forEach(assessment => {
            const assessmentBox = `
                <div class="handout">
                    <div>
                        <h3>${assessment.name}</h3>
                        <p>Date: ${assessment.dueDate}</p>
                        <p>${assessment.description}</p>
                        <p>${assessment.completed? 'Complete!' : 'Pending...'}</p>
                    </div>
                    <div style="display: flex;flex-direction: column;gap: 20px">
                        <h3 style="text-align: center"><span id="assessment-grade">${assessment.grade}</span> / 100</h3>
                    </div>
                </div>`;
            document.getElementById('assessment-dashboard').innerHTML += assessmentBox ;
    })
}
function displayAssessments(){
        const courseId = new URLSearchParams(window.location.search).get("id");
        const currentCourse = enrolledCourses.find((course) => course.id === courseId);
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
                        <p>${assessment.completed? 'Complete!' : 'Pending...'}</p>
                    </div>
                    <div style="display: flex;flex-direction: column;gap: 20px">
                        <h3 style="text-align: center"><span id="assessment-grade">${assessment.grade}</span> / 100</h3>
                        <button>Edit grade</button>
                        <button onclick="removeAssessment('${assessment.id}')">Remove Assessment</button>
                        <button id='assessmentStatus' onclick="completeAssessment('${assessment.id}')">Mark as Done/Unfinished</button>
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
        grade : Math.round(100*Math.random()),
        completed :false
    };
    globalAsssessments.push(assessment);
    localStorage.setItem("assessments", JSON.stringify(globalAsssessments));

    const urlParams = new URLSearchParams(window.location.search);
    const courseId = urlParams.get("id");
    enrolledCourses = enrolledCourses.map(course => {
        if(course.id === courseId) {
            course.assessments.push(assessment);
        }
        return course;
    });
    localStorage.setItem("enrolledCourses", JSON.stringify(enrolledCourses));
    window.location.href = `Course.html?id=${courseId}`
}


function resetCourses(){
    localStorage.removeItem("assessments");
    globalAsssessments = [];
    localStorage.removeItem("enrolledCourses");
    enrolledCourses = []
    displayCourses();
}
function resetAssessments(){
    const courseId = new URLSearchParams(window.location.search).get("id");
    enrolledCourses.forEach(course => {
        if(course.id === courseId) {
            course.assessments.forEach(assessment => {
                globalAsssessments.splice(globalAsssessments.indexOf(assessment), 1);
            })
            localStorage.setItem("assessments", JSON.stringify(globalAsssessments));
            course.assessments = [];
        }
    })
    localStorage.setItem("enrolledCourses", JSON.stringify(enrolledCourses));
    window.location.reload();
}
function removeAssessment(assessmentId){
    const courseId = new URLSearchParams(window.location.search).get("id");
    enrolledCourses = enrolledCourses.map(course => {
        if(course.id === courseId) {
            course.assessments = course.assessments.filter(assessment => assessment.id !== assessmentId);
        }
            return course;
    });
    globalAsssessments = globalAsssessments.filter(assessment =>assessment.id !== assessmentId);
    localStorage.setItem("assessments", JSON.stringify(globalAsssessments));
    localStorage.setItem("enrolledCourses", JSON.stringify(enrolledCourses));
    window.location.reload();
}

function completeAssessment(assessmentId){
    const courseId = new URLSearchParams(window.location.search).get("id");
    enrolledCourses.forEach(course => {
        if(course.id === courseId) {
            course.assessments.forEach(assmnt => {
                if(assmnt.id === assessmentId){
                    assmnt.completed = !assmnt.completed;
                }
            })
        }
    })
    globalAsssessments.forEach(assessment => {
        if(assessment.id === assessmentId) {
            assessment.completed = !assessment.completed;
        }
    })
    localStorage.setItem("assessments", JSON.stringify(globalAsssessments));
    localStorage.setItem("enrolledCourses", JSON.stringify(enrolledCourses));
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
        document.getElementById("term").innerHTML = currentCourse.termDate;
    }
}

function avgGrade(){
    let sum = 0;
    const courseId = new URLSearchParams(window.location.search).get("id");
    enrolledCourses.forEach((course) => {
        if(course.id === courseId) {
            course.assessments.forEach(assessment => {
                sum += assessment.grade;
            })

            document.getElementById('average').innerHTML = course.assessments.length === 0? "" : sum/course.assessments.length;
        }
    })
}
function updateGraph(){
    const graphContainer = document.getElementById("assessment-graph");
    const assessmentTypes = ["Assignment", "Exam", "Quiz", "Lab"];
    const courseId = new URLSearchParams(window.location.search).get("id");
    enrolledCourses.forEach(course => {
        if(course.id === courseId) {
            assessmentTypes.forEach(assessmentType => {
                const scores = course.assessments.filter(assessment => assessment.type === assessmentType).map(assessment => assessment.grade);
                const avg = scores.length > 0? scores.reduce((a, b) => a + b/scores.length) : 0;
                const bar = `
                    <div style="display:flex;flex-direction:column;align-items: center;justify-content:flex-end;height: 100%">
                        <div class="bar" style="height: ${avg}%">
                            ${avg > 0? `${Math.round(avg)}%` : ""}
                        </div>
                        <span>${assessmentType}</span>
                    </div>
                `;
                graphContainer.innerHTML += bar;
            })
        }
    })


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
        displayAvailableCourses();
    }
    if(document.getElementById("droppable-courses-section")) {
        displayEnrolledCourses();
    }
    if(document.getElementById("average")) {
        avgGrade();
    }
    if(document.getElementById("assessment-dashboard")) {
        displayAssessmentsInDashboard();
    }
    if(document.getElementById("assessment-graph")) {
        updateGraph();
    }
})
