document.addEventListener('DOMContentLoaded', function() {
    const user_usn= document.getElementById('us_usern');
    const doc_usn= document.getElementById('doc_user');
    const user_pass= document.getElementById('us_passw');
    const doc_pass= document.getElementById('doc_passw');


    document.getElementById('patient-login-btn').addEventListener('click', async function() {
        try {
            const loginData = {
                username: user_usn.value,
                password: user_pass.value
            };

            const request = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Connection': 'keep-alive'
                },
                body: JSON.stringify(loginData)
            }

            const response = await fetch('https://cmas-test-server-amauh3bjc4cug8gs.northeurope-01.azurewebsites.net/api/auth/login', request);
            console.log(response);

            if (!response.ok) {
                throw new Error('Login failed');
            }

            const data = await response.json();
            console.log('Login successful:', data);
            // Handle successful login (e.g., store token, redirect, etc.)
        } catch (error) {
            console.error('Error:', error);
            // Handle error (e.g., show error message to user)
        }
    });
});