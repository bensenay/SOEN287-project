
async function signUp(event) {
    event.preventDefault();
    const checkedRole = document.querySelector('input[name="TypeOfUser"]:checked');
    if(!checkedRole){
        alert('Please choose either Student or Admin.');
        return;
    }
    const res = await fetch('/signup', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            firstName: document.getElementById('FirstName').value,  
            lastName: document.getElementById('LastName').value,
            email: document.getElementById('UserEmail').value,
            password: document.getElementById('UserPassword').value,
            typeOfUser: checkedRole.value
        }),
    });
    const data = await res.json();
    if(!res.ok){
        alert('Error signing up: ' + data.message);
        return;
    }
    alert('Sign-up successful!');
    window.location.href = 'SignIn.html';
}

async function signIn(event) {
    event.preventDefault();
    const res = await fetch('/signin', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            email: document.getElementById('UserEmail').value,
            password: document.getElementById('UserPassword').value
        }),
    });
    const data = await res.json();
    if(!res.ok){
        alert('Error signing in: ' + data.message);
        return;
    }
    alert('Sign-in successful!');
    window.location.href = data.typeOfUser === 'Admin' ? 'Admin.html' : 'student.html';
}

// Display student info on profile page using local storage data from sign up
async function displayStudentInfo() {
    const res = await fetch('/profile');
    const user = await res.json();
    document.getElementById('email').innerHTML = user.email
    document.getElementById('student-id').innerHTML = user.studentId;
    document.getElementById('full-name').innerHTML = user.firstName + ' ' + user.lastName;
    document.getElementById('student-id').innerHTML = user.studentId;
}

window.addEventListener('load', displayStudentInfo); // call displayStudentInfo when profile page loads for dynamic content

