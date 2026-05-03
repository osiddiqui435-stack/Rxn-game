// script.js

// ==================== STATE ====================
let gameState = {
    mode: null,
    phase: 'idle',
    startTime: 0,
    reactionTime: 0,
    playerName: '',
    friendPlayerName: '',
    friendGuesserName: '',
    friendGuess: null,
    timeoutId: null,
    normalLeaderboard: [],
    friendLeaderboard: []
};

// ==================== AUDIO ====================
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

function playClickSound() {
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.08);
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.25, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.08);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.08);
}

function playSuccessSound() {
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }
    
    const frequencies = [523.25, 659.25, 783.99, 1046.50];
    
    frequencies.forEach((freq, i) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(freq, audioContext.currentTime + i * 0.12);
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime + i * 0.12);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + i * 0.12 + 0.25);
        
        oscillator.start(audioContext.currentTime + i * 0.12);
        oscillator.stop(audioContext.currentTime + i * 0.12 + 0.25);
    });
}

function playErrorSound() {
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(80, audioContext.currentTime + 0.25);
    oscillator.type = 'sawtooth';
    
    gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.25);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.25);
}

// ==================== PARTICLES ====================
const particlesCanvas = document.getElementById('particles');
const pCtx = particlesCanvas.getContext('2d');
let particles = [];
let mouseX = 0;
let mouseY = 0;

function initParticles() {
    particlesCanvas.width = window.innerWidth;
    particlesCanvas.height = window.innerHeight;
    
    particles = [];
    const count = Math.min(70, Math.floor(window.innerWidth / 15));
    
    for (let i = 0; i < count; i++) {
        particles.push({
            x: Math.random() * particlesCanvas.width,
            y: Math.random() * particlesCanvas.height,
            radius: Math.random() * 2.5 + 0.5,
            vx: (Math.random() - 0.5) * 0.4,
            vy: (Math.random() - 0.5) * 0.4,
            alpha: Math.random() * 0.6 + 0.2,
            color: ['#00e5ff', '#4169ff', '#b026ff', '#00ff88'][Math.floor(Math.random() * 4)]
        });
    }
}

function animateParticles() {
    pCtx.clearRect(0, 0, particlesCanvas.width, particlesCanvas.height);
    
    particles.forEach((p, index) => {
        // Mouse interaction
        const dx = mouseX - p.x;
        const dy = mouseY - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < 150) {
            const force = (150 - dist) / 150;
            p.vx -= (dx / dist) * force * 0.02;
            p.vy -= (dy / dist) * force * 0.02;
        }
        
        p.x += p.vx;
        p.y += p.vy;
        
        // Damping
        p.vx *= 0.99;
        p.vy *= 0.99;
        
        // Wrap around
        if (p.x < -10) p.x = particlesCanvas.width + 10;
        if (p.x > particlesCanvas.width + 10) p.x = -10;
        if (p.y < -10) p.y = particlesCanvas.height + 10;
        if (p.y > particlesCanvas.height + 10) p.y = -10;
        
        // Draw particle
        pCtx.beginPath();
        pCtx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        pCtx.fillStyle = p.color;
        pCtx.globalAlpha = p.alpha;
        pCtx.fill();
        
        // Glow
        const gradient = pCtx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius * 4);
        gradient.addColorStop(0, p.color);
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        pCtx.beginPath();
        pCtx.arc(p.x, p.y, p.radius * 4, 0, Math.PI * 2);
        pCtx.fillStyle = gradient;
        pCtx.globalAlpha = p.alpha * 0.25;
        pCtx.fill();
        
        // Connect nearby particles
        for (let j = index + 1; j < particles.length; j++) {
            const p2 = particles[j];
            const distance = Math.sqrt((p.x - p2.x) ** 2 + (p.y - p2.y) ** 2);
            
            if (distance < 100) {
                pCtx.beginPath();
                pCtx.moveTo(p.x, p.y);
                pCtx.lineTo(p2.x, p2.y);
                pCtx.strokeStyle = p.color;
                pCtx.globalAlpha = (1 - distance / 100) * 0.15;
                pCtx.lineWidth = 0.5;
                pCtx.stroke();
            }
        }
    });
    
    pCtx.globalAlpha = 1;
    requestAnimationFrame(animateParticles);
}

document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
});

// ==================== CONFETTI ====================
const confettiCanvas = document.getElementById('confetti-canvas');
const cCtx = confettiCanvas.getContext('2d');
let confetti = [];
let confettiActive = false;

