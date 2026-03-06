function signUp(event) {
    event.preventDefault();

    const form = document.getElementById('signupForm');
    if (!form.checkValidity()) {
        form.reportValidity();  // show validation errors
        return;
    }

    const firstName = document.getElementById('FirstName').value;
    const lastName = document.getElementById('LastName').value;
    const email = document.getElementById('UserEmail').value;
    const password = document.getElementById('UserPassword').value;
    const checkedRole = document.querySelector('input[name="TypeOfUser"]:checked');

    if(!checkedRole){
        alert('Please choose either Student or Admin.');
        return;
    }
    const typeOfUser = checkedRole.value;

    // store in local storage (database soon)
    localStorage.setItem('firstName', firstName);
    localStorage.setItem('lastName', lastName);
    localStorage.setItem('email', email);
    localStorage.setItem('password', password);
    localStorage.setItem('typeOfUser', typeOfUser);
    if(typeOfUser === 'Student'){
        localStorage.setItem('studentId', Math.round(Math.random()*100000000));
    }

    // for debugging purposes
    console.log('User information stored in local storage:', {
        firstName: firstName,
        lastName: lastName,
        email: email,
        password: password,
        typeOfUser: typeOfUser
    });

    // redirect to SignIn page
    window.location.href = 'SignIn.html';

}

function signIn(event) {
    event.preventDefault();

    const email = document.getElementById('UserEmail').value; // get email and password from form
    const password = document.getElementById('UserPassword').value;

    const storedEmail = localStorage.getItem('email');
    const storedPassword = localStorage.getItem('password');
    const storedType = localStorage.getItem('typeOfUser'); // Student or Admin

    if (email === storedEmail && password === storedPassword) { // compare with local storage data
        alert('Sign-in successful!');
        if(storedType === "Admin"){ // redirect based on user type
            window.location.href = 'Admin.html';
        } else if (storedType === "Student"){
            window.location.href = 'student.html';
        } else{
            window.location.href = 'Login.html';
        }
    }
    else { // invalid credentials
        alert('Invalid email or password. Please try again.');
    }
}

// Display student info on profile page using local storage data from sign up
function displayStudentInfo() {
    document.getElementById('email').innerHTML = localStorage.getItem('email');
    document.getElementById('student-id').innerHTML = localStorage.getItem('studentId');
    document.getElementById('full-name').innerHTML = localStorage.getItem('firstName') + ' ' + localStorage.getItem('lastName');
    document.getElementById('student-id').innerHTML = localStorage.getItem('studentId');
}

window.addEventListener('load', displayStudentInfo); // call displayStudentInfo when profile page loads for dynamic content