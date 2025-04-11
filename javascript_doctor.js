// auth.js (debe estar en el mismo directorio o ajustar la ruta)
export const API_BASE_URL = 'https://cmas-test-server-amauh3bjc4cug8gs.northeurope-01.azurewebsites.net/api';

// Mostrar notificación
export function showNotification(message, type = 'success', duration = 3000) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.classList.add('show');
    }, 10);

    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, duration);
}

// Función para hacer fetch con autenticación
export async function fetchWithAuth(endpoint, options = {}) {
    const token = localStorage.getItem('authToken');
    const url = `${API_BASE_URL}${endpoint}`;

    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };

    if (token && !options.skipAuth) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(url, {
            ...options,
            headers
        });

        if (response.status === 401) {
            localStorage.removeItem('authToken');
            window.location.href = '/login.html';
            return null;
        }

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Request failed');
        }

        return await response.json();
    } catch (error) {
        console.error('Fetch error:', error);
        showNotification(error.message || 'An error occurred', 'error');
        throw error;
    }
}

// Verificar autenticación
export function checkAuth() {
    const token = localStorage.getItem('authToken');
    const userType = localStorage.getItem('userType');
    
    if (!token || userType !== 'doctor') {
        window.location.href = '/login.html';
    }
}

// javascript_doctor.js
import { fetchWithAuth, showNotification, checkAuth } from './auth.js';

// Variables globales
let currentPatientId = null;
let lineChartInstance = null;
let barChartInstance = null;

// Inicialización de la página
document.addEventListener('DOMContentLoaded', async function() {
    checkAuth();
    setupLogout();
    await initializePage();
});

function setupLogout() {
    document.getElementById('logout-btn').addEventListener('click', function() {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userType');
        window.location.href = '/login.html';
    });
}

async function initializePage() {
    try {
        // Cargar lista de pacientes
        const patients = await fetchWithAuth('/patients');
        renderPatientProfiles(patients);

        // Cargar datos del primer paciente si existe
        if (patients.length > 0) {
            currentPatientId = patients[0].id;
            await updatePatientData(currentPatientId);
        }

        // Configurar mensajería
        setupMessaging();
    } catch (error) {
        console.error('Initialization error:', error);
    }
}

function renderPatientProfiles(patients) {
    const profilesContainer = document.querySelector('.perfiles');
    profilesContainer.innerHTML = '';

    patients.forEach(patient => {
        const profile = document.createElement('div');
        profile.className = 'perfil';
        profile.id = `perfil-${patient.id}`;
        profile.innerHTML = `
            <i class="fas fa-user"></i>
            <p class="nombre">${patient.name}</p>
        `;

        profile.addEventListener('click', async () => {
            currentPatientId = patient.id;
            await updatePatientData(patient.id);
        });

        profilesContainer.appendChild(profile);
    });
}

async function updatePatientData(patientId) {
    try {
        showNotification('Loading patient data...', 'info');
        
        const [patient, results, history] = await Promise.all([
            fetchWithAuth(`/patients/${patientId}`),
            fetchWithAuth(`/patients/${patientId}/results/latest`),
            fetchWithAuth(`/patients/${patientId}/results`)
        ]);

        updatePatientTitles(patient.name);
        createLineChart(history);
        createBarChart(results.tests);
        fillResultsTable(results.tests);
        updatePatientVideo(results.videoUrl);

        showNotification(`${patient.name}'s data loaded successfully`, 'success');
    } catch (error) {
        console.error('Error updating patient data:', error);
    }
}

function updatePatientTitles(patientName) {
    document.getElementById('titulo-evolucion').textContent = `CMAS Evolution - ${patientName}`;
    document.getElementById('titulo-resultados').textContent = `${patientName}'s Test Results`;
    document.getElementById('titulo-detalle').textContent = `${patientName}'s Detailed Tests`;
    document.getElementById('titulo-video').textContent = `${patientName}'s Evaluation Video`;
    document.getElementById('titulo-mensaje').textContent = `Send Message to ${patientName}`;
}

