let questions = [];
let currentQuestion = 0;

document.addEventListener("DOMContentLoaded", () => {
  const introScreen = document.getElementById("intro-screen");
  const questionScreen = document.getElementById("question-screen");
  const startBtn = document.getElementById("start-test-btn");
  const prevBtn = document.getElementById("prev-btn");
  const nextBtn = document.getElementById("next-btn");

  startBtn.addEventListener("click", () => {
    introScreen.classList.add("hidden");
    questionScreen.classList.remove("hidden");
  });

  prevBtn.addEventListener("click", () => {
    if (currentQuestion > 0) {
      loadQuestion(currentQuestion - 1);
    }
  });

  nextBtn.addEventListener("click", () => {
    if (currentQuestion < questions.length - 1) {
      loadQuestion(currentQuestion + 1);
    }
  });

  fetch("../data/cmas.json")
    .then(res => res.json())
    .then(data => {
      questions = data;
      loadQuestion(0);
    });

  function loadQuestion(index) {
    currentQuestion = index;
    const q = questions[index];
    document.getElementById("question-title").textContent = `CMAS Test: Question ${q.id}`;
    document.getElementById("question-text").textContent = q.title;
    document.getElementById("question-description").textContent = q.description;

    const answerContainer = document.getElementById("answer-options");
    answerContainer.innerHTML = "";
    q.options.forEach((opt) => {
      const label = document.createElement("label");
      const input = document.createElement("input");
      input.type = "radio";
      input.name = `q${q.id}`;
      input.value = opt;
      label.appendChild(input);
      label.appendChild(document.createTextNode(opt));
      answerContainer.appendChild(label);
    });

    prevBtn.disabled = currentQuestion === 0;
    nextBtn.disabled = currentQuestion === questions.length - 1;
    updateProgress();
  }

  function updateProgress() {
    const progress = ((currentQuestion + 1) / questions.length) * 100;
    document.getElementById("progress").style.width = `${progress}%`;
  }
});
