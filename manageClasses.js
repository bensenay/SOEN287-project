// let courses = ["SOEN228","SOEN287","SOEN249"];
let savedData = localStorage.getItem("courses");
let courses = savedData? JSON.parse(savedData) : [""];

function displayCourses(){
    string = "";
    for(i = 0; i < courses.length; i++){
        string += courses[i] + " ";
    }
    document.getElementById("courses-enrolled").innerHTML = string;
}
function addCourses(course){
    event.preventDefault();
    courses.push(course);
    localStorage.setItem("courses", JSON.stringify(courses));
    window.location.href = "studentprofile.html"

}
function removeCourse(course){
    event.preventDefault();
    courses.splice(courses.indexOf(course), 1);
    localStorage.setItem("courses", JSON.stringify(courses));
    window.location.href = "studentprofile.html";
}
function resetCourses(){
    localStorage.removeItem("courses");
    courses = [""]
    displayCourses();
}
