let questions = [];
let currentQuestion = 0;
let currentTestId = '';
let doctorNotes = [];
let questionIdMap = {};
let userAnswers = [];

document.addEventListener("DOMContentLoaded", () => {
  const introScreen = document.getElementById("intro-screen");
  const questionScreen = document.getElementById("question-screen");
  const startBtn = document.getElementById("start-test-btn");
  const prevBtn = document.getElementById("prev-btn");
  const nextBtn = document.getElementById("next-btn");
  const finishBtn = document.getElementById("finish-btn");
  const doctorNotesElement = document.getElementById("doctor-notes");

  // API Base URL
  const API_BASE_URL = 'https://cmas-test-server-amauh3bjc4cug8gs.northeurope-01.azurewebsites.net/api';

  // Get test ID from URL or localStorage
  const urlParams = new URLSearchParams(window.location.search);
  currentTestId = urlParams.get('testId') || localStorage.getItem('currentTestId');

  if (!currentTestId) {
    // Redirect back to assigned tests if no test ID
    window.location.href = 'assigned-tests.html';
    return;
  }

  // Improved screen transitions
  startBtn.addEventListener("click", async () => {
    // Show loading state
    startBtn.disabled = true;
    startBtn.textContent = "Loading test...";
    
    try {
      // Initialize the test data
      await initializeTest();
      
      // Switch screens with a smooth transition
      introScreen.style.opacity = '0';
      setTimeout(() => {
        introScreen.classList.add("hidden");
        questionScreen.classList.remove("hidden");
        // Fade in the question screen
        setTimeout(() => {
          questionScreen.style.opacity = '1';
        }, 50);
      }, 300);
    } catch (error) {
      console.error("Failed to initialize test:", error);
      startBtn.disabled = false;
      startBtn.textContent = "Start Test";
      alert("There was a problem loading the test. Please try again.");
    }
  });

  prevBtn.addEventListener("click", () => {
    saveCurrentAnswer();
    if (currentQuestion > 0) {
      loadQuestion(currentQuestion - 1);
    }
  });

  nextBtn.addEventListener("click", () => {
    saveCurrentAnswer();
    if (currentQuestion < questions.length - 1) {
      loadQuestion(currentQuestion + 1);
    }
  });

  finishBtn.addEventListener("click", () => {
    saveCurrentAnswer();
    // Navigate to test results page
    window.location.href = `test-results.html?testId=${currentTestId}`;
  });

  // Save current answer
  function saveCurrentAnswer() {
    const q = questions[currentQuestion];
    const selectedOption = document.querySelector(`input[name=q${q.id}]:checked`);
    
    if (selectedOption) {
      // Find the questionId for this question order
      const questionOrder = q.id - 1; // Convert from 1-based to 0-based
      const questionId = questionIdMap[questionOrder];
      
      if (!questionId) {
        console.error(`No questionId found for question order ${questionOrder}`);
        return;
      }
      
      const answerIndex = userAnswers.findIndex(a => a.questionId === questionId);
      const score = q.options.indexOf(selectedOption.value);
      
      if (answerIndex !== -1) {
        userAnswers[answerIndex].score = score;
      } else {
        userAnswers.push({
          questionId: questionId,
          score: score
        });
      }
      
      // Save to localStorage for persistence
      localStorage.setItem(`test_${currentTestId}_answers`, JSON.stringify(userAnswers));
      console.log('Saved answer:', { questionId, score });
    }
  }

  // Load test data from API
  async function loadTestData() {
    try {
      const request = {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Connection': 'keep-alive',
          'Authorization': localStorage.getItem('authToken')
        },
      };
      
      console.log(`Loading test data for test ID: ${currentTestId}`);
      const response = await fetch(`${API_BASE_URL}/patient/tests/${currentTestId}`, request);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Test data loaded:', data);
      
      // Store doctor notes in the new format
      doctorNotes = data.questionOrderToNotesMap || [];
      
      // Create a map from questionOrder to questionId and notes
      doctorNotes.forEach(item => {
        questionIdMap[item.questionOrder] = item.questionId;
      });
      
      console.log('Question ID map:', questionIdMap);
      
      return data;
    } catch (error) {
      console.error('Error loading test:', error);
      alert('Failed to load test data. Please try again later.');
      window.location.href = 'assigned-tests.html';
    }
  }

  // Load saved answers if any
  function loadSavedAnswers() {
    const savedAnswersJson = localStorage.getItem(`test_${currentTestId}_answers`);
    if (savedAnswersJson) {
      const savedAnswers = JSON.parse(savedAnswersJson);
      
      // Filter out any answers with numeric IDs (old format)
      userAnswers = savedAnswers.filter(answer => {
        return typeof answer.questionId === 'string' && 
               answer.questionId.includes('-'); // UUIDs have hyphens
      });
      
      console.log('Loaded saved answers:', userAnswers);
      
      // If we filtered out old answers, save the clean list back
      if (userAnswers.length !== savedAnswers.length) {
        localStorage.setItem(`test_${currentTestId}_answers`, JSON.stringify(userAnswers));
        console.log('Cleaned up saved answers, removed numeric IDs');
      }
    }
  }

  // Load question data
  async function initializeTest() {
    try {
      await loadTestData();
      
      // Fetch questions from JSON file
      const response = await fetch("../data/cmas.json");
      questions = await response.json();
      
      // Load saved answers AFTER loading question IDs
      loadSavedAnswers();
      
      loadQuestion(0);
      return true;
    } catch (error) {
      console.error('Error initializing test:', error);
      alert('Failed to initialize test. Please try again later.');
      return false;
    }
  }

  function loadQuestion(index) {
    currentQuestion = index;
    const q = questions[index];
    document.getElementById("question-title").textContent = `CMAS Test: Question ${q.id}`;
    document.getElementById("question-text").textContent = q.title;
    document.getElementById("question-description").textContent = q.description;

    // Load doctor notes for this question if available
    const questionOrder = q.id - 1; // Convert to 0-based index
    const noteObj = doctorNotes.find(n => n.questionOrder === questionOrder);
    const note = noteObj && noteObj.note ? noteObj.note : 'No notes for this question.';
    doctorNotesElement.textContent = note;

    const answerContainer = document.getElementById("answer-options");
    answerContainer.innerHTML = "";
    q.options.forEach((opt, optIndex) => {
      const label = document.createElement("label");
      const input = document.createElement("input");
      input.type = "radio";
      input.name = `q${q.id}`;
      input.value = opt;
      
      // Check if we have a saved answer for this question
      const questionId = questionIdMap[questionOrder];
      const savedAnswer = userAnswers.find(a => a.questionId === questionId);
      if (savedAnswer && savedAnswer.score === optIndex) {
        input.checked = true;
      }
      
      label.appendChild(input);
      label.appendChild(document.createTextNode(opt));
      answerContainer.appendChild(label);
    });

    // Update navigation buttons
    prevBtn.disabled = currentQuestion === 0;
    
    // If last question, show Finish button instead of Next
    if (currentQuestion === questions.length - 1) {
      nextBtn.classList.add('hidden');
      finishBtn.classList.remove('hidden');
    } else {
      nextBtn.classList.remove('hidden');
      finishBtn.classList.add('hidden');
    }
    
    updateProgress();
  }

  function updateProgress() {
    const progress = ((currentQuestion + 1) / questions.length) * 100;
    document.getElementById("progress").style.width = `${progress}%`;
  }

  // Add fade transitions
  introScreen.style.transition = 'opacity 0.3s ease';
  questionScreen.style.transition = 'opacity 0.3s ease';
  questionScreen.style.opacity = '0';
});