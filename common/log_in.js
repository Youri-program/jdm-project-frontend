document.addEventListener('DOMContentLoaded', function() {
    const user_usn = document.getElementById('us_usern');
    const doc_usn = document.getElementById('doc_user');
    const user_pass = document.getElementById('us_pass');
    const doc_pass = document.getElementById('doc_pass');
    const reg_usn= document.getElementById('usr_register_usern');
    const email= document.getElementById('email');
    const reg_pasw= document.getElementById('usr_register_pasw');
    const first_n= document.getElementById('first_n');
    const last_n= document.getElementById('last_n');
    const phone_num= document.getElementById('phone_num');
    const date_birth= document.getElementById('date_birth');

    async function signUpPatient() {
        try {
            const signupData = {
                username: reg_usn.value,
                email: email.value,
                password: reg_pasw.value,
                firstName: first_n.value,
                lastName: last_n.value,
                phoneNumber: phone_num.value,
                dateOfBirth: date_birth.value
            };

            const request = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Connection': 'keep-alive'
                },
                body: JSON.stringify(signupData)
            };

            const response = await fetch('https://cmas-test-server-amauh3bjc4cug8gs.northeurope-01.azurewebsites.net/api/auth/signup/patient', request);

            if (!response.ok) {
                const responseText = await response.text();
                let errorMessage = 'Registration error';
                try {
                    if (responseText) {
                        const errorData = JSON.parse(responseText);
                        errorMessage = errorData.message || errorMessage;
                    }
                } catch (e) {}
                console.error('Signup error:', errorMessage);
                alert(errorMessage);
                return;
            }

            alert('Registration successful! Please log in.');

        } catch (error) {
            console.error('Error during signup:', error);
            alert('An error occurred during registration. Please try again later.');
        }
    }

    async function authenticate(username, password, userType) {
        try {
            const loginData = { username, password };
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
            if (!response.ok) {
                const responseText = await response.text();
                let errorMessage = 'Authorization error';
                try {
                    if (responseText) {
                        const errorData = JSON.parse(responseText);
                        errorMessage = errorData.message || errorMessage;
                    }
                } catch(e) {}

                console.error('Login error:', errorMessage);
                alert(errorMessage);
                return;
            }

            const authHeader = response.headers.get('Authorization');

            const responseText = await response.text();
            let token = authHeader;
            let data = {};

            if (responseText && responseText.length > 0) {
                try {
                    data = JSON.parse(responseText);
                    token = token || data.token || data.accessToken;
                } catch (e) {}
            }

            if (!token) {
                console.log('Token not found in response');

                const allHeadersStr = [];
                response.headers.forEach((value, name) => {
                    allHeadersStr.push(`${name}: ${value}`);
                });

                console.log('All headers:', allHeadersStr.join('\n'));
                alert('Authentication problem: token not received');
                return;
            }

            localStorage.setItem('authToken', token);
            localStorage.setItem('username', loginData.username);
            window.location.href = userType === 'doctor' ? '../doctor/Doctor_Frontend.html' : '../patient/index.html';
        } catch (error) {
            console.error('Error during login:', error);
            alert('An error occurred during login. Please try again later.');
        }
    }

    document.getElementById('patient-login-btn').addEventListener('click', function() {
        if(user_usn.value && user_pass.value) {
            authenticate(user_usn.value, user_pass.value, 'patient');
        }
    });

    document.getElementById('doctor-login-btn').addEventListener('click', function() {
        if(doc_usn.value && doc_pass.value) {
            authenticate(doc_usn.value, doc_pass.value, 'doctor');
        }
    });

    document.getElementById('patient-register-submit').addEventListener('click', function() {
        if (
            reg_usn.value && email.value && reg_pasw.value &&
            first_n.value && last_n.value && phone_num.value && date_birth.value
        ) {
            signUpPatient();
        } else {
            alert("Please fill in all fields.");
        }
    });

});