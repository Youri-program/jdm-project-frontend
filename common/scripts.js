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
