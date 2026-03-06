function createCourse(courseCode, courseName, termDate) {
    let courseInfo ={
        id : Date.now().toString(),
        code: courseCode,
        name: courseName,
        termDate: termDate,
        enabled: true,
        assessments: []
    };
    availableCourses.push(courseInfo);
    localStorage.setItem("availableCourses", JSON.stringify(availableCourses));
    alert(`Course ${courseName} Created Successfully!`);
    location.reload();
}

function deleteCourse(courseID) {
    console.log(courseID);
    const courseIndex = availableCourses.findIndex(course => course.id === courseID);
    if (courseIndex !== -1) {
        const courseId = availableCourses[courseIndex].id;
        // Remove from available
        availableCourses.splice(courseIndex, 1);
        // Remove from enrolled
        enrolledCourses = enrolledCourses.filter(course => course.id !== courseId);
        
        localStorage.setItem("availableCourses", JSON.stringify(availableCourses));
        localStorage.setItem("enrolledCourses", JSON.stringify(enrolledCourses));
        alert("Course deleted successfully");
        location.reload();
    }

    
}

function disableCourse(courseId) {
    availableCourses = availableCourses.map(course => {
        if (course.id === courseId) course.enabled = false;
        return course;
    });
    localStorage.setItem("availableCourses", JSON.stringify(availableCourses));
}

function enableCourse(courseId) {
    availableCourses = availableCourses.map(course => {
        if (course.id === courseId) course.enabled = true;
        return course;
    });
    localStorage.setItem("availableCourses", JSON.stringify(availableCourses));
}

function applyRestriction(courseId) {
    let value = document.getElementsByName("restriction").value;
    console.log(value, courseId);
    if (restriction === "disable") {
        disableCourse(courseId);
    } else if (restriction === "enable") {
        enableCourse(courseId);
    }
}

function openTab(evt, tabName) {
    let targetTab = document.getElementById(tabName);
    let tabcontent = document.getElementsByClassName("tabcontent");
    let tablinks = document.getElementsByClassName("tablinks");

    const isAlreadyOpen = targetTab.style.display === "block";

    for (let i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }

    for (let i = 0; i < tablinks.length; i++) {
        tablinks[i].classList.remove("active");
    }

    if (!isAlreadyOpen) {
        targetTab.style.display = "block";
        evt.currentTarget.classList.add("active");
    }

}

function displayAdminCourseGrid() {
    const courseGrid = document.getElementById("admin-course-grid");
    if (!courseGrid) return;

    const availableCourses = JSON.parse(localStorage.getItem("availableCourses")) || [];

    courseGrid.innerHTML = "";

    if (availableCourses.length === 0) {
        courseGrid.innerHTML = `<p class="no-courses">No courses created yet.</p>`;
        return;
    }

    availableCourses.forEach(course => {
        const courseBox = `
            <div class="course-box">
                <img src="https://img.uxcel.com/cdn-cgi/image/format=auto/tags/basic-shapes-1721717546217-2x.jpg" alt="Course Thumbnail">
                <p>${course.name}</p>
                <span class="course-code">${course.code}</span>
            </div>`;
        courseGrid.innerHTML += courseBox;
    });
}

document.querySelectorAll(".tablinks").forEach(button => {
    button.addEventListener("click", function (event) {
        const tabName = this.dataset.tab;
        openTab(event, tabName);
    });
});

function displayRestrictGrid() {
    const grid = document.getElementById("restrict-course-grid");
    if (!grid) return;

    const availableCourses = JSON.parse(localStorage.getItem("availableCourses")) || [];

    grid.innerHTML = "";

    if (availableCourses.length === 0) {
        grid.innerHTML = `<p class="no-courses">No courses created yet.</p>`;
        return;
    }

    availableCourses.forEach(course => {
        const isEnabled = course.enabled !== false;
        const card = `
            <div class="course-box">
                <img src="https://img.uxcel.com/cdn-cgi/image/format=auto/tags/basic-shapes-1721717546217-2x.jpg" alt="Course Thumbnail">
                <p>${course.name}</p>
                <span class="course-code">${course.code}</span>
                <span style="font-size:12px; color: ${isEnabled ? 'green' : 'red'}; font-weight: bold;">
                    ${isEnabled ? 'Enabled' : 'Disabled'}
                </span>
                <div style="display:flex; gap:8px; margin-top:6px;">
                    <button onclick="enableCourse('${course.id}'); displayRestrictGrid();" ${isEnabled ? 'disabled' : ''}>Enable</button>
                    <button onclick="disableCourse('${course.id}'); displayRestrictGrid();" ${!isEnabled ? 'disabled' : ''}>Disable</button>
                </div>
            </div>`;
        grid.innerHTML += card;
    });
}

function displayCoursesInSelect() {
    const selects = document.querySelectorAll(".course-list-select");

    selects.forEach(select => {
        // Clear existing options
        select.innerHTML = "";

        availableCourses.forEach(course => {
            const option = document.createElement("option");
            option.value = course.id;
            option.textContent = `${course.code} - ${course.name}`;
            select.appendChild(option);
        });
    });
}

window.addEventListener("load", ()=>{
    
    displayCoursesInSelect();
    displayAdminCourseGrid();
    displayRestrictGrid();
});