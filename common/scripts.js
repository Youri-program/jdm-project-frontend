function switchForm(role) {
    const userForm = document.getElementById('user-form');
    const adminForm = document.getElementById('admin-form');
    const userBtn = document.getElementById('user-btn');
    const adminBtn = document.getElementById('admin-btn');
    const body = document.body;

    if (role === 'user') {
        userForm.classList.remove('hidden');
        adminForm.classList.add('hidden');
        userBtn.classList.add('active');
        adminBtn.classList.remove('active');
        const userAction = async () => {
            const response = await fetch('https://cmas-test-server-amauh3bjc4cug8gs.northeurope-01.azurewebsites.net/api/auth/login', {
                method: 'POST',
                body: myBody, // string or object
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            const myJson = await response.json(); //extract JSON from the http response
            // do something with myJson
        }

        // Reset to blue theme
        body.classList.remove('doctor-mode');
    } else {
        adminForm.classList.remove('hidden');
        userForm.classList.add('hidden');
        adminBtn.classList.add('active');
        userBtn.classList.remove('active');

        // Apply green theme for doctor mode
        body.classList.add('doctor-mode');
    }
}
function switchForm(role) {
    const userForm = document.getElementById('user-form');
    const adminForm = document.getElementById('admin-form');
    const userBtn = document.getElementById('user-btn');
    const adminBtn = document.getElementById('admin-btn');
    const body = document.body;

    if (role === 'user') {
        // Fade out doctor form
        adminForm.classList.add('fade-out');
        setTimeout(() => {
            adminForm.classList.add('hidden');
            adminForm.classList.remove('fade-out');

            // Fade in patient form
            userForm.classList.remove('hidden');
            userForm.classList.add('fade-in');
        }, 300);

        userBtn.classList.add('active');
        adminBtn.classList.remove('active');
        body.classList.remove('doctor-mode');

    } else {
        // Fade out patient form
        userForm.classList.add('fade-out');
        setTimeout(() => {
            userForm.classList.add('hidden');
            userForm.classList.remove('fade-out');

            // Fade in doctor form
            adminForm.classList.remove('hidden');
            adminForm.classList.add('fade-in');
        }, 300);

        adminBtn.classList.add('active');
        userBtn.classList.remove('active');
        body.classList.add('doctor-mode');
    }
}

document.getElementById('register-patient').addEventListener('click', () => {
    const loginForm = document.getElementById('user-form');
    const registerForm = document.getElementById('register-form');

    // Animate out login
    loginForm.classList.add('fade-out');
    setTimeout(() => {
        loginForm.classList.add('hidden');
        loginForm.classList.remove('fade-out');

        // Show registration
        registerForm.classList.remove('hidden');
        registerForm.classList.add('fade-in');
    }, 300);
});

document.getElementById('back-to-login').addEventListener('click', () => {
    const loginForm = document.getElementById('user-form');
    const registerForm = document.getElementById('register-form');

    // Animate out registration
    registerForm.classList.add('fade-out');
    setTimeout(() => {
        registerForm.classList.add('hidden');
        registerForm.classList.remove('fade-out');

        // Show login
        loginForm.classList.remove('hidden');
        loginForm.classList.add('fade-in');
    }, 300);
});

