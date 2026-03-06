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

function applyRestriction(action, courseId) {
    availableCourses = availableCourses.map(course => {
        if (course.id === courseId) {
            course.enabled = (action === "enable");

        }
        return course;
    });

    localStorage.setItem("availableCourses", JSON.stringify(availableCourses));
    
    alert(`Course ${action}d successfully!`); // notify user
    displayAdminCourseGrid(); // update without page refresh
    displayRestrictGrid();
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
        const color = course.enabled !== false ? 'black' : 'red';
        const courseBox = `
            <a href="adminCourse.html?id=${course.id}">
                <div class="course-box">
                    <img src="https://img.uxcel.com/cdn-cgi/image/format=auto/tags/basic-shapes-1721717546217-2x.jpg" alt="Course Thumbnail">
                    <p style="color: ${color}">${course.name}</p>
                    <span style="color: ${color}" class="course-code">${course.code}</span>
                </div>
            </a>
            `;
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

document.getElementById('apply-restriction-btn')?.addEventListener('click', () => {
    const courseId = document.getElementById('restrict-select').value;
    const selectedRadio = document.querySelector('input[name="restriction"]:checked');
    
    if (selectedRadio && courseId) {
        applyRestriction(selectedRadio.value, courseId);
    } else {
        alert("Please select both a course and an action.");
    }
});