function createLineChart(history) {
    const ctx = document.getElementById('lineChart').getContext('2d');
    
    if (lineChartInstance) lineChartInstance.destroy();

    lineChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: history.map((_, index) => `Test ${index + 1}`),
            datasets: [{
                label: 'CMAS Score',
                data: history.map(test => test.cmasScore),
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 3,
                tension: 0.1,
                fill: false
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'CMAS Progress Over Time',
                    font: { size: 16 }
                }
            },
            scales: {
                x: { title: { display: true, text: 'Assessment' } },
                y: {
                    title: { display: true, text: 'Score' },
                    min: 0,
                    max: 100
                }
            }
        }
    });
}

function createBarChart(testResults) {
    const ctx = document.getElementById('barChart').getContext('2d');
    const testNames = Object.keys(testResults);
    const scores = testNames.map(test => testResults[test].score);
    const maxScores = testNames.map(test => testResults[test].max);

    if (barChartInstance) barChartInstance.destroy();

    barChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: testNames,
            datasets: [
                {
                    label: 'Score',
                    data: scores,
                    backgroundColor: 'rgba(54, 162, 235, 0.7)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Max Possible',
                    data: maxScores,
                    backgroundColor: 'rgba(201, 203, 207, 0.5)',
                    borderColor: 'rgba(201, 203, 207, 1)',
                    borderWidth: 1,
                    type: 'line'
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Test Scores Breakdown',
                    font: { size: 16 }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: Math.max(...maxScores) + 1
                }
            }
        }
    });
}

function fillResultsTable(testResults) {
    const tableBody = document.getElementById('tabla-resultados').querySelector('tbody');
    tableBody.innerHTML = '';
    const sortedTests = Object.keys(testResults).sort();

    sortedTests.forEach(test => {
        const data = testResults[test];
        const row = tableBody.insertRow();

        row.insertCell(0).textContent = test;
        row.insertCell(1).textContent = `${data.score}/${data.max}`;
        row.insertCell(2).textContent = getTestInterpretation(test, data.score);

        // Color coding based on performance
        const performanceRatio = data.score / data.max;
        if (performanceRatio < 0.5) {
            row.cells[2].style.color = '#e63946';
        } else if (performanceRatio < 0.75) {
            row.cells[2].style.color = '#f4a261';
        } else {
            row.cells[2].style.color = '#2a9d8f';
        }
    });
}

