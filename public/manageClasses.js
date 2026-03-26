//arrays stored in local storage so that the data is saved

let enrolledCoursesData = localStorage.getItem("enrolledCourses");
let enrolledCourses = JSON.parse(enrolledCoursesData) || []; //return empty array if parse fails

let availableCoursesData = localStorage.getItem("availableCourses");
let availableCourses = JSON.parse(availableCoursesData) || [];

let globalAssessmentsData = localStorage.getItem("assessments");
let globalAsssessments = JSON.parse(globalAssessmentsData) || [];

const DEFAULT_WEIGHTS = { Assignment: 25, Exam: 25, Quiz: 25, Lab: 25 }; // default weight of each assessment type
const ASSESSMENT_TYPES = ["Assignment", "Exam","Quiz","Lab"];

// returns the weights of each assessment type of the course that matched with courseId
function getCourseWeights(courseId) {
    const stored = localStorage.getItem(`weights_${courseId}`);
    return stored ? JSON.parse(stored) : { ...DEFAULT_WEIGHTS };
}

//displays the weight of each assessment type for the current course
function displayCourseWeights(){
    const courseId = new URLSearchParams(window.location.search).get('id');
    const weights = getCourseWeights(courseId);
    ASSESSMENT_TYPES.forEach(type => {
        const display = document.getElementById(`weight-display-${type}`); // so type[0] will find id = 'weight-display-Assignment'
        if(display) // null check
            display.innerHTML = weights[type];
    })
}

