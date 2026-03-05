function openTab(evt, tabName) {
    let tabcontent = document.getElementsByClassName("tabcontent");
    let tablinks = document.getElementsByClassName("tablinks");

    for (let i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }

    for (let i = 0; i < tablinks.length; i++) {
        tablinks[i].classList.remove("active");
    }

    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.classList.add("active");
}

// Attach listeners
document.querySelectorAll(".tablinks").forEach(button => {
    button.addEventListener("click", function (event) {
        const tabName = this.dataset.tab;
        openTab(event, tabName);
    });
});

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
    
})