function getTestInterpretation(test, score) {
    const interpretations = {
        "Head Lift": {
            0: "Unable to lift head",
            1: "Lifts head for 1-9 seconds",
            2: "Lifts head for 10-29 seconds",
            3: "Lifts head for 30-59 seconds",
            4: "Lifts head for 60-119 seconds",
            5: "Maintains head lift for 2 minutes"
        },
        "Leg Raise/Touch Object": {
            0: "Unable to lift leg off table",
            1: "Able to clear table but can't touch object",
            2: "Able to lift leg and touch object"
        },
        "Straight Leg Lift/Duration": {
            0: "Unable to lift leg",
            1: "Maintains leg lift for 1-9 seconds",
            2: "Maintains leg lift for 10-29 seconds",
            3: "Maintains leg lift for 30-59 seconds",
            4: "Maintains leg lift for 60-119 seconds",
            5: "Maintains leg lift for 2 minutes"
        },
        "Supine to Prone": {
            0: "Unable to turn over",
            1: "Turns to side but can't free arm completely",
            2: "Turns over with some difficulty",
            3: "Turns over easily with no difficulty"
        },
        "Sit-ups": {
            0: "Unable to perform any sit-up variation",
            1: "Can perform 1 sit-up variation",
            2: "Can perform 2 sit-up variations",
            3: "Can perform 3 sit-up variations",
            4: "Can perform 4 sit-up variations",
            5: "Can perform 5 sit-up variations",
            6: "Can perform all 6 sit-up variations"
        },
        "Supine to Sit": {
            0: "Unable to sit up independently",
            1: "Can sit up with great difficulty",
            2: "Can sit up with some difficulty",
            3: "Can sit up with no difficulty"
        },
        "Arm Raise/Straighten": {
            0: "Cannot raise arms to shoulder level",
            1: "Can raise to shoulder level but not above head",
            2: "Can raise above head but not fully extend elbows",
            3: "Can fully extend arms straight above head"
        },
        "Arm Raise/Duration": {
            0: "Unable to maintain arm position",
            1: "Maintains position for 1-9 seconds",
            2: "Maintains position for 10-29 seconds",
            3: "Maintains position for 30-59 seconds",
            4: "Maintains position for 60-119 seconds",
            5: "Maintains position for 2 minutes"
        },
        "Floor Sit": {
            0: "Unable to sit on floor",
            1: "Can sit with chair support",
            2: "Can sit without support but with difficulty",
            3: "Can sit without support easily"
        },
        "All Fours Maneuver": {
            0: "Unable to get on all fours",
            1: "Can assume position but can't maintain",
            2: "Can maintain position but can't crawl",
            3: "Can crawl forward",
            4: "Can extend one leg while maintaining balance"
        },
        "Floor Rise": {
            0: "Unable to rise from floor",
            1: "Can rise with chair support",
            2: "Can rise using hands on knees/thighs",
            3: "Can rise with mild difficulty",
            4: "Can rise with no difficulty"
        },
        "Chair Rise": {
            0: "Unable to rise from chair",
            1: "Can rise using hands on seat",
            2: "Can rise using hands on knees",
            3: "Can rise with mild difficulty",
            4: "Can rise with no difficulty"
        },
        "Stool Step": {
            0: "Unable to step onto stool",
            1: "Can step up with table support",
            2: "Can step up using hand on knee",
            3: "Can step up without assistance"
        },
        "Pick-up": {
            0: "Unable to pick up object from floor",
            1: "Can pick up with heavy knee support",
            2: "Can pick up with brief knee support",
            3: "Can pick up without support"
        }
    };

    // Verificar si el test existe y si el score es válido
    if (!interpretations[test]) {
        console.warn(`Interpretation not found for test: ${test}`);
        return "No interpretation available";
    }

    if (interpretations[test][score] === undefined) {
        console.warn(`Invalid score ${score} for test: ${test}`);
        return "Invalid score";
    }

    return interpretations[test][score];
}

function updatePatientVideo(videoUrl) {
    const videoPlayer = document.getElementById('video-paciente');
    videoPlayer.src = videoUrl || 'videos/default.mp4';
    videoPlayer.load();
}

function setupMessaging() {
    const messageType = document.getElementById('tipo-mensaje');
    const exerciseOptions = document.getElementById('opciones-ejercicio');

    messageType.addEventListener('change', function() {
        exerciseOptions.style.display = 
            (this.value === 'task' || this.value === 'reminder') ? 'block' : 'none';
    });

    document.getElementById('btn-enviar').addEventListener('click', async function() {
        if (!currentPatientId) {
            showNotification('Please select a patient first', 'error');
            return;
        }

        const messageData = {
            type: messageType.value,
            content: document.getElementById('texto-mensaje').value,
            exercises: messageType.value === 'task' ? 
                Array.from(document.querySelectorAll('input[name="ejercicio"]:checked'))
                    .map(el => el.value) : undefined
        };

        try {
            await fetchWithAuth(`/patients/${currentPatientId}/messages`, {
                method: 'POST',
                body: JSON.stringify(messageData)
            });

            showNotification('Message sent successfully', 'success');
            document.getElementById('texto-mensaje').value = '';
            document.querySelectorAll('input[name="ejercicio"]').forEach(el => {
                el.checked = false;
            });
        } catch (error) {
            console.error('Error sending message:', error);
        }
    });
}