function initConfetti() {
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
}

function launchConfetti() {
    confetti = [];
    confettiActive = true;
    
    const colors = ['#00e5ff', '#b026ff', '#ffd700', '#00ff88', '#ff2255', '#ffffff'];
    
    for (let i = 0; i < 200; i++) {
        confetti.push({
            x: confettiCanvas.width / 2,
            y: confettiCanvas.height / 2,
            vx: (Math.random() - 0.5) * 25,
            vy: (Math.random() - 0.5) * 25 - 15,
            color: colors[Math.floor(Math.random() * colors.length)],
            size: Math.random() * 12 + 4,
            rotation: Math.random() * 360,
            rotationSpeed: (Math.random() - 0.5) * 15,
            gravity: 0.35,
            shape: Math.random() > 0.5 ? 'rect' : 'circle'
        });
    }
    
    animateConfetti();
}

function animateConfetti() {
    if (!confettiActive) return;
    
    cCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    
    let active = false;
    
    confetti.forEach(c => {
        c.x += c.vx;
        c.y += c.vy;
        c.vy += c.gravity;
        c.vx *= 0.98;
        c.rotation += c.rotationSpeed;
        
        if (c.y < confettiCanvas.height + 50) {
            active = true;
            
            cCtx.save();
            cCtx.translate(c.x, c.y);
            cCtx.rotate(c.rotation * Math.PI / 180);
            cCtx.fillStyle = c.color;
            cCtx.globalAlpha = 0.9;
            
            if (c.shape === 'rect') {
                cCtx.fillRect(-c.size / 2, -c.size / 4, c.size, c.size / 2);
            } else {
                cCtx.beginPath();
                cCtx.arc(0, 0, c.size / 3, 0, Math.PI * 2);
                cCtx.fill();
            }
            
            cCtx.restore();
        }
    });
    
    if (active) {
        requestAnimationFrame(animateConfetti);
    } else {
        confettiActive = false;
        cCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    }
}

// ==================== LEADERBOARDS ====================
function loadLeaderboards() {
    const normalSaved = localStorage.getItem('reactionNormalLeaderboard');
    const friendSaved = localStorage.getItem('reactionFriendLeaderboard');
    
    gameState.normalLeaderboard = normalSaved ? JSON.parse(normalSaved) : [];
    gameState.friendLeaderboard = friendSaved ? JSON.parse(friendSaved) : [];
    
    renderNormalLeaderboard();
    renderFriendLeaderboard();
}

function saveNormalScore(name, time) {
    gameState.normalLeaderboard.push({ name, time });
    gameState.normalLeaderboard.sort((a, b) => a.time - b.time);
    gameState.normalLeaderboard = gameState.normalLeaderboard.slice(0, 10);
    localStorage.setItem('reactionNormalLeaderboard', JSON.stringify(gameState.normalLeaderboard));
    renderNormalLeaderboard();
}

function saveFriendWin(playerName, friendName, guess, actualTime) {
    gameState.friendLeaderboard.push({ 
        playerName, 
        friendName, 
        guess, 
        time: actualTime,
        date: new Date().toLocaleDateString()
    });
    gameState.friendLeaderboard.sort((a, b) => a.time - b.time);
    gameState.friendLeaderboard = gameState.friendLeaderboard.slice(0, 10);
    localStorage.setItem('reactionFriendLeaderboard', JSON.stringify(gameState.friendLeaderboard));
    renderFriendLeaderboard();
}

