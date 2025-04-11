// auth.js (must be in the same directory or adjust the path)
export const API_BASE_URL = 'https://cmas-test-server-amauh3bjc4cug8gs.northeurope-01.azurewebsites.net/api';

// Show notification
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

// Function to make authenticated fetch requests
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
            localStorage.removeItem('userType');
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

// Verify authentication
export function checkAuth() {
    const token = localStorage.getItem('authToken');
    const userType = localStorage.getItem('userType');
    
    if (!token || userType !== 'doctor') {
        window.location.href = '/login.html';
    }
}

// javascript_doctor.js
import { fetchWithAuth, showNotification, checkAuth } from './auth.js';

// Global variables
let currentPatientId = null;
let lineChartInstance = null;
let barChartInstance = null;
let currentTestId = null;

// Page initialization
document.addEventListener('DOMContentLoaded', async function() {
    checkAuth();
    setupLogout();
    await initializePage();
    setupTestManagement();
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
        // Load assigned patients list
        const patients = await fetchWithAuth('/doctor/assignedPatients');
        renderPatientProfiles(patients);

        // Load data for the first patient if exists
        if (patients.length > 0) {
            currentPatientId = patients[0].patientId;
            await updatePatientData(currentPatientId);
        }

        // Setup messaging
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
        profile.id = `perfil-${patient.patientId}`;
        profile.innerHTML = `
            <i class="fas fa-user"></i>
            <p class="nombre">${patient.firstName} ${patient.lastName}</p>
            <small>DOB: ${new Date(patient.dateOfBirth).toLocaleDateString()}</small>
        `;

        profile.addEventListener('click', async () => {
            currentPatientId = patient.patientId;
            await updatePatientData(patient.patientId);
        });

        profilesContainer.appendChild(profile);
    });
}

async function updatePatientData(patientId) {
    try {
        showNotification('Loading patient data...', 'info');
        
        const [patient, tests] = await Promise.all([
            fetchWithAuth(`/patients/${patientId}`),
            fetchWithAuth(`/doctor/tests/results/${patientId}`)
        ]);

        updatePatientTitles(`${patient.firstName} ${patient.lastName}`);
        
        if (tests.length > 0) {
            // Get the latest test
            const latestTest = tests[tests.length - 1];
            currentTestId = latestTest.testId;
            
            createLineChart(tests);
            createBarChart(latestTest.results);
            fillResultsTable(latestTest.results);
            updatePatientVideo(latestTest.videoUrl);
            
            // Load test notes if available
            if (latestTest.notes) {
                displayTestNotes(latestTest.notes);
            }
        } else {
            // No tests available
            resetCharts();
            clearResultsTable();
            showNotification('No test results available for this patient', 'info');
        }

        showNotification('Patient data loaded successfully', 'success');
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

function createLineChart(testsHistory) {
    const ctx = document.getElementById('lineChart').getContext('2d');
    
    if (lineChartInstance) lineChartInstance.destroy();

    lineChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: testsHistory.map((_, index) => `Test ${index + 1}`),
            datasets: [{
                label: 'CMAS Score',
                data: testsHistory.map(test => test.totalScore),
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
    const maxScores = testNames.map(test => testResults[test].maxScore);

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
        row.insertCell(1).textContent = `${data.score}/${data.maxScore}`;
        row.insertCell(2).textContent = getTestInterpretation(test, data.score);

        // Color coding based on performance
        const performanceRatio = data.score / data.maxScore;
        if (performanceRatio < 0.5) {
            row.cells[2].style.color = '#e63946';
        } else if (performanceRatio < 0.75) {
            row.cells[2].style.color = '#f4a261';
        } else {
            row.cells[2].style.color = '#2a9d8f';
        }
    });
}

function resetCharts() {
    if (lineChartInstance) {
        lineChartInstance.destroy();
        lineChartInstance = null;
    }
    if (barChartInstance) {
        barChartInstance.destroy();
        barChartInstance = null;
    }
}

function clearResultsTable() {
    const tableBody = document.getElementById('tabla-resultados').querySelector('tbody');
    tableBody.innerHTML = '';
    const row = tableBody.insertRow();
    const cell = row.insertCell(0);
    cell.colSpan = 3;
    cell.textContent = 'No test results available';
    cell.style.textAlign = 'center';
}

function displayTestNotes(notes) {
    const notesContainer = document.getElementById('test-notes-container');
    notesContainer.innerHTML = '<h3>Test Notes</h3>';
    
    notes.forEach(note => {
        const noteElement = document.createElement('div');
        noteElement.className = 'test-note';
        noteElement.innerHTML = `
            <strong>${note.questionId}:</strong>
            <p>${note.note}</p>
        `;
        notesContainer.appendChild(noteElement);
    });
}

function getTestInterpretation(test, score) {
    // ... (keep the existing interpretation function as is)
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

function setupTestManagement() {
    // Create new test button
    document.getElementById('create-test-btn').addEventListener('click', async function() {
        if (!currentPatientId) {
            showNotification('Please select a patient first', 'error');
            return;
        }

        try {
            const response = await fetchWithAuth('/doctor/tests/create', {
                method: 'POST',
                body: JSON.stringify({
                    patientId: currentPatientId
                })
            });

            currentTestId = response.testId;
            showNotification('New test created successfully', 'success');
            
            // Refresh patient data to show the new test
            await updatePatientData(currentPatientId);
        } catch (error) {
            console.error('Error creating test:', error);
        }
    });

    // Save test notes button
    document.getElementById('save-notes-btn').addEventListener('click', async function() {
        if (!currentTestId) {
            showNotification('No active test selected', 'error');
            return;
        }

        const notesText = document.getElementById('test-notes-input').value;
        if (!notesText) {
            showNotification('Please enter some notes', 'error');
            return;
        }

        try {
            await fetchWithAuth(`/doctor/tests/${currentTestId}/notes`, {
                method: 'POST',
                body: JSON.stringify({
                    notes: [{
                        questionId: 'general',
                        note: notesText
                    }]
                })
            });

            showNotification('Notes saved successfully', 'success');
            document.getElementById('test-notes-input').value = '';
            
            // Refresh to show the new notes
            await updatePatientData(currentPatientId);
        } catch (error) {
            console.error('Error saving notes:', error);
        }
    });
}