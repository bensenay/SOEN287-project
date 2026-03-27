function createCourse(courseCode, courseName, termDate) {
    fetch('/admin/courses/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: courseCode, name: courseName, term: termDate })
    })
    .then(res => res.json())
    .then(data => {
        if (data.error) {
            alert(data.error);
        } else {
            alert(`Course ${courseName} Created Successfully!`);
            location.reload();
        }
    });
}

function deleteCourse(courseID) {
    fetch('/admin/courses/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId: courseID })
    })
    .then(res => res.json())
    .then(data => {
        if (data.error) {
            alert(data.error);
        } else {
            alert("Course deleted successfully");
            location.reload();
        }
    });
}

function applyRestriction(action, courseId) {
    fetch('/admin/courses/restrict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId: courseId, action: action })
    })
    .then(res => res.json())
    .then(data => {
        if (data.error) {
            alert(data.error);
        } else {
            alert(`Course ${action}d successfully!`);
            displayAdminCourseGrid();
            displayRestrictGrid();
        }
    });
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

    fetch('/admin/courses')
        .then(res => res.json())
        .then(courses => {
            courseGrid.innerHTML = "";

            if (courses.length === 0) {
                courseGrid.innerHTML = `<p class="no-courses">No courses created yet.</p>`;
                return;
            }

            courses.forEach(course => {
                const color = course.enabled ? 'black' : 'red';
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

    fetch('/admin/courses')
        .then(res => res.json())
        .then(courses => {
            grid.innerHTML = "";

            if (courses.length === 0) {
                grid.innerHTML = `<p class="no-courses">No courses created yet.</p>`;
                return;
            }

            courses.forEach(course => {
                const isEnabled = course.enabled === 1;
                const card = `
                    <div class="course-box">
                        <img src="https://img.uxcel.com/cdn-cgi/image/format=auto/tags/basic-shapes-1721717546217-2x.jpg" alt="Course Thumbnail">
                        <p>${course.name}</p>
                        <span class="course-code">${course.code}</span>
                        <span style="font-size:12px; color: ${isEnabled ? 'green' : 'red'}; font-weight: bold;">
                            ${isEnabled ? 'Enabled' : 'Disabled'}
                        </span>
                        <div style="display:flex; gap:8px; margin-top:6px;">
                            <button onclick="applyRestriction('enable', '${course.id}')" ${isEnabled ? 'disabled' : ''}>Enable</button>
                            <button onclick="applyRestriction('disable', '${course.id}')" ${!isEnabled ? 'disabled' : ''}>Disable</button>
                        </div>
                    </div>`;
                grid.innerHTML += card;
            });
        });
}

function displayCoursesInSelect() {
    fetch('/admin/courses')
        .then(res => res.json())
        .then(courses => {
            const selects = document.querySelectorAll(".course-list-select");
            selects.forEach(select => {
                select.innerHTML = "";
                courses.forEach(course => {
                    const option = document.createElement("option");
                    option.value = course.id;
                    option.textContent = `${course.code} - ${course.name}`;
                    select.appendChild(option);
                });
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