//allows weight of type to be changeable or not changeable based on its current state
function toggleWeightEdit(type){
    const courseId = new URLSearchParams(window.location.search).get("id");
    const editSpan = document.getElementById(`weight-edit-${type}`);
    const input = document.getElementById(`weight-input-${type}`);
    const weights = getCourseWeights(courseId);

    //changes display to input to allow editing
    if(editSpan.style.display === "none"){
        input.value = weights[type];
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

    const weights = getCourseWeights(courseId);
    weights[type] = val;
    localStorage.setItem(`weights_${courseId}`, JSON.stringify(weights)); //store weight into localStorage

    const display = document.getElementById(`weight-display-${type}`);
    if (display) display.textContent = val; // null check

    document.getElementById(`weight-edit-${type}`).style.display = "none"; // remove input field
}

//allows grade of type to be changeable or not changeable based on its current state
function toggleGradeEdit(assessmentId){
    const editSpan = document.getElementById(`grade-edit-${assessmentId}`);
    const input = document.getElementById(`grade-input-${assessmentId}`);
    if (!editSpan || !input) return; //null check

    //changes display to input to allow editing
    if (editSpan.style.display === "none") {
        const courseId = new URLSearchParams(window.location.search).get("id");
        const course = availableCourses.find(c => c.id === courseId);
        const assessment = course?.assessments.find(a => a.id === assessmentId);
        input.value = assessment ? assessment.grade : 0;
        editSpan.style.display = "inline-flex";
        input.focus();
        input.select();
    } else {
        editSpan.style.display = "none";
    }
}

//button saves the grade that was input for the assessment with "assessmentId"

function saveGrade(assessmentId) {
    const courseId = new URLSearchParams(window.location.search).get("id");
    const input = document.getElementById(`grade-input-${assessmentId}`);
    const val = parseInt(input.value);

    if (val < 0 || val > 100 || isNaN(val)) {
        alert("Please enter a number between 0 and 100."); // check validity
        return;
    }

    //need to update assessment in both arrays availableCourses and globalAssessments
    availableCourses.forEach(course => {
        if (course.id === courseId)
        course.assessments.forEach(a => {
            if (a.id === assessmentId)
                a.grade = val;
        })
    })

    globalAsssessments.forEach(a =>{
        if (a.id === assessmentId)
            a.grade = val;
    })

    localStorage.setItem("availableCourses", JSON.stringify(availableCourses));
    localStorage.setItem("assessments", JSON.stringify(globalAsssessments));
    window.location.reload();
}

//displays courses that are available for the student to enroll in addClasses.html
function displayAvailableCourses(){
    const classSection = document.getElementById("courses-section");
    availableCourses.forEach(course => {
        //check that student is not already enrolled in current course in loop
        if (!enrolledCourses.some(e => e.id === course.id) && course.enabled !== false) {
            const availableCourse = `
            <div>
                <p><span>${course.code}</span> : ${course.name}</p>
                <hr>    
            </div>
            `
            classSection.innerHTML += availableCourse; // add div to "courses-section"
        }
    })
}

//displays courses student is enrolled in and can drop in dropClasses.html
function displayEnrolledCourses() {
    const classSection = document.getElementById("droppable-courses-section");
    enrolledCourses.forEach(course => {
        const enrolledCourse = `
            <div>
                <p><span>${course.code}</span> : ${course.name}</p>
                <hr>
            </div>
            `;
        classSection.innerHTML += enrolledCourse;
    })
}

//function adds courses to enrolledCourses when Add Class button is pressed
function enrollInCourse(courseCode){
    availableCourses.forEach(course => {
        if(course.code === courseCode) {
            // check that student is not already enrolled
            if(enrolledCourses.some(e => e.id === course.id)) {
                alert("You are already enrolled in this class!")
                return;
            }
            // add course to enrolledCourses and save to localStorage
            enrolledCourses.push(course);
            localStorage.setItem("enrolledCourses", JSON.stringify(enrolledCourses));
        }
    })
    window.location.href = "studentprofile.html";
}
//function removes course  from enrolledCourses when Drop Class button is pressed
function unenrollFromCourse(courseCode){
    event.preventDefault();
    enrolledCourses.forEach(course => {
        if(course.code === courseCode){
            //remove course from enrolledCourses and save
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

    courseGrid.innerHTML = ""; // reset course-grid before editing

    enrolledCourses.forEach((course) => {
        const source = availableCourses.find(c => c.id === course.id);
        if (source && source.enabled === false) return; //check that course is enabled

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
    })
}

//displays all assessments for all classes in the Assessment Dashboard
function displayAssessmentsInDashboard(){
        globalAsssessments.forEach(assessment => {
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
            document.getElementById('assessment-dashboard').innerHTML += assessmentBox ;
    })
}

//displays assessments in adminCourse.html based on the id
function displayAssessmentsAdmin(){
    const courseId = new URLSearchParams(window.location.search).get("id");
    const currentCourse = availableCourses.find((course) => course.id === courseId);
    currentCourse.assessments.forEach((assessment) => {
        //predefined div
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
                        <button onclick="toggleGradeEdit('${assessment.id}')">Edit grade</button> <!-- button that handles grade editing -->
                        <span id="grade-edit-${assessment.id}" style="display: none">
                            <input type="number" min="0" max="100" id="grade-input-${assessment.id}">
                            <button onclick="saveGrade('${assessment.id}')">Save</button> <!-- button that handle grade saving-->
                        </span>
                        <button onclick="removeAssessment('${assessment.id}')">Remove Assessment</button> <!-- button that removes the assessment from all lists-->
                        <button id='assessmentStatus' onclick="completeAssessment('${assessment.id}')">Mark as Done/Unfinished</button> <!-- button that marks the assessment as complete/pending-->
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
    })
}
//displays assessments in Course.html based on the id (similar to function above but students can't edit grades
function displayAssessmentsStudent(){
    const courseId = new URLSearchParams(window.location.search).get("id");
    const currentCourse = availableCourses.find((course) => course.id === courseId);
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
    })
}
//function creates assessments from the form in addAssessments.html and places it in globalAssessments and the assessmentList of the course it was created in
function addAssessment(type, name, dueDate, description){
    event.preventDefault();
    //create assessment object
    let assessment ={
        id : Date.now().toString(),
        type: type,
        name: name,
        dueDate : dueDate,
        description : description,
        grade : 0,
        completed :false
    };

    //add to globalAssessments
    globalAsssessments.push(assessment);
    localStorage.setItem("assessments", JSON.stringify(globalAsssessments));

    //add to assessment list of the course
    const urlParams = new URLSearchParams(window.location.search);
    const courseId = urlParams.get("id");
    availableCourses.forEach(course=>{
        if(course.id === courseId){
            course.assessments.push(assessment);
        }
    })
    localStorage.setItem("availableCourses", JSON.stringify(availableCourses));
    window.location.href = `adminCourse.html?id=${courseId}`
}

//unenrolls student from all courses and deletes all their assessments
function dropAllCourses(){
    enrolledCourses = [];
    globalAsssessments = [];

    localStorage.setItem("enrolledCourses", JSON.stringify(enrolledCourses));
    localStorage.setItem("assessments", JSON.stringify(globalAsssessments));

    window.location.reload();
}

//deletes all assessments in the course and removes them from global assessments
function resetAssessments(){
    const courseId = new URLSearchParams(window.location.search).get("id");
    availableCourses.forEach(course => {
        if(course.id === courseId) {
            course.assessments.forEach(assessment => {
                //remove assessment from globalAssessments
                globalAsssessments.splice(globalAsssessments.indexOf(assessment), 1);
            })
            localStorage.setItem("assessments", JSON.stringify(globalAsssessments));
            //empty the assessments array
            course.assessments = [];
        }
    })
    localStorage.setItem("availableCourses", JSON.stringify(availableCourses));
    window.location.reload();
}
// deletes a specific assessment from the global array and the inside the course
function removeAssessment(assessmentId){
    const courseId = new URLSearchParams(window.location.search).get("id");
    //remove from the course itself
    availableCourses.forEach(course => {
        if(course.id === courseId){
            course.assessments = course.assessments.filter(assessment => assessment.id !== assessmentId);
        }
    })
    //remove from global array
    globalAsssessments = globalAsssessments.filter(assessment =>assessment.id !== assessmentId);
    localStorage.setItem("assessments", JSON.stringify(globalAsssessments));
    localStorage.setItem("availableCourses", JSON.stringify(availableCourses));
    window.location.reload();
}

//marks assessment as complete or pending depending on its current state
function completeAssessment(assessmentId){
    const courseId = new URLSearchParams(window.location.search).get("id");
    availableCourses.forEach(course => {
        if(course.id === courseId) {
            course.assessments.forEach(assmnt => {
                if(assmnt.id === assessmentId){
                    assmnt.completed = !assmnt.completed; // set boolean to opposite
                }
            })
        }
    })
    globalAsssessments.forEach(assessment => {
        if(assessment.id === assessmentId) {
            assessment.completed = !assessment.completed; // set boolean to opposite
        }
    })
    localStorage.setItem("assessments", JSON.stringify(globalAsssessments));
    localStorage.setItem("availableCourses", JSON.stringify(availableCourses));
    window.location.reload();
}

//displays the information of the current course
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

//calculates the average grade of the course
function avgGrade(){
    const courseId = new URLSearchParams(window.location.search).get("id");
    const weights = getCourseWeights(courseId);

    availableCourses.forEach((course) => {
        if (course.id === courseId) {
            if (course.assessments.length === 0) {
                document.getElementById('average').innerHTML = ""; // display nothing if course has no assessments
                return;
            }

            let weightedSum = 0;
            let totalUsedWeight = 0;

            //calculate each weighted average based on assessment weight
            ASSESSMENT_TYPES.forEach(type => {
                const items = course.assessments.filter(a => a.type === type); //get all assessment of current type
                if (items.length === 0) return;
                const avg = items.reduce((sum, a) => sum + a.grade, 0) / items.length; // avg of all assessments of current type
                weightedSum += avg * (weights[type] / 100);
                totalUsedWeight += weights[type];
            });
            const finalAvg = totalUsedWeight > 0? Math.round((weightedSum / totalUsedWeight) * 100) : 0; //return weighted average
            document.getElementById('average').innerHTML = finalAvg;
        }
    });
}

//displays graph of the average of for each type of assessment
function updateGraph(){
    const graphContainer = document.getElementById("assessment-graph");
    const courseId = new URLSearchParams(window.location.search).get("id");
    availableCourses.forEach(course => {
        if(course.id === courseId) {
            ASSESSMENT_TYPES.forEach(assessmentType => {
                const grades = course.assessments.filter(assessment => assessment.type === assessmentType).map(assessment => assessment.grade); //gets grade values from array
                const avg = grades.length > 0? grades.reduce((sum, grade) => sum + grade)/grades.length : 0; // get avg if array is not empty

                //bar graph element based on grade
                const bar = `
                    <div style="display:flex;flex-direction:column;align-items: center;justify-content:flex-end;height: 100%">
                        <div class="bar" style="height: ${avg}%"> <!-- height based on grade-->
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

    totalCoursesElement.innerHTML = enrolledCourses.length;

    let completedCount = 0;
    let pendingCount = 0;

    globalAsssessments.forEach(assessment => {
        if(assessment.completed){
            completedCount++;
        } else {
            pendingCount++;
        }
    });

    completedElement.innerHTML = completedCount;
    pendingElement.innerHTML = pendingCount;

    let totalAverage = 0;
    let coursesWithGrades = 0;

    progressSection.innerHTML = "";

    if(enrolledCourses.length === 0){
        progressSection.innerHTML = `<div class="empty-message"><p>No enrolled courses to display yet.</p></div>`;
    } else {
        enrolledCourses.forEach(course => {
            let average = 0;
            let completedInCourse = 0;
            let totalInCourse = 0;

            if(course.assessments && course.assessments.length > 0){
                let gradeSum = 0;
                let gradedCount = 0;

                course.assessments.forEach(assessment => {
                    totalInCourse++;

                    if(assessment.completed){
                        completedInCourse++;
                    }

                    if(!isNaN(assessment.grade)){
                        gradeSum += Number(assessment.grade);
                        gradedCount++;
                    }
                });

                if(gradedCount > 0){
                    average = Math.round(gradeSum / gradedCount);
                    totalAverage += average;
                    coursesWithGrades++;
                }
            }

            let progressPercent = 0;
            if(totalInCourse > 0){
                progressPercent = Math.round((completedInCourse / totalInCourse) * 100);
            }

            const progressCard = `
                <div class="progress-card">
                    <h2>${course.code} - ${course.name}</h2>
                    <div class="progress-details">
                        <p><strong>Current Average:</strong> <span>${average}%</span></p>
                        <p><strong>Completed:</strong> <span>${completedInCourse}/${totalInCourse}</span></p>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progressPercent}%;"></div>
                    </div>
                </div>
            `;

            progressSection.innerHTML += progressCard;
        });
    }

    let estimatedGpa = 0;

    if(coursesWithGrades > 0){
        const overallAverage = totalAverage / coursesWithGrades;

        if(overallAverage >= 90){
            estimatedGpa = 4.3;
        } else if(overallAverage >= 85){
            estimatedGpa = 4.0;
        } else if(overallAverage >= 80){
            estimatedGpa = 3.7;
        } else if(overallAverage >= 77){
            estimatedGpa = 3.3;
        } else if(overallAverage >= 73){
            estimatedGpa = 3.0;
        } else if(overallAverage >= 70){
            estimatedGpa = 2.7;
        } else if(overallAverage >= 67){
            estimatedGpa = 2.3;
        } else if(overallAverage >= 63){
            estimatedGpa = 2.0;
        } else if(overallAverage >= 60){
            estimatedGpa = 1.7;
        } else if(overallAverage >= 57){
            estimatedGpa = 1.3;
        } else if(overallAverage >= 53){
            estimatedGpa = 1.0;
        } else if(overallAverage >= 50){
            estimatedGpa = 0.7;
        } else {
            estimatedGpa = 0.0;
        }
    }

    gpaElement.innerHTML = estimatedGpa.toFixed(2);

    let sortedAssessments = [...globalAsssessments].sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

    upcomingSection.innerHTML = "";

    const pendingAssessments = sortedAssessments.filter(assessment => !assessment.completed);

    if(pendingAssessments.length === 0){
        upcomingSection.innerHTML = `<div class="empty-message"><p>No upcoming assessments right now.</p></div>`;
    } else {
        pendingAssessments.slice(0, 5).forEach(assessment => {
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
}