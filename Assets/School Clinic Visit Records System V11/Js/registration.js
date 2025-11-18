// register.js
document.getElementById('registrationForm').addEventListener('submit', function(event) {
    event.preventDefault(); 

    const username = document.getElementById('regUsername').value;
    const password = document.getElementById('regPassword').value;
    const rePassword = document.getElementById('regRePassword').value;

    if (password !== rePassword) {
        alert("Passwords do not match!");
        return;
    }

    let users = JSON.parse(localStorage.getItem('users')) || [];

    const userExists = users.some(user => user.username === username);
    if (userExists) {
        alert("Username already exists! Please choose a different username.");
        return;
    }

    const userData = {
        username: username,
        password: password
    };

    users.push(userData);
    localStorage.setItem('users', JSON.stringify(users));

    alert("Registration successful! You can now log in.");
    window.location.href = "../html/index.html"; // Redirect to login page
});


