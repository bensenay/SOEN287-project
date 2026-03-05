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

window.addEventListener("load", () => {
    displayAdminCourseGrid();
});

