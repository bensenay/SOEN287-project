//add a fuinction that would take the courses from enrolled courses from the local storage and display them in the schedule page
let savedData = localStorage.getItem("courses");
let courses = savedData? JSON.parse(savedData) : [""];
// function to display the courses in the schedule page
function displaySchedule(){
    string = "";
    for(i = 0; i < courses.length; i++){
        string += courses[i] + " ";
    }
    document.getElementById("schedule-courses").innerHTML = string;
}
// call the function to display the courses when the page loads
window.onload = displaySchedule();
