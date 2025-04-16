document.addEventListener("DOMContentLoaded", () => {
  // DOM Elements
  const backButton = document.getElementById('back-to-tests');
  const loadingElement = document.getElementById('loading');
  const resultsContent = document.getElementById('results-content');
  const completedCountElement = document.getElementById('completed-count');
  const testStatusElement = document.getElementById('test-status');
  const testStatusMessageElement = document.getElementById('test-status-message');
  const submissionInfoElement = document.getElementById('submission-info');
  const submitSectionElement = document.getElementById('submit-section');
  const resultsSection = document.getElementById('results-section');
  const answersList = document.getElementById('answers-list');
  const submitButton = document.getElementById('submit-btn');
  const submitMessage = document.getElementById('submit-message');
  const answerItemTemplate = document.getElementById('answer-item-template');

  // API Base URL
  const API_BASE_URL = 'https://cmas-test-server-amauh3bjc4cug8gs.northeurope-01.azurewebsites.net/api';

  // Get test ID from URL
  const urlParams = new URLSearchParams(window.location.search);
  const testId = urlParams.get('testId') || localStorage.getItem('currentTestId');

  if (!testId) {
    // Redirect back to assigned tests if no test ID
    window.location.href = 'assigned-tests.html';
    return;
  }

  // Navigation
  backButton.addEventListener('click', () => {
    window.location.href = 'assigned-tests.html';
  });

  // Load question IDs from API
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
      
      console.log(`Loading test data for test ID: ${testId}`);
      const response = await fetch(`${API_BASE_URL}/patient/tests/${testId}`, request);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      const questionIdMap = {};
      
      // Create a map from questionOrder to questionId
      data.questionOrderToNotesMap.forEach(item => {
        questionIdMap[item.questionOrder] = item.questionId;
      });
      
      console.log('Question ID map:', questionIdMap);
      return questionIdMap;
    } catch (error) {
      console.error('Error loading question IDs:', error);
      return {};
    }
  }

  // Get and clean user answers from localStorage
  function getUserAnswers() {
    const savedAnswersJson = localStorage.getItem(`test_${testId}_answers`);
    if (!savedAnswersJson) return [];
    
    const savedAnswers = JSON.parse(savedAnswersJson);
    
    // Filter out any answers with numeric IDs (old format)
    const cleanAnswers = savedAnswers.filter(answer => {
      return typeof answer.questionId === 'string' && 
             answer.questionId.includes('-'); // UUIDs have hyphens
    });
    
    // If we filtered out old answers, save the clean list back
    if (cleanAnswers.length !== savedAnswers.length) {
      localStorage.setItem(`test_${testId}_answers`, JSON.stringify(cleanAnswers));
      console.log('Cleaned up saved answers, removed numeric IDs');
    }
    
    return cleanAnswers;
  }

  // Check if a test is already submitted
  async function checkTestStatus() {
    try {
      const request = {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': localStorage.getItem('authToken')
        }
      };
      
      const response = await fetch(`${API_BASE_URL}/patient/tests`, request);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const tests = await response.json();
      const currentTest = tests.find(test => test.testId === testId);
      
      if (!currentTest) {
        return 'UNKNOWN';
      }
      
      return currentTest.testStatus; // Either "ASSIGNED" or "COMPLETED"
    } catch (error) {
      console.error('Error checking test status:', error);
      return 'UNKNOWN';
    }
  }

  // Submit test results to server
  submitButton.addEventListener('click', async () => {
    try {
      submitButton.disabled = true;
      submitButton.textContent = 'Submitting...';
      
      // Get the cleaned answers
      const userAnswers = getUserAnswers();
      
      // Only proceed if we have answers to submit
      if (userAnswers.length === 0) {
        throw new Error('No answers to submit');
      }
      
      const requestData = {
        testId: testId,
        answers: userAnswers
      };
      
      console.log('Submitting test data:', requestData);
      
      const response = await fetch(`${API_BASE_URL}/patient/upload`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Connection': 'keep-alive',
          'Authorization': localStorage.getItem('authToken')
        },
        body: JSON.stringify(requestData)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const responseData = await response.text();
      console.log('Submit response:', responseData);
      
      // Clear saved answers
      localStorage.removeItem(`test_${testId}_answers`);
      
      // Update UI to show submitted state
      updateUIForSubmittedTest();
      
      // Redirect after a short delay
      setTimeout(() => {
        window.location.href = 'assigned-tests.html';
      }, 2000);
      
    } catch (error) {
      console.error('Error submitting test:', error);
      submitButton.disabled = false;
      submitButton.textContent = 'Submit Test to Doctor';
      submitMessage.textContent = 'Failed to submit. Please try again.';
      submitMessage.style.color = '#f44336';
    }
  });

  // Update UI for a test that's already submitted
  function updateUIForSubmittedTest() {
    // Change status message and appearance
    testStatusMessageElement.textContent = "Your test has been submitted to your doctor for review.";
    testStatusElement.classList.remove('pending');
    testStatusElement.classList.add('completed');
    testStatusElement.querySelector('.status-icon').textContent = '✓';
    testStatusElement.querySelector('.status-text').textContent = 'Submitted';
    
    // Show submission info and hide results details
    submissionInfoElement.classList.remove('hidden');
    resultsSection.classList.add('hidden');
    submitSectionElement.classList.add('hidden');
  }

  // Load questions and user answers
  async function loadTestResults() {
    try {
      // Show loading
      loadingElement.classList.remove('hidden');
      resultsContent.classList.add('hidden');
      
      // Check if test is already submitted
      const testStatus = await checkTestStatus();
      const isCompleted = testStatus === 'COMPLETED';
      
      // Get questions, question IDs, and user answers
      const [questions, questionIdMap] = await Promise.all([
        fetch("../data/cmas.json").then(res => res.json()),
        loadTestData()
      ]);
      
      // Get user answers
      const userAnswers = getUserAnswers();
      console.log('User answers:', userAnswers);
      
      // Hide submission info by default
      submissionInfoElement.classList.add('hidden');
      
      // For submitted tests, show different UI
      if (isCompleted) {
        updateUIForSubmittedTest();
        
        // Set completed count to max
        const expectedQuestionCount = Object.keys(questionIdMap).length;
        completedCountElement.textContent = `${expectedQuestionCount}/${expectedQuestionCount}`;
        
        // Hide loading, show results
        loadingElement.classList.add('hidden');
        resultsContent.classList.remove('hidden');
        return;
      }
      
      // Get the actual total number of questions from the API data
      const expectedQuestionCount = Object.keys(questionIdMap).length;
      console.log(`Expected question count from API: ${expectedQuestionCount}`);
      
      const completedCount = userAnswers.length;
      completedCountElement.textContent = `${completedCount}/${expectedQuestionCount}`;
      
      // Check if all questions are answered - based on actual API data
      const allQuestionsAnswered = completedCount >= expectedQuestionCount;
      submitButton.disabled = !allQuestionsAnswered;
      
      if (allQuestionsAnswered) {
        submitMessage.textContent = 'All questions answered. Ready to submit to your doctor.';
        submitMessage.style.color = '#4caf50';
      } else {
        submitMessage.textContent = `Please complete all questions before submitting (${completedCount}/${expectedQuestionCount} completed).`;
        submitMessage.style.color = '#f44336';
      }
      
      // Clear answers list
      answersList.innerHTML = '';
      
      // Create answer items for each question in the local data
      questions.forEach((question, index) => {
        // Skip if this question's index is beyond the expected count
        if (question.id > expectedQuestionCount) {
          return;
        }
        
        const template = answerItemTemplate.content.cloneNode(true);
        
        // Set question info
        template.querySelector('.question-number').textContent = question.id;
        template.querySelector('.question-title').textContent = question.title;
        
        // Get question ID from map (question order is index)
        const questionOrder = question.id - 1; // Convert to 0-based index
        const questionId = questionIdMap[questionOrder];
        
        if (!questionId) {
          console.warn(`No question ID found for question order ${questionOrder}`);
          return;
        }
        
        // Get answer for this question
        const answer = userAnswers.find(a => a.questionId === questionId);
        const answerValue = template.querySelector('.answer-value');
        
        if (answer !== undefined && question.options[answer.score] !== undefined) {
          // Question is answered
          answerValue.textContent = question.options[answer.score];
        } else {
          // Question is unanswered
          answerValue.textContent = 'Not answered';
          answerValue.classList.add('answer-missing');
        }
        
        answersList.appendChild(template);
      });
      
      // Hide loading, show results
      loadingElement.classList.add('hidden');
      resultsContent.classList.remove('hidden');
      
    } catch (error) {
      console.error('Error loading test results:', error);
      loadingElement.classList.add('hidden');
      alert('Failed to load test results. Please try again later.');
    }
  }

  // Initialize
  loadTestResults();
});