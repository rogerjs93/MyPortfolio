// Game Configuration
const gameConfig = {
    characterSpeed: 5,
    gravity: 0.5,
    jumpForce: 12,
    platformHeight: 10,
    collectiblePoints: 10
};

// Game State
const gameState = {
    score: 0,
    collectiblesFound: 0,
    totalCollectibles: 0,
    sectionsUnlocked: {
        about: true,
        projects: false,
        experience: false,
        certifications: false,
        skills: false,
        education: false,
        contact: false
    },
    characterPosition: { x: 100, y: 0 },
    isJumping: false,
    isFalling: false,
    jumpSpeed: 0,
    facingRight: true
};

// Game Elements
let character;
let platforms = [];
let collectibles = [];
let sections = [];
let gameContainer;
let scoreDisplay;
let gameStarted = false;

// Game Initialization
document.addEventListener('DOMContentLoaded', () => {
    prepareGameElements();
    setupGameControls();
    createSceneryElements();
    
    // Start button
    const startButton = document.getElementById('start-game');
    if (startButton) {
        startButton.addEventListener('click', startGame);
    }
    
    // Create skip game button
    const skipButton = document.createElement('button');
    skipButton.id = 'skip-game';
    skipButton.textContent = 'Skip Game';
    skipButton.addEventListener('click', skipGame);
    gameContainer.appendChild(skipButton);
    
    // Create initial instructions
    createGameInstructions();
});

function prepareGameElements() {
    // Create game container
    gameContainer = document.createElement('div');
    gameContainer.id = 'game-container';
    document.body.prepend(gameContainer);
    
    // Create character
    character = document.createElement('div');
    character.id = 'game-character';
    character.className = 'character';
    gameContainer.appendChild(character);
    
    // Create score display
    scoreDisplay = document.createElement('div');
    scoreDisplay.id = 'score-display';
    scoreDisplay.innerHTML = 'Score: 0 | Collectibles: 0/0';
    gameContainer.appendChild(scoreDisplay);
    
    // Hide regular navigation
    const navContainer = document.querySelector('.nav-container');
    if (navContainer) {
        navContainer.style.opacity = '0';
        navContainer.style.pointerEvents = 'none';
    }
    
    // Create game sections from the actual sections
    const contentSections = document.querySelectorAll('section[id]');
    contentSections.forEach((section, index) => {
        const sectionId = section.id;
        
        // Don't include the about section as it's visible by default
        if (sectionId !== 'about') {
            section.classList.add('locked-section');
            
            // Create a platform for this section
            const platform = document.createElement('div');
            platform.className = 'game-platform';
            platform.dataset.target = sectionId;
            platform.style.left = `${(index + 1) * 300}px`;
            platform.style.bottom = '100px';
            gameContainer.appendChild(platform);
            platforms.push(platform);
            
            // Create a collectible for this section
            const collectible = document.createElement('div');
            collectible.className = 'game-collectible';
            collectible.dataset.target = sectionId;
            collectible.style.left = `${(index + 1) * 300 + 20}px`;
            collectible.style.bottom = '150px';
            gameContainer.appendChild(collectible);
            collectibles.push(collectible);
            gameState.totalCollectibles++;
        }
    });
    
    // Update collectibles counter
    updateScore();
}

function setupGameControls() {
    // Keyboard controls
    document.addEventListener('keydown', (e) => {
        if (!gameStarted) return;
        
        switch (e.key) {
            case 'ArrowLeft':
                moveCharacter('left');
                break;
            case 'ArrowRight':
                moveCharacter('right');
                break;
            case 'ArrowUp':
            case ' ': // Space
                if (!gameState.isJumping && !gameState.isFalling) {
                    jump();
                }
                break;
        }
    });
    
    // Touch controls for mobile
    const leftBtn = document.createElement('button');
    leftBtn.className = 'game-control-btn';
    leftBtn.id = 'move-left';
    leftBtn.innerHTML = '←';
    leftBtn.addEventListener('touchstart', () => moveCharacter('left'));
    
    const rightBtn = document.createElement('button');
    rightBtn.className = 'game-control-btn';
    rightBtn.id = 'move-right';
    rightBtn.innerHTML = '→';
    rightBtn.addEventListener('touchstart', () => moveCharacter('right'));
    
    const jumpBtn = document.createElement('button');
    jumpBtn.className = 'game-control-btn';
    jumpBtn.id = 'jump';
    jumpBtn.innerHTML = '↑';
    jumpBtn.addEventListener('touchstart', () => {
        if (!gameState.isJumping && !gameState.isFalling) {
            jump();
        }
    });
    
    const controlsContainer = document.createElement('div');
    controlsContainer.className = 'game-controls';
    controlsContainer.appendChild(leftBtn);
    controlsContainer.appendChild(jumpBtn);
    controlsContainer.appendChild(rightBtn);
    gameContainer.appendChild(controlsContainer);
}

