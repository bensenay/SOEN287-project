const ASSESSMENT_TYPES = ["Assignment", "Exam","Quiz","Lab"];
let selectedStudentId = null;

// returns the weights of each assessment type from the backend
function getCourseWeights(courseId) {
    return fetch(`/courses/${courseId}/weights`).then(res => res.json());
}

//displays the weight of each assessment type for the current course
function displayCourseWeights(){
    const courseId = new URLSearchParams(window.location.search).get('id');
    getCourseWeights(courseId).then(weights => {
        ASSESSMENT_TYPES.forEach(type => {
            const display = document.getElementById(`weight-display-${type}`);
            if(display)
                display.innerHTML = weights[type];
        });
    });
}

//allows weight of type to be changeable or not changeable based on its current state
function toggleWeightEdit(type){
    const editSpan = document.getElementById(`weight-edit-${type}`);
    const input = document.getElementById(`weight-input-${type}`);
    const display = document.getElementById(`weight-display-${type}`);

    //changes display to input to allow editing
    if(editSpan.style.display === "none"){
        input.value = display ? display.textContent.trim() : 25;
        editSpan.style.display = "inline-flex";
        input.focus();
        input.select();
    }
    else{
        editSpan.style.display = "none"; //changes back to nothing if the display currently an input
    }
}

//button saves the weight that was input for the assessment "type"
function saveWeight(type){
    const courseId = new URLSearchParams(window.location.search).get("id");
    const input = document.getElementById(`weight-input-${type}`);
    const val = parseInt(input.value);

    if (val < 0 || val > 100 || isNaN(val)) {
        alert("Please enter a number between 0 and 100."); //validate input
        return;
    }

    fetch(`/courses/${courseId}/weights`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, weight: val })
    })
    .then(res => res.json())
    .then(data => {
        if (data.error) {
            alert(data.error);
        } else {
            const display = document.getElementById(`weight-display-${type}`);
            if (display) display.textContent = val;
            document.getElementById(`weight-edit-${type}`).style.display = "none";
        }
    });
}

//allows grade of type to be changeable or not changeable based on its current state
function toggleGradeEdit(assessmentId){
    const editSpan = document.getElementById(`grade-edit-${assessmentId}`);
    const input = document.getElementById(`grade-input-${assessmentId}`);
    if (!editSpan || !input) return; //null check

    //changes display to input to allow editing
    if (editSpan.style.display === "none") {
        const gradeDisplay = document.getElementById(`grade-display-${assessmentId}`);
        input.value = gradeDisplay ? gradeDisplay.textContent.trim() : 0;
        editSpan.style.display = "inline-flex";
        input.focus();
        input.select();
    } else {
        editSpan.style.display = "none";
    }
}

//button saves the grade that was input for the assessment with "assessmentId"

function saveGrade(assessmentId) {
    const input = document.getElementById(`grade-input-${assessmentId}`);
    const val = parseInt(input.value);

    if (val < 0 || val > 100 || isNaN(val)) {
        alert("Please enter a number between 0 and 100."); // check validity
        return;
    }

    const body = { assessmentId: assessmentId, grade: val };
    if (selectedStudentId) body.studentId = selectedStudentId;
    fetch('/assessments/grade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    })
    .then(res => res.json())
    .then(data => {
        if (data.error) {
            alert(data.error);
        } else {
            if (selectedStudentId) {
                loadStudentAssessments();
            } else {
                window.location.reload();
            }
        }
    });
}

//displays courses that are available for the student to enroll in addClasses.html
function displayAvailableCourses(){
    const classSection = document.getElementById("courses-section");
    fetch('/courses/available')
        .then(res => res.json())
        .then(courses => {
            courses.forEach(course => {
                const availableCourse = `
                <div>
                    <p><span>${course.code}</span> : ${course.name}</p>
                    <hr>    
                </div>
                `;
                classSection.innerHTML += availableCourse;
            });
        });
}

//displays courses student is enrolled in and can drop in dropClasses.html
function displayEnrolledCourses() {
    const classSection = document.getElementById("droppable-courses-section");
    fetch('/courses/enrolled')
        .then(res => res.json())
        .then(courses => {
            courses.forEach(course => {
                const enrolledCourse = `
                    <div>
                        <p><span>${course.code}</span> : ${course.name}</p>
                        <hr>
                    </div>
                    `;
                classSection.innerHTML += enrolledCourse;
            });
        });
}

//function adds courses to enrolledCourses when Add Class button is pressed
function enrollInCourse(courseCode){
    fetch('/courses/enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseCode: courseCode })
    })
    .then(res => res.json())
    .then(data => {
        if (data.error) {
            alert(data.error);
        } else {
            window.location.href = "studentprofile.html";
        }
    });
}

