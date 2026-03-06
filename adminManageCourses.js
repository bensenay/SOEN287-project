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

window.addEventListener("load", () => {
    displayAdminCourseGrid();
    displayRestrictGrid();
});