function startGame() {
    gameStarted = true;
    document.getElementById('game-instructions').style.display = 'none';
    document.getElementById('start-game').style.display = 'none';
    
    // Set character position
    gameState.characterPosition = { x: 100, y: 100 };
    updateCharacterPosition();
    
    // Start game loop
    window.requestAnimationFrame(gameLoop);
}

function gameLoop() {
    if (!gameStarted) return;
    
    // Apply gravity
    if (gameState.isJumping) {
        gameState.characterPosition.y += gameState.jumpSpeed;
        gameState.jumpSpeed -= gameConfig.gravity;
        
        if (gameState.jumpSpeed <= 0) {
            gameState.isJumping = false;
            gameState.isFalling = true;
            gameState.jumpSpeed = 0;
        }
    } else if (gameState.isFalling) {
        gameState.characterPosition.y -= gameConfig.gravity * 5;
        
        // Check for platform landing
        const onPlatform = checkPlatformCollision();
        if (onPlatform || gameState.characterPosition.y <= 100) {
            gameState.isFalling = false;
            gameState.characterPosition.y = onPlatform ? 
                parseInt(onPlatform.style.bottom) + gameConfig.platformHeight + 40 : 
                100;
        }
    }
    
    // Check for collectibles
    checkCollectibleCollision();
    
    // Update character position
    updateCharacterPosition();
    
    // Continue game loop
    window.requestAnimationFrame(gameLoop);
}

function moveCharacter(direction) {
    if (direction === 'left') {
        gameState.characterPosition.x -= gameConfig.characterSpeed;
        gameState.facingRight = false;
    } else if (direction === 'right') {
        gameState.characterPosition.x += gameConfig.characterSpeed;
        gameState.facingRight = true;
    }
    
    // Update character sprite direction
    character.style.transform = gameState.facingRight ? 'scaleX(1)' : 'scaleX(-1)';
}

function jump() {
    gameState.isJumping = true;
    gameState.jumpSpeed = gameConfig.jumpForce;
}

function updateCharacterPosition() {
    character.style.left = `${gameState.characterPosition.x}px`;
    character.style.bottom = `${gameState.characterPosition.y}px`;
}

function checkPlatformCollision() {
    for (const platform of platforms) {
        const platformRect = platform.getBoundingClientRect();
        const characterRect = character.getBoundingClientRect();
        
        if (characterRect.right > platformRect.left && 
            characterRect.left < platformRect.right && 
            characterRect.bottom >= platformRect.top &&
            characterRect.bottom <= platformRect.top + 20) {
            return platform;
        }
    }
    return false;
}

function checkCollectibleCollision() {
    collectibles.forEach((collectible, index) => {
        if (collectible.style.display !== 'none') {
            const collectibleRect = collectible.getBoundingClientRect();
            const characterRect = character.getBoundingClientRect();
            
            if (characterRect.right > collectibleRect.left && 
                characterRect.left < collectibleRect.right && 
                characterRect.bottom > collectibleRect.top && 
                characterRect.top < collectibleRect.bottom) {
                
                // Collect the item
                collectible.style.display = 'none';
                gameState.score += gameConfig.collectiblePoints;
                gameState.collectiblesFound++;
                
                // Unlock the corresponding section
                const targetSection = collectible.dataset.target;
                unlockSection(targetSection);
                
                // Update score
                updateScore();
                
                // Show celebratory animation
                showCelebration(targetSection);
            }
        }
    });
}

