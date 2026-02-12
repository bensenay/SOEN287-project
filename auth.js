function signUp(event) {
    event.preventDefault();

    const form = document.getElementById('signupForm');
    if (!form.checkValidity()) {
        form.reportValidity();  // show validation errors
        return;
    }

    const firstName = document.getElementById('FirstName').value;
    const email = document.getElementById('UserEmail').value;
    const password = document.getElementById('UserPassword').value;
    const checkedRole = document.querySelector('input[name="TypeOfUser"]:checked');

    if(!checkedRole){
        alert('Please Choose either Student or Admin.');
        return;
    }
    const typeOfUser = checkedRole.value;

    // store in local storage (database soon)
    localStorage.setItem('firstName', firstName);
    localStorage.setItem('email', email);
    localStorage.setItem('password', password);
    localStorage.setItem('typeOfUser', typeOfUser);

    // for debugging purposes
    console.log('User information stored in local storage:', {
        firstName: firstName,
        email: email,
        password: password,
        typeOfUser: typeOfUser
    });

    // redirect to SignIn page
    window.location.href = 'SignIn.html';

}

function signIn(event) {
    event.preventDefault();

    const email = document.getElementById('UserEmail').value;
    const password = document.getElementById('UserPassword').value;

    const storedEmail = localStorage.getItem('email');
    const storedPassword = localStorage.getItem('password');
    const storedType = localStorage.getItem('typeOfUser'); // Student or Admin

    if (email === storedEmail && password === storedPassword) {
        alert('Sign-in successful!');
        if(storedType === "Admin"){
            window.location.href = 'Admin.html';
        } else if (storedType === "Student"){
            window.location.href = 'student.html';
        } else{
            window.location.href = 'Login.html';
        }
    }
    else {
        alert('Invalid email or password. Please try again.');
    }
}