//function removes course from enrolledCourses when Drop Class button is pressed
function unenrollFromCourse(courseCode){
    fetch('/courses/drop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseCode: courseCode })
    })
    .then(res => res.json())
    .then(data => {
        if (data.error) {
            alert(data.error);
        } else {
            window.location.href = "studentprofile.html";
        }
    });
}

//for student profile to display enrolled classes
function displayCourses(){
    fetch('/courses/enrolled')
        .then(res => res.json())
        .then(courses => {
            let string = "";
            courses.forEach(course => {
                string += course.code + " ";
            });
            document.getElementById("courses-enrolled").innerHTML = string;
        });
}

//for student hub to display enrolled classes
function displayCoursesInCourseGrid(){
    const courseGrid = document.getElementById("course-grid");

    courseGrid.innerHTML = ""; // reset course-grid before editing

    fetch('/courses/enrolled')
        .then(res => res.json())
        .then(courses => {
            courses.forEach(course => {
                //create pre-defined div, has to link to course with personalized id
                const courseBox = `
                <a href="Course.html?id=${course.id}">
                    <div class="course-box">
                        <img src="https://img.uxcel.com/cdn-cgi/image/format=auto/tags/basic-shapes-1721717546217-2x.jpg" alt="">
                        <p>${course.name}</p>
                    </div>
                </a>`;
                //add courseBox to course-grid
                courseGrid.innerHTML += courseBox;
            });
        });
}

//displays all assessments for all classes in the Assessment Dashboard
function displayAssessmentsInDashboard(){
    fetch('/assessments')
        .then(res => res.json())
        .then(assessments => {
            assessments.forEach(assessment => {
                //pre-defined assessment div
                const assessmentBox = `
                    <div class="handout">
                        <div>
                            <h3>${assessment.name}</h3>
                            <p>Date: ${assessment.dueDate}</p>
                            <p>${assessment.description}</p>
                            <p>${assessment.completed? 'Complete!' : 'Pending...'}</p>
                        </div>
                        <div>
                            <h3><span id="assessment-grade">${assessment.grade}</span> / 100</h3>
                        </div>
                    </div>`;
                document.getElementById('assessment-dashboard').innerHTML += assessmentBox;
            });
        });
}