function unlockSection(sectionId) {
    gameState.sectionsUnlocked[sectionId] = true;
    
    // Remove locked class from section
    const section = document.getElementById(sectionId);
    if (section) {
        section.classList.remove('locked-section');
        
        // Scroll to the section
        setTimeout(() => {
            section.scrollIntoView({ behavior: 'smooth' });
        }, 1000);
    }
}

function updateScore() {
    scoreDisplay.innerHTML = `Score: ${gameState.score} | Collectibles: ${gameState.collectiblesFound}/${gameState.totalCollectibles}`;
    
    // Check if all collectibles are found
    if (gameState.collectiblesFound === gameState.totalCollectibles) {
        showVictoryMessage();
    }
}

function showCelebration(sectionId) {
    const celebration = document.createElement('div');
    celebration.className = 'celebration';
    celebration.innerHTML = `<p>🎉 ${sectionId.charAt(0).toUpperCase() + sectionId.slice(1)} Section Unlocked! 🎉</p>`;
    gameContainer.appendChild(celebration);
    
    setTimeout(() => {
        celebration.classList.add('fade-out');
        setTimeout(() => {
            gameContainer.removeChild(celebration);
        }, 1000);
    }, 2000);
}

function showVictoryMessage() {
    const victoryMessage = document.createElement('div');
    victoryMessage.className = 'victory-message';
    victoryMessage.innerHTML = `
        <h2>Congratulations!</h2>
        <p>You've unlocked all sections of my portfolio!</p>
        <p>Feel free to explore everything or contact me directly.</p>
        <button id="contact-me-btn">Contact Me</button>
    `;
    gameContainer.appendChild(victoryMessage);
    
    document.getElementById('contact-me-btn').addEventListener('click', () => {
        document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });
        victoryMessage.classList.add('fade-out');
        setTimeout(() => {
            gameContainer.removeChild(victoryMessage);
        }, 1000);
    });
}

function createGameInstructions() {
    const instructions = document.createElement('div');
    instructions.id = 'game-instructions';
    instructions.innerHTML = `
        <h2>Welcome to my Interactive Portfolio Game!</h2>
        <p>Explore my professional journey through this interactive game.</p>
        <p>Use the arrow keys or on-screen controls to move and jump.</p>
        <p>Collect all portfolio items to unlock information about my skills and experience!</p>
        <ul>
            <li>← → : Move left/right</li>
            <li>↑ or Space: Jump</li>
            <li>Collect items to unlock sections of my portfolio</li>
        </ul>
    `;
    
    const startButton = document.createElement('button');
    startButton.id = 'start-game';
    startButton.textContent = 'Start Game';
    
    gameContainer.appendChild(instructions);
    gameContainer.appendChild(startButton);
}

// Create background scenery
function createSceneryElements() {
    // Create ground
    const ground = document.createElement('div');
    ground.className = 'ground scenery';
    gameContainer.appendChild(ground);
    
    // Create clouds
    for (let i = 0; i < 5; i++) {
        const cloud = document.createElement('div');
        cloud.className = 'cloud scenery';
        cloud.style.top = `${Math.random() * 200 + 50}px`;
        cloud.style.left = `${Math.random() * window.innerWidth}px`;
        cloud.style.animationDuration = `${Math.random() * 30 + 30}s`;
        gameContainer.appendChild(cloud);
    }
}

// Skip game function
function skipGame() {
    // Hide game elements
    gameContainer.style.display = 'none';
    
    // Make navigation visible again
    const navContainer = document.querySelector('.nav-container');
    if (navContainer) {
        navContainer.style.opacity = '1';
        navContainer.style.pointerEvents = 'auto';
    }
    
    // Unlock all sections
    const sections = ['projects', 'experience', 'certifications', 'skills', 'education', 'contact'];
    sections.forEach(section => {
        const sectionElement = document.getElementById(section);
        if (sectionElement) {
            sectionElement.classList.remove('locked-section');
        }
    });
}