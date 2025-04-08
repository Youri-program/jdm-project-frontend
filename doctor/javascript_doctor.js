// Complete Patient Data with all CMAS tests
const patientsData = {
    "Alexander": {
        labels: [1, 2, 3, 4, 5],
        data: [70, 75, 0, 85, 90],
        testResults: {
            "Head Lift": { score: 4, max: 5 },
            "Leg Raise/Touch Object": { score: 2, max: 2 },
            "Straight Leg Lift/Duration": { score: 3, max: 5 },
            "Supine to Prone": { score: 3, max: 3 },
            "Sit-ups": { score: 5, max: 6 },
            "Supine to Sit": { score: 3, max: 3 },
            "Arm Raise/Straighten": { score: 3, max: 3 },
            "Arm Raise/Duration": { score: 4, max: 5 },
            "Floor Sit": { score: 3, max: 3 },
            "All Fours Maneuver": { score: 3, max: 4 },
            "Floor Rise": { score: 4, max: 4 },
            "Chair Rise": { score: 4, max: 4 },
            "Stool Step": { score: 3, max: 3 },
            "Pick-up": { score: 3, max: 3 }
        },
        video: "videos/demo_alexander.mp4"
    },
    "Sofia": {
        labels: [1, 2, 3, 4, 5],
        data: [60, 65, 70, 75, 80],
        testResults: {
            "Head Lift": { score: 3, max: 5 },
            "Leg Raise/Touch Object": { score: 1, max: 2 },
            "Straight Leg Lift/Duration": { score: 2, max: 5 },
            "Supine to Prone": { score: 2, max: 3 },
            "Sit-ups": { score: 4, max: 6 },
            "Supine to Sit": { score: 2, max: 3 },
            "Arm Raise/Straighten": { score: 2, max: 3 },
            "Arm Raise/Duration": { score: 3, max: 5 },
            "Floor Sit": { score: 2, max: 3 },
            "All Fours Maneuver": { score: 2, max: 4 },
            "Floor Rise": { score: 3, max: 4 },
            "Chair Rise": { score: 3, max: 4 },
            "Stool Step": { score: 2, max: 3 },
            "Pick-up": { score: 2, max: 3 }
        },
        video: "videos/demo_sofia.mp4"
    },
    "Daniel": {
        labels: [1, 2, 3, 4, 5],
        data: [50, 55, 60, 30, 70],
        testResults: {
            "Head Lift": { score: 2, max: 5 },
            "Leg Raise/Touch Object": { score: 1, max: 2 },
            "Straight Leg Lift/Duration": { score: 1, max: 5 },
            "Supine to Prone": { score: 1, max: 3 },
            "Sit-ups": { score: 3, max: 6 },
            "Supine to Sit": { score: 1, max: 3 },
            "Arm Raise/Straighten": { score: 1, max: 3 },
            "Arm Raise/Duration": { score: 2, max: 5 },
            "Floor Sit": { score: 1, max: 3 },
            "All Fours Maneuver": { score: 1, max: 4 },
            "Floor Rise": { score: 2, max: 4 },
            "Chair Rise": { score: 2, max: 4 },
            "Stool Step": { score: 1, max: 3 },
            "Pick-up": { score: 1, max: 3 }
        },
        video: "videos/demo_daniel.mp4"
    }
};

