document.addEventListener('DOMContentLoaded', function() {
    const user_usn = document.getElementById('us_usern');
    const doc_usn = document.getElementById('doc_user');
    const user_pass = document.getElementById('us_passw');
    const doc_pass = document.getElementById('doc_passw');


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
            };

            const response = await fetch('https://cmas-test-server-amauh3bjc4cug8gs.northeurope-01.azurewebsites.net/api/auth/login', request);
            console.log(response);

            if (!response.ok) {
                // Get detailed error from response body
                const errorData = await response.json().catch(() => ({ message: 'Failed to get error information' }));
                const errorMessage = errorData.message || 'Authorization error';
                console.error('Login error:', errorMessage);
                alert(errorMessage); // Show error to user
                return;
            }

            const data = await response.json();
            console.log('Successful login:', data);

            const token = data.token || data.accessToken || response.headers.get('Authorization');

            if (token) {
                localStorage.setItem('authToken', token);
                
                window.location.href = '../patient/index.html';
            } else {
                console.error('Authorization token not found in response');
                alert('Authentication problem: token not received');
            }
        } catch (error) {
            console.error('Error during login:', error);
            alert('An error occurred during login. Please try again later.');
        }
    });
});