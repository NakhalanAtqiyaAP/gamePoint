import { db } from "../config/firebaseConfig.js";
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/9.18.0/firebase-firestore.js";
import { query, getDocs, orderBy, limit } from "https://www.gstatic.com/firebasejs/9.18.0/firebase-firestore.js";

const startGameButton = document.getElementById('start-game');
const usernameInput = document.getElementById('username');

let canvas = document.getElementById('gameCanvas');
let ctx = canvas.getContext('2d');

let player = { x: 50, y: 300, width: 20, height: 20, speed: 5, dx: 0, dy: 0 };
let obstacles = [];
let score = 0;
let username = '';
let gameInterval;

document.addEventListener('keydown', (e) => {
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
    e.preventDefault();
  }
});

startGameButton.addEventListener('click', async () => {
  username = usernameInput.value.trim();

  if (!username) {
    alert("Username harus diisi untuk memulai!");
    return;
  }

  try {
    await addDoc(collection(db, "users"), {
      name: username,
      score: 0
    });

    document.getElementById('username-form').style.display = "none";
    startGame();
  } catch (e) {
    console.error("Error adding document: ", e);
  }
});

function startGame() {
  document.addEventListener('keydown', movePlayer);
  document.addEventListener('keyup', stopPlayer);
  showControlsOnMobile();
  gameInterval = setInterval(updateGame, 30);
}

function movePlayer(e) {
  if (e.key === 'ArrowUp') player.dy = -player.speed;
  if (e.key === 'ArrowDown') player.dy = player.speed;
  if (e.key === 'ArrowLeft') player.dx = -player.speed;
  if (e.key === 'ArrowRight') player.dx = player.speed;
}

function stopPlayer(e) {
  if (e.key === 'ArrowUp' || e.key === 'ArrowDown') player.dy = 0;
  if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') player.dx = 0;
}

function generateObstacle() {
  let baseSpeed = 5 + Math.min(score / 200, 5);
  let obstacleGap = 200 - Math.min(score / 10, 100);

  if (Math.random() < 0.02 + score / 2000) {
    let obstacle = { 
      x: canvas.width, 
      y: Math.random() * (canvas.height - 20), 
      width: 50 + Math.random() * 30, 
      height: 50 + Math.random() * 50, 
      speed: baseSpeed
    };
    obstacles.push(obstacle);
  }
}

function updateGame() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  generateObstacle();

  obstacles.forEach((obstacle, index) => {
    obstacle.x -= obstacle.speed;
    if (obstacle.x < 0) {
      obstacles.splice(index, 1);
      score += 10;
    }

    ctx.fillStyle = 'red';
    ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
  });

  player.x += player.dx;
  player.y += player.dy;

  if (player.x < 0) player.x = 0;
  if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;
  if (player.y < 0) player.y = 0;
  if (player.y + player.height > canvas.height) player.y = canvas.height - player.height;

  ctx.fillStyle = 'green';
  ctx.fillRect(player.x, player.y, player.width, player.height);

  obstacles.forEach(obstacle => {
    if (player.x < obstacle.x + obstacle.width &&
        player.x + player.width > obstacle.x &&
        player.y < obstacle.y + obstacle.height &&
        player.y + player.height > obstacle.y) {
      gameOver();
    }
  });

  ctx.fillStyle = 'black';
  ctx.font = '20px Arial';
  ctx.fillText('Score: ' + score, 10, 30);
}

function gameOver() {
  clearInterval(gameInterval);

  Swal.fire({
    title: "Game Over!",
    text: `Skor Anda: ${score}`,
    confirmButtonText: "Restart Game",
    confirmButtonColor: "#ff8800",
    allowOutsideClick: false
  }).then(() => {
    window.location.reload();
  });

  saveScore();
}

async function saveScore() {
  try {
    await addDoc(collection(db, "leaderboard"), {
      name: username,
      score: score
    });

    loadLeaderboard();
  } catch (e) {
    console.error("Error saving score: ", e);
  }
}

async function loadLeaderboard() {
  try {
    const q = query(collection(db, "leaderboard"), orderBy("score", "desc"), limit(3));
    const querySnapshot = await getDocs(q);

    let leaderboardList = document.getElementById('leaderboard-list');
    leaderboardList.innerHTML = '';

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const li = document.createElement('li');
      li.textContent = `${data.name}: ${data.score} points`;
      leaderboardList.appendChild(li);
    });
  } catch (e) {
    console.error("Error loading leaderboard: ", e);
  }
}

loadLeaderboard();

let controlButtons = document.getElementById('control-buttons');

function showControlsOnMobile() {
  if (window.innerWidth <= 768) {
    controlButtons.style.display = 'block';
  } else {
    controlButtons.style.display = 'none';
  }
}

document.getElementById('btn-up').addEventListener('touchstart', () => player.dy = -player.speed);
document.getElementById('btn-down').addEventListener('touchstart', () => player.dy = player.speed);
document.getElementById('btn-left').addEventListener('touchstart', () => player.dx = -player.speed);
document.getElementById('btn-right').addEventListener('touchstart', () => player.dx = player.speed);

document.getElementById('btn-up').addEventListener('touchend', () => player.dy = 0);
document.getElementById('btn-down').addEventListener('touchend', () => player.dy = 0);
document.getElementById('btn-left').addEventListener('touchend', () => player.dx = 0);
document.getElementById('btn-right').addEventListener('touchend', () => player.dx = 0);

window.addEventListener('load', showControlsOnMobile);
window.addEventListener('resize', showControlsOnMobile);