function renderNormalLeaderboard() {
    const container = document.getElementById('normal-leaderboard');
    
    if (gameState.normalLeaderboard.length === 0) {
        container.innerHTML = '<div class="leaderboard-empty">No scores yet. Be the first!</div>';
        return;
    }
    
    let html = '';
    
    gameState.normalLeaderboard.forEach((entry, i) => {
        const rank = i + 1;
        
        if (i === 5) {
            html += '<div class="leaderboard-divider"></div>';
        }
        
        html += `
            <div class="leaderboard-entry" data-rank="${rank}">
                <span class="rank">#${rank}</span>
                <span class="name">${escapeHtml(entry.name)}</span>
                <span class="time">${entry.time.toFixed(3)}s</span>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

function renderFriendLeaderboard() {
    const container = document.getElementById('friend-leaderboard');
    
    if (gameState.friendLeaderboard.length === 0) {
        container.innerHTML = '<div class="leaderboard-empty">No winners yet. Challenge a friend!</div>';
        return;
    }
    
    let html = '';
    
    gameState.friendLeaderboard.forEach((entry, i) => {
        const rank = i + 1;
        
        html += `
            <div class="leaderboard-entry" data-rank="${rank}">
                <span class="rank">#${rank}</span>
                <span class="name">${escapeHtml(entry.playerName)} & ${escapeHtml(entry.friendName)}</span>
                <span class="time">${entry.guess}</span>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ==================== SCREENS ====================
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    setTimeout(() => {
        document.getElementById(screenId).classList.add('active');
    }, 50);
}

function goHome() {
    resetGame();
    showScreen('home-screen');
}

// ==================== GAME FLOWS ====================
function startNormalFlow() {
    playClickSound();
    gameState.mode = 'normal';
    showScreen('name-input-screen');
    document.getElementById('player-name-input').value = '';
    document.getElementById('player-name-input').focus();
}

function confirmPlayerName() {
    const input = document.getElementById('player-name-input');
    const name = input.value.trim();
    
    if (name.length < 1) {
        input.style.borderColor = '#ff2255';
        playErrorSound();
        setTimeout(() => {
            input.style.borderColor = 'var(--border)';
        }, 500);
        return;
    }
    
    playClickSound();
    gameState.playerName = name;
    showScreen('normal-mode');
    resetGame();
    
    document.getElementById('player-badge').textContent = `Player: ${name}`;
    document.querySelector('#normal-mode .mode-title').textContent = 'NORMAL REACTION TEST';
    document.querySelector('#normal-mode .instruction').textContent = 
        'Click START, then click when the screen turns GREEN';
}

function startFriendFlow() {
    playClickSound();
    gameState.mode = 'friend';
    showScreen('friend-input-screen');
    
    document.getElementById('friend-player-name').value = '';
    document.getElementById('friend-guesser-name').value = '';
    document.getElementById('friend-guess-input').value = '';
}

function confirmFriendSetup() {
    const playerName = document.getElementById('friend-player-name').value.trim();
    const friendName = document.getElementById('friend-guesser-name').value.trim();
    const guessValue = document.getElementById('friend-guess-input').value.replace(/\D/g, '');
    
    if (playerName.length < 1 || friendName.length < 1) {
        playErrorSound();
        return;
    }
    
    if (guessValue.length !== 2) {
        document.getElementById('friend-guess-input').style.borderColor = '#ff2255';
        playErrorSound();
        setTimeout(() => {
            document.getElementById('friend-guess-input').style.borderColor = 'var(--purple)';
        }, 500);
        return;
    }
    
    playClickSound();
    gameState.friendPlayerName = playerName;
    gameState.friendGuesserName = friendName;
    gameState.friendGuess = parseInt(guessValue);
    
    showScreen('friend-mode-game');
    resetFriendGame();
    
    document.getElementById('players-display').innerHTML = `
        <div class="player-tag player">
            <span class="label">Player</span>
            ${escapeHtml(playerName)}
        </div>
        <div class="player-tag friend">
            <span class="label">Friend</span>
            ${escapeHtml(friendName)}
        </div>
    `;
    
    document.getElementById('guess-display').innerHTML = `
        <div class="label">Friend's Guess</div>
        <div class="value">0.${guessValue}s</div>
    `;
}

function startGame() {
    playClickSound();
    gameState.phase = 'waiting';
    
    const panel = document.getElementById('game-panel');
    const content = document.getElementById('game-content');
    
    panel.className = 'game-panel waiting';
    content.innerHTML = `
        <div class="player-badge">${escapeHtml(gameState.playerName)}</div>
        <div class="wait-text">Wait for GREEN...</div>
    `;
    
    const delay = 1000 + Math.random() * 3000;
    
    gameState.timeoutId = setTimeout(() => {
        if (gameState.phase === 'waiting') {
            gameState.phase = 'ready';
            gameState.startTime = performance.now();
            
            panel.className = 'game-panel ready';
            content.innerHTML = `
                <div class="player-badge">${escapeHtml(gameState.playerName)}</div>
                <div class="click-text">CLICK NOW!</div>
            `;
        }
    }, delay);
}

function startFriendGame() {
    playClickSound();
    gameState.phase = 'waiting';
    
    const panel = document.getElementById('friend-game-panel');
    const content = document.getElementById('friend-game-content');
    
    panel.className = 'game-panel waiting';
    content.innerHTML = `
        <div class="players-display">
            <div class="player-tag player">
                <span class="label">Player</span>
                ${escapeHtml(gameState.friendPlayerName)}
            </div>
            <div class="player-tag friend">
                <span class="label">Friend</span>
                ${escapeHtml(gameState.friendGuesserName)}
            </div>
        </div>
        <div class="wait-text">Wait for GREEN...</div>
    `;
    
    const delay = 1000 + Math.random() * 3000;
    
    gameState.timeoutId = setTimeout(() => {
        if (gameState.phase === 'waiting') {
            gameState.phase = 'ready';
            gameState.startTime = performance.now();
            
            panel.className = 'game-panel ready';
            content.innerHTML = `
                <div class="players-display">
                    <div class="player-tag player">
                        <span class="label">Player</span>
                        ${escapeHtml(gameState.friendPlayerName)}
                    </div>
                    <div class="player-tag friend">
                        <span class="label">Friend</span>
                        ${escapeHtml(gameState.friendGuesserName)}
                    </div>
                </div>
                <div class="click-text">CLICK NOW!</div>
            `;
        }
    }, delay);
}

function handleClick(panelId) {
    const panel = document.getElementById(panelId);
    
    if (gameState.phase === 'waiting') {
        clearTimeout(gameState.timeoutId);
        gameState.phase = 'idle';
        
        playErrorSound();
        
        panel.className = 'game-panel early';
        
        const isFriendMode = panelId === 'friend-game-panel';
        const contentId = isFriendMode ? 'friend-game-content' : 'game-content';
        const content = document.getElementById(contentId);
        
        content.innerHTML = `
            <div class="early-text">TOO EARLY!</div>
            <button class="neon-btn primary" style="margin-top: 30px;" onclick="resetAndStart('${panelId}')">
                TRY AGAIN
            </button>
        `;
        
        setTimeout(() => {
            panel.classList.remove('early');
        }, 500);
        
    } else if (gameState.phase === 'ready') {
        gameState.reactionTime = (performance.now() - gameState.startTime) / 1000;
        gameState.phase = 'result';
        
        playClickSound();
        
        if (gameState.mode === 'normal') {
            showNormalResult();
        } else {
            showFriendResult();
        }
    }
}

function resetAndStart(panelId) {
    playClickSound();
    
    if (panelId === 'game-panel') {
        resetGame();
        startGame();
    } else {
        resetFriendGame();
        startFriendGame();
    }
}

function resetGame() {
    gameState.phase = 'idle';
    if (gameState.timeoutId) {
        clearTimeout(gameState.timeoutId);
        gameState.timeoutId = null;
    }
    
    const panel = document.getElementById('game-panel');
    if (panel) {
        panel.className = 'game-panel';
    }
    
    const content = document.getElementById('game-content');
    if (content) {
        content.innerHTML = `
            <div class="player-badge" id="player-badge">${escapeHtml(gameState.playerName)}</div>
            <h2 class="mode-title">NORMAL REACTION TEST</h2>
            <p class="instruction">Click START, then click when the screen turns GREEN</p>
            <button id="start-btn" class="neon-btn primary large" onclick="startGame()">
                <span>START</span>
            </button>
        `;
    }
}

function resetFriendGame() {
    gameState.phase = 'idle';
    if (gameState.timeoutId) {
        clearTimeout(gameState.timeoutId);
        gameState.timeoutId = null;
    }
    
    const panel = document.getElementById('friend-game-panel');
    if (panel) {
        panel.className = 'game-panel';
    }
    
    const content = document.getElementById('friend-game-content');
    if (content) {
        content.innerHTML = `
            <div class="players-display" id="players-display">
                <div class="player-tag player">
                    <span class="label">Player</span>
                    ${escapeHtml(gameState.friendPlayerName)}
                </div>
                <div class="player-tag friend">
                    <span class="label">Friend</span>
                    ${escapeHtml(gameState.friendGuesserName)}
                </div>
            </div>
            <div class="guess-display" id="guess-display">
                <div class="label">Friend's Guess</div>
                <div class="value">0.${gameState.friendGuess.toString().padStart(2, '0')}s</div>
            </div>
            <button class="neon-btn secondary large" onclick="startFriendGame()">
                <span>START</span>
            </button>
        `;
    }
}

// ==================== RESULTS ====================
function showNormalResult() {
    const time = gameState.reactionTime;
    const rating = getRating(time);
    
    saveNormalScore(gameState.playerName, time);
    
    if (rating.class === 'lightning') {
        playSuccessSound();
        launchConfetti();
    }
    
    showScreen('result-screen');
    
    const rank = gameState.normalLeaderboard.findIndex(e => e.time === time && e.name === gameState.playerName) + 1;
    const isTopFive = rank <= 5 && rank > 0;
    
    document.getElementById('result-content').innerHTML = `
        <h2 class="mode-title">YOUR RESULT</h2>
        <div class="result-time">${time.toFixed(3)}s</div>
        <div class="result-rating ${rating.class}">${rating.text}</div>
        ${isTopFive ? `<div style="color: var(--gold); margin: 10px 0; font-family: 'Orbitron', sans-serif;">Rank #${rank} - Top 5!</div>` : ''}
        <div style="margin-top: 30px;">
            <button class="neon-btn primary" onclick="playAgainNormal()">PLAY AGAIN</button>
        </div>
        <button class="back-btn" onclick="goHome()">Back to Menu</button>
    `;
}

function showFriendResult() {
    const time = gameState.reactionTime;
    const timeDigits = Math.floor(time * 100);
    const guess = gameState.friendGuess;
    const matched = timeDigits === guess;
    
    if (matched) {
        playSuccessSound();
        launchConfetti();
        saveFriendWin(gameState.friendPlayerName, gameState.friendGuesserName, guess.toString().padStart(2, '0'), time);
    } else {
        playErrorSound();
    }
    
    showScreen('result-screen');
    
    document.getElementById('result-content').innerHTML = `
        <h2 class="mode-title">FRIEND CHALLENGE RESULT</h2>
        <div class="result-info">
            <div class="label">Players</div>
            <div class="value">${escapeHtml(gameState.friendPlayerName)} & ${escapeHtml(gameState.friendGuesserName)}</div>
        </div>
        <div class="result-info">
            <div class="label">Friend's Guess</div>
            <div class="value">0.${guess.toString().padStart(2, '0')}s</div>
        </div>
        <div class="result-time">${time.toFixed(3)}s</div>
        <div class="result-match ${matched ? 'perfect' : 'fail'}">
            ${matched ? 'PERFECT MATCH! ' + escapeHtml(gameState.friendGuesserName).toUpperCase() + ' WINS!' : 'Not matched. Try again!'}
        </div>
        <div style="margin-top: 30px;">
            <button class="neon-btn secondary" onclick="playAgainFriend()">PLAY AGAIN</button>
        </div>
        <button class="back-btn" onclick="goHome()">Back to Menu</button>
    `;
}

function getRating(time) {
    if (time < 0.20) return { text: 'LIGHTNING FAST', class: 'lightning' };
    if (time < 0.30) return { text: 'GAMER REFLEX', class: 'gamer' };
    if (time < 0.40) return { text: 'AVERAGE HUMAN', class: 'average' };
    return { text: 'SLOW TURTLE', class: 'slow' };
}

function playAgainNormal() {
    playClickSound();
    startNormalFlow();
}

function playAgainFriend() {
    playClickSound();
    startFriendFlow();
}

// ==================== EVENT LISTENERS ====================
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault();
        
        const normalMode = document.getElementById('normal-mode');
        const friendModeGame = document.getElementById('friend-mode-game');
        
        if (normalMode && normalMode.classList.contains('active')) {
            if (gameState.phase === 'idle') {
                startGame();
            } else {
                handleClick('game-panel');
            }
        } else if (friendModeGame && friendModeGame.classList.contains('active')) {
            if (gameState.phase === 'idle') {
                startFriendGame();
            } else {
                handleClick('friend-game-panel');
            }
        }
    }
});

document.addEventListener('click', (e) => {
    if (gameState.phase === 'waiting' || gameState.phase === 'ready') {
        const normalPanel = document.getElementById('game-panel');
        const friendPanel = document.getElementById('friend-game-panel');
        
        if (normalPanel && normalPanel.classList.contains('ready')) {
            handleClick('game-panel');
        } else if (friendPanel && friendPanel.classList.contains('ready')) {
            handleClick('friend-game-panel');
        }
    }
});

// Enter key for inputs
document.getElementById('player-name-input')?.addEventListener('keydown', (e) => {
    if (e.code === 'Enter') confirmPlayerName();
});

document.getElementById('friend-guess-input')?.addEventListener('keydown', (e) => {
    if (e.code === 'Enter') confirmFriendSetup();
});

window.addEventListener('resize', () => {
    initParticles();
    initConfetti();
});

// ==================== INIT ====================
document.addEventListener('DOMContentLoaded', () => {
    initParticles();
    initConfetti();
    animateParticles();
    loadLeaderboards();
});