//displays assessments in adminCourse.html based on the id
function displayAssessmentsAdmin(){
    const courseId = new URLSearchParams(window.location.search).get("id");
    const select = document.getElementById("student-selector");
    if (!select) return;
    fetch(`/courses/${courseId}/students`)
        .then(res => res.json())
        .then(students => {
            select.innerHTML = '<option value="">-- Select a student --</option>';
            select.innerHTML += `<option value="">All Students</option>`;
            students.forEach(s => {
                select.innerHTML += `<option value="${s.id}">${s.firstName} ${s.lastName}</option>`;
            });
            select.onchange = function() {
                selectedStudentId = this.value;
                if (selectedStudentId) {
                    loadStudentAssessments();
                    avgGrade();
                    updateGraph();
                }
                else{
                    loadAssessments();
                }
            };
        });
}
//loads and renders assessments for the selected student (admin grading)
function loadStudentAssessments(){
    const courseId = new URLSearchParams(window.location.search).get("id");
    ["assignment-section","exam-section","quiz-section","lab-section"].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.innerHTML = "";
    });
    fetch(`/courses/${courseId}/assessments?studentId=${selectedStudentId}`)
        .then(res => res.json())
        .then(assessments => {
            assessments.forEach(assessment => {
                const assessmentBox = `
                        <div class="handout">
                            <div>
                                <h3>${assessment.name}</h3>
                                <p>Date: ${assessment.dueDate}</p>
                                <p>${assessment.description}</p>
                                <p>${assessment.completed? 'Complete!' : 'Pending...'}</p>
                            </div>
                            <div style="display: flex;flex-direction: column;gap: 20px">
                                <h3 style="text-align: center"><span id="grade-display-${assessment.id}">${assessment.grade}</span> / 100</h3>
                                <button onclick="toggleGradeEdit('${assessment.id}')">Edit grade</button>
                                <span id="grade-edit-${assessment.id}" style="display: none">
                                    <input type="number" min="0" max="100" id="grade-input-${assessment.id}">
                                    <button onclick="saveGrade('${assessment.id}')">Save</button>
                                </span>
                                <button onclick="removeAssessment('${assessment.id}')">Remove Assessment</button>
                                <button id='assessmentStatus' onclick="completeAssessment('${assessment.id}')">Mark as Done/Unfinished</button>
                            </div>
                        </div>`;
                switch (assessment.type) {
                    case "Assignment": document.getElementById("assignment-section").innerHTML += assessmentBox; break;
                    case "Exam": document.getElementById("exam-section").innerHTML += assessmentBox; break;
                    case "Quiz": document.getElementById("quiz-section").innerHTML += assessmentBox; break;
                    case "Lab": document.getElementById("lab-section").innerHTML += assessmentBox; break;
                }
            });
        });
}
function loadAssessments(){
    const courseId = new URLSearchParams(window.location.search).get("id");
    ["assignment-section","exam-section","quiz-section","lab-section"].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.innerHTML = "";
    });
    fetch(`/courses/${courseId}/allAssessments`)
        .then(res => res.json())
        .then(assessments => {
            assessments.forEach(assessment => {
                const assessmentBox = `
                        <div class="handout">
                            <div>
                                <h3>${assessment.name}</h3>
                                <p>Date: ${assessment.dueDate}</p>
                                <p>${assessment.description}</p>
                                    <div style="display: flex;flex-direction: column;gap: 20px">
                                    <button onclick="removeAssessment('${assessment.id}')">Remove Assessment</button>
                                </div>
                            </div>
                            
                            <div style="width: 50%;display: flex;flex-direction: column;gap: 20px; align-items: flex-end;justify-content: space-between;">
                                <div class="progress-details">
                                    <p><strong>Average grade: </strong><span>${assessment.grade}%</span></p>
                                    <p><strong>Student who compeleted this: </strong><span>${assessment.completedCount}</span></p>
                                </div>
                                <div class="progress-bar">
                                    <div class="progress-fill" style="width: ${assessment.completedPercent}%;"></div>
                                </div>
                            </div>
                        </div>`;
                        
                switch (assessment.type) {
                    case "Assignment": document.getElementById("assignment-section").innerHTML += assessmentBox; break;
                    case "Exam": document.getElementById("exam-section").innerHTML += assessmentBox; break;
                    case "Quiz": document.getElementById("quiz-section").innerHTML += assessmentBox; break;
                    case "Lab": document.getElementById("lab-section").innerHTML += assessmentBox; break;
                }
            });
        });
}
//displays assessments in Course.html based on the id (similar to function above but students can't edit grades
function displayAssessmentsStudent(){
    const courseId = new URLSearchParams(window.location.search).get("id");
    fetch(`/courses/${courseId}/assessments`)
        .then(res => res.json())
        .then(assessments => {
            assessments.forEach(assessment => {
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
                                <button onclick="removeAssessment('${assessment.id}')">Remove Assessment</button>
                                <button id='assessmentStatus' onclick="completeAssessment('${assessment.id}')">Mark as Done/Unfinished</button>
                            </div>
                        </div>`;
                //check the assessment type to make sure it gets placed in the right category
                switch (assessment.type) {
                    case "Assignment":
                        document.getElementById("assignment-section").innerHTML += assessmentBox;
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
            });
        });
}
//function creates assessments from the form in addAssessments.html and places it in the DB
function addAssessment(type, name, dueDate, description){
    event.preventDefault();
    const courseId = new URLSearchParams(window.location.search).get("id");
    fetch(`/courses/${courseId}/assessments/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: type, name: name, dueDate: dueDate, description: description })
    })
    .then(res => res.json())
    .then(data => {
        if (data.error) {
            alert(data.error);
        } else {
            window.location.href = `adminCourse.html?id=${courseId}`;
        }
    });
}

