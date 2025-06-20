const playBtn = document.getElementById('play-btn');
const exitBtn = document.getElementById('exit-btn');
const landingScreen = document.getElementById('landing-screen');
const gameScreen = document.getElementById('game-screen');
const colorButtons = document.querySelectorAll('.color-btn');
const scoreDisplay = document.getElementById('score');
const highScoreDisplay = document.getElementById('high-score');
const startBtn = document.getElementById('start-btn');


let sequence = [];
let userSequence = [];
let score = 0;
let highScore = 0;
let isPlayerTurn = false;

// Sounds 
const sounds = {
  red: new Audio('sounds/red.mp3'),
  green: new Audio('sounds/green.mp3'),
  blue: new Audio('sounds/blue.mp3'),
  yellow: new Audio('sounds/yellow.mp3'),
  wrong: new Audio('sounds/wrong.mp3'),
};
// start button
startBtn.addEventListener('click', () => {
  landingScreen.classList.add('d-none');
  gameScreen.classList.remove('d-none');
  startGame();
});


// Transition to game screen
playBtn.addEventListener('click', () => {
  landingScreen.classList.add('d-none');
  gameScreen.classList.remove('d-none');
  loadLeaderboard(); // Load leaderboard when entering game
  startGame();
});

// Exit to landing screen
exitBtn.addEventListener('click', () => {
  resetGame();
  gameScreen.classList.add('d-none');
  landingScreen.classList.remove('d-none');
});

// Start game
function startGame() {
  sequence = [];
  userSequence = [];
  score = 0;
  updateScore();
  nextRound();
}

// Add one color to the sequence
function nextRound() {
  userSequence = [];
  const colors = ['red', 'green', 'blue', 'yellow'];
  const nextColor = colors[Math.floor(Math.random() * colors.length)];
  sequence.push(nextColor);
  playSequence();
}

// Show full sequence
function playSequence() {
  isPlayerTurn = false;
  let delay = 0;

  sequence.forEach((color) => {
    setTimeout(() => playColor(color), delay);
    delay += 800;
  });

  setTimeout(() => {
    isPlayerTurn = true;
  }, delay);
}

// Play animation + sound
function playColor(color) {
  const button = document.getElementById(color);
  button.classList.add('active');
  sounds[color]?.play();
  setTimeout(() => button.classList.remove('active'), 300);
}

// Button click handler
colorButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    if (!isPlayerTurn) return;

    const selectedColor = btn.id;
    userSequence.push(selectedColor);
    playColor(selectedColor);

    if (!checkUserInput()) {
      gameOver();
    } else if (userSequence.length === sequence.length) {
      score++;
      updateScore();
      setTimeout(nextRound, 1000);
    }
  });
});

// Check user input
function checkUserInput() {
  const index = userSequence.length - 1;
  return userSequence[index] === sequence[index];
}

// Update score display
function updateScore() {
  scoreDisplay.textContent = score;
  if (score > highScore) {
    highScore = score;
    highScoreDisplay.textContent = highScore;
  }
}

// Game over
function gameOver() {
  isPlayerTurn = false;
  sounds.wrong?.play();
  alert('Game Over! Your score: ' + score);

  let playerName = prompt("Enter your name for the leaderboard:");
  if (playerName) {
    submitScore(playerName, score);
  }

  startGame();
}

// Submit score to backend
function submitScore(playerName, score) {
  console.log(`Submitting score: ${playerName}, ${score}`);
  fetch('http://localhost:3000/api/scores', {  // Use full path if frontend is on a different port
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ player_name: playerName, score: score })
  })
  .then(res => res.text())
  .then(msg => {
    console.log("✅ Score submitted:", msg);
    loadLeaderboard(); // Load after submit
  })
  .catch(err => console.error("❌ Error submitting score:", err));
}

// Get leaderboard from backend
function loadLeaderboard() {
  fetch('http://localhost:3000/api/scores')  // Make sure this URL is correct
    .then(res => res.json())
    .then(scores => {
      console.log(scores);  // Log the response to see what's coming from the backend
      const leaderboard = document.getElementById('leaderboard');
      leaderboard.innerHTML = '';  // Clear the existing leaderboard

      // Loop through only the first 5 scores (just in case the backend is giving more)
      scores.slice(0, 5).forEach((entry, index) => {
        const li = document.createElement('li');
        li.textContent = `${index + 1}. ${entry.player_name} - ${entry.score}`;
        leaderboard.appendChild(li);
      });
    })
    .catch(err => console.error("❌ Error loading leaderboard:", err));
}



// Reset game state
function resetGame() {
  sequence = [];
  userSequence = [];
  score = 0;
  updateScore();
}