// Complete CMAS Test Interpretations
const testInterpretations = {
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

// Chart instances
let lineChartInstance = null;
let barChartInstance = null;

// Update all patient-specific titles
function updatePatientTitles(patientName) {
    document.getElementById('titulo-evolucion').textContent = `CMAS Evolution - ${patientName}`;
    document.getElementById('titulo-resultados').textContent = `${patientName}'s Test Results`;
    document.getElementById('titulo-detalle').textContent = `${patientName}'s Detailed Tests`;
    document.getElementById('titulo-video').textContent = `${patientName}'s Evaluation Video`;
    document.getElementById('titulo-mensaje').textContent = `Send Message to ${patientName}`;
}

// Create line chart
function createLineChart(patientName) {
    const ctx = document.getElementById('lineChart').getContext('2d');
    const patient = patientsData[patientName];

    if (lineChartInstance) lineChartInstance.destroy();

    lineChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: patient.labels,
            datasets: [{
                label: `${patientName}'s CMAS Score`,
                data: patient.data,
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
                    text: `${patientName}'s CMAS Progress`,
                    font: { size: 16 }
                }
            },
            scales: {
                x: { title: { display: true, text: 'Assessment Number' } },
                y: {
                    title: { display: true, text: 'Score' },
                    min: 0,
                    max: 100
                }
            }
        }
    });
}

// Create bar chart
function createBarChart(patientName) {
    const ctx = document.getElementById('barChart').getContext('2d');
    const tests = patientsData[patientName].testResults;

    if (barChartInstance) barChartInstance.destroy();

    const testNames = Object.keys(tests);
    const scores = testNames.map(test => tests[test].score);
    const maxScores = testNames.map(test => tests[test].max);

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
                    text: `${patientName}'s Test Scores`,
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

// Fill results table with all tests
function fillResultsTable(patientName) {
    const tableBody = document.getElementById('tabla-resultados').querySelector('tbody');
    tableBody.innerHTML = '';
    const tests = patientsData[patientName].testResults;

    // Sort tests alphabetically
    const sortedTests = Object.keys(tests).sort();

    for (const test of sortedTests) {
        const data = tests[test];
        const row = tableBody.insertRow();

        row.insertCell(0).textContent = test;
        row.insertCell(1).textContent = `${data.score}/${data.max}`;
        row.insertCell(2).textContent = getTestInterpretation(test, data.score);

        // Add color coding based on performance
        const performanceRatio = data.score / data.max;
        if (performanceRatio < 0.5) {
            row.cells[2].style.color = '#e63946'; // Red for poor performance
        } else if (performanceRatio < 0.75) {
            row.cells[2].style.color = '#f4a261'; // Orange for moderate
        } else {
            row.cells[2].style.color = '#2a9d8f'; // Green for good
        }
    }
}

// Get test interpretation
function getTestInterpretation(test, score) {
    return testInterpretations[test][score] || "Completed successfully";
}

// Update patient video
function updatePatientVideo(patientName) {
    const videoPlayer = document.getElementById('video-paciente');
    videoPlayer.src = patientsData[patientName].video;
    videoPlayer.load();
}

// Main update function
function updatePatientData(patientName) {
    updatePatientTitles(patientName);
    createLineChart(patientName);
    createBarChart(patientName);
    fillResultsTable(patientName);
    updatePatientVideo(patientName);
}

// Event listeners for profile selection
document.getElementById('perfil-alexander').addEventListener('click', () => updatePatientData("Alexander"));
document.getElementById('perfil-sofia').addEventListener('click', () => updatePatientData("Sofia"));
document.getElementById('perfil-daniel').addEventListener('click', () => updatePatientData("Daniel"));

// Message system functionality
document.addEventListener('DOMContentLoaded', function () {
    const messageType = document.getElementById('tipo-mensaje');
    const exerciseOptions = document.getElementById('opciones-ejercicio');

    messageType.addEventListener('change', function () {
        exerciseOptions.style.display =
            (this.value === 'task' || this.value === 'reminder') ? 'block' : 'none';
    });

    const sendBtn = document.getElementById('btn-enviar');
    const confirmation = document.getElementById('confirmacion-envio');

    sendBtn.addEventListener('click', function () {
        // Show confirmation
        confirmation.style.display = 'block';
        setTimeout(() => {
            confirmation.style.display = 'none';
        }, 3000);

        // Clear form
        document.getElementById('texto-mensaje').value = '';
        document.querySelectorAll('input[name="ejercicio"]').forEach(el => {
            el.checked = false;
        });
    });

    // Initialize with first patient
    updatePatientData("Alexander");
});