//unenrolls student from all courses and deletes all their assessments
function dropAllCourses(){
    fetch('/courses/drop-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    })
    .then(res => res.json())
    .then(data => {
        if (data.error) {
            alert(data.error);
        } else {
            window.location.reload();
        }
    });
}

//deletes all assessments in the course
function resetAssessments(){
    const courseId = new URLSearchParams(window.location.search).get("id");
    fetch(`/courses/${courseId}/assessments/reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    })
    .then(res => res.json())
    .then(data => {
        if (data.error) {
            alert(data.error);
        } else {
            window.location.reload();
        }
    });
}
// deletes a specific assessment
function removeAssessment(assessmentId){
    fetch('/assessments/remove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assessmentId: assessmentId })
    })
    .then(res => res.json())
    .then(data => {
        if (data.error) {
            alert(data.error);
        } else {
            window.location.reload();
        }
    });
}

//marks assessment as complete or pending depending on its current state
function completeAssessment(assessmentId){
    const body = { assessmentId: assessmentId };
    if (selectedStudentId) body.studentId = selectedStudentId;
    fetch('/assessments/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    })
    .then(res => res.json())
    .then(data => {
        if (data.error) {
            alert(data.error);
        } else {
            if (selectedStudentId) {
                loadStudentAssessments();
            } else {
                window.location.reload();
            }
        }
    });
}

//displays the information of the current course
function displayCourseInfo(){
    const urlParams = new URLSearchParams(window.location.search);
    const courseId = urlParams.get("id");
    fetch(`/courses/${courseId}`)
        .then(res => res.json())
        .then(course => {
            document.getElementById("classHeader").innerHTML = course.name;
            document.getElementById("course-code").innerHTML = course.code;
            document.getElementById("term").innerHTML = course.term;
        });
}

//calculates the average grade of the course
function avgGrade(){
    const courseId = new URLSearchParams(window.location.search).get("id");
    const assessmentsUrl = selectedStudentId
        ? `/courses/${courseId}/assessments?studentId=${selectedStudentId}`
        : `/courses/${courseId}/assessments`;
    Promise.all([
        fetch(`/courses/${courseId}/weights`).then(res => res.json()),
        fetch(assessmentsUrl).then(res => res.json())
    ]).then(([weights, assessments]) => {
        if (assessments.length === 0) {
            document.getElementById('average').innerHTML = ""; // display nothing if course has no assessments
            return;
        }

        let weightedSum = 0;
        let totalUsedWeight = 0;

        //calculate each weighted average based on assessment weight
        ASSESSMENT_TYPES.forEach(type => {
            const items = assessments.filter(a => a.type === type); //get all assessment of current type
            if (items.length === 0) return;
            const avg = items.reduce((sum, a) => sum + a.grade, 0) / items.length; // avg of all assessments of current type
            weightedSum += avg * (weights[type] / 100);
            totalUsedWeight += weights[type];
        });
        const finalAvg = totalUsedWeight > 0? Math.round((weightedSum / totalUsedWeight) * 100) : 0; //return weighted average
        document.getElementById('average').innerHTML = finalAvg;
    });
}

//displays graph of the average of for each type of assessment
function updateGraph(){
    const graphContainer = document.getElementById("assessment-graph");
    const courseId = new URLSearchParams(window.location.search).get("id");
    const assessmentsUrl = selectedStudentId
        ? `/courses/${courseId}/assessments?studentId=${selectedStudentId}`
        : `/courses/${courseId}/assessments`;
    graphContainer.innerHTML = "";
    fetch(assessmentsUrl)
        .then(res => res.json())
        .then(assessments => {
            ASSESSMENT_TYPES.forEach(assessmentType => {
                const grades = assessments.filter(a => a.type === assessmentType).map(a => a.grade); //gets grade values from array
                const avg = grades.length > 0? grades.reduce((sum, grade) => sum + grade)/grades.length : 0; // get avg if array is not empty

                //bar graph element based on grade
                const bar = `
                    <div style="display:flex;flex-direction:column;align-items: center;justify-content:flex-end;height: 100%">
                        <div class="bar" style="height: ${avg}%">
                            ${avg > 0? `${Math.round(avg)}%` : ""}
                        </div>
                        <span>${assessmentType}</span>
                    </div>
                `;
                graphContainer.innerHTML += bar;
            });
        });
}

//event listener so that only the right elements get loaded if the id is found in the page
window.addEventListener("load",()=>{
    if(document.getElementById("courses-enrolled")){
        displayCourses();
    }
    if (document.getElementById("course-grid")) {
        displayCoursesInCourseGrid();
    }
    if (document.getElementById("classHeader")) {
        displayCourseInfo();
    }
    if(document.getElementById("assessment-grid")){
        displayAssessmentsStudent()
    }
    if(document.getElementById("assessment-grid-admin")) {
        displayAssessmentsAdmin();
        displayCourseWeights();
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
//displays a summary page with GPA estimate, course progress and upcoming assessments
function renderProgressSummary(){
    const gpaElement = document.getElementById("estimated-gpa");
    const totalCoursesElement = document.getElementById("total-courses");
    const completedElement = document.getElementById("completed-assessments");
    const pendingElement = document.getElementById("pending-assessments");
    const progressSection = document.getElementById("course-progress-section");
    const upcomingSection = document.getElementById("upcoming-assessments-section");

    // stop function if page elements do not exist
    if(!gpaElement || !totalCoursesElement || !completedElement || !pendingElement || !progressSection || !upcomingSection){
        return;
    }

    fetch('/progress-summary')
        .then(res => res.json())
        .then(data => {
            gpaElement.innerHTML = data.estimatedGpa.toFixed(2);
            totalCoursesElement.innerHTML = data.totalCourses;
            completedElement.innerHTML = data.completedAssessments;
            pendingElement.innerHTML = data.pendingAssessments;

            progressSection.innerHTML = "";
            if (data.courseProgress.length === 0) {
                progressSection.innerHTML = `<div class="empty-message"><p>No enrolled courses to display yet.</p></div>`;
            } else {
                data.courseProgress.forEach(course => {
                    const progressCard = `
                        <div class="progress-card">
                            <h2>${course.code} - ${course.name}</h2>
                            <div class="progress-details">
                                <p><strong>Current Average:</strong> <span>${course.average}%</span></p>
                                <p><strong>Completed:</strong> <span>${course.completedCount}/${course.totalCount}</span></p>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${course.progressPercent}%;"></div>
                            </div>
                        </div>
                    `;
                    progressSection.innerHTML += progressCard;
                });
            }

            upcomingSection.innerHTML = "";
            if (data.upcomingAssessments.length === 0) {
                upcomingSection.innerHTML = `<div class="empty-message"><p>No upcoming assessments right now.</p></div>`;
            } else {
                data.upcomingAssessments.forEach(assessment => {
                    const upcomingBox = `
                        <div class="handout">
                            <div>
                                <h3>${assessment.name}</h3>
                                <p><strong>Due Date:</strong> ${assessment.dueDate}</p>
                                <p>${assessment.description}</p>
                                <p>Pending...</p>
                            </div>
                            <div>
                                <h3><span>${assessment.grade}</span> / 100</h3>
                            </div>
                        </div>
                    `;
                    upcomingSection.innerHTML += upcomingBox;
                });
            }
        });
}