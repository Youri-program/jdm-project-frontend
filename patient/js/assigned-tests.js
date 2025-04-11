document.addEventListener("DOMContentLoaded", () => {

    console.log(localStorage.getItem("authToken"));
    // DOM Elements
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    const backButton = document.getElementById('back-to-dashboard');
    const assignedTestsList = document.getElementById('assigned-tests');
    const completedTestsList = document.getElementById('completed-tests');
    const assignedLoading = document.getElementById('assigned-loading');
    const completedLoading = document.getElementById('completed-loading');
    const assignedEmpty = document.getElementById('assigned-empty');
    const completedEmpty = document.getElementById('completed-empty');
    const testCardTemplate = document.getElementById('test-card-template');
  
    // API Base URL - Replace with your actual API base URL
    const API_BASE_URL = 'https://cmas-test-server-amauh3bjc4cug8gs.northeurope-01.azurewebsites.net/api';
  
    // Navigation
    backButton.addEventListener('click', () => {
      window.location.href = '../index.html';
    });
  
    // Tab switching
    tabButtons.forEach(button => {
      button.addEventListener('click', () => {
        // Toggle active state on tab buttons
        tabButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        
        // Toggle active state on tab content
        const tabName = button.getAttribute('data-tab');
        tabContents.forEach(content => content.classList.remove('active'));
        document.getElementById(`${tabName}-tab`).classList.add('active');
      });
    });
  
    // Fetch patient tests from API
    async function fetchPatientTests() {
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
        console.log(request);
        const response = await fetch(`${API_BASE_URL}/patient/tests`, request);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        return data;
      } catch (error) {
        console.error('Error fetching tests:', error);
        return [];
      }
    }
  
    // Format date to a more readable format
    function formatDate(dateString) {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  
    // Create a test card from template
    function createTestCard(test) {
      const template = testCardTemplate.content.cloneNode(true);
      const doctorName = `${test.doctorFirstName} ${test.doctorLastName}`;
      
      template.querySelector('.date-value').textContent = formatDate(test.assignedDate);
      template.querySelector('.doctor-value').textContent = doctorName;
      
      const button = template.querySelector('.btn-start');
      
      if (test.testStatus === 'COMPLETED') {
        button.textContent = 'View Results';
        button.classList.replace('btn-start', 'btn-view');
        button.addEventListener('click', () => {
          // Navigate to results view
          window.location.href = `test-results.html?testId=${test.testId}`;
        });
      } else {
        button.addEventListener('click', () => {
          // Navigate to test with test ID
          localStorage.setItem('currentTestId', test.testId);
          window.location.href = `cmas.html?testId=${test.testId}`;
        });
      }
      
      return template;
    }
  
    // Populate the tests lists
    async function loadTests() {
      try {
        const tests = await fetchPatientTests();
        
        const assignedTests = tests.filter(test => test.testStatus === 'ASSIGNED');
        const completedTests = tests.filter(test => test.testStatus === 'COMPLETED');
        
        // Handle assigned tests
        assignedLoading.classList.add('hidden');
        
        if (assignedTests.length === 0) {
          assignedEmpty.classList.remove('hidden');
        } else {
          assignedTestsList.innerHTML = '';
          assignedTests.forEach(test => {
            assignedTestsList.appendChild(createTestCard(test));
          });
        }
        
        // Handle completed tests
        completedLoading.classList.add('hidden');
        
        if (completedTests.length === 0) {
          completedEmpty.classList.remove('hidden');
        } else {
          completedTestsList.innerHTML = '';
          completedTests.forEach(test => {
            completedTestsList.appendChild(createTestCard(test));
          });
        }
      } catch (error) {
        console.error('Error loading tests:', error);
        assignedLoading.classList.add('hidden');
        completedLoading.classList.add('hidden');
        
        // Show error message
        assignedTestsList.innerHTML = '<p class="error-message">Failed to load tests. Please try again later.</p>';
        completedTestsList.innerHTML = '<p class="error-message">Failed to load tests. Please try again later.</p>';
      }
    }
  
    // Initialize the page
    loadTests();
  });