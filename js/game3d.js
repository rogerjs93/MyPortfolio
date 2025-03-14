// Game3D - A 3D portfolio exploration game using Three.js

// Game Configuration
const gameConfig = {
    movementSpeed: 0.15,
    jumpForce: 0.3,
    gravity: 0.01,
    cameraFollowSpeed: 0.05,
    collectibleRotationSpeed: 0.02,
    platformWidth: 5,
    platformDepth: 5,
    platformSpacing: 10
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
    playerVelocity: new THREE.Vector3(),
    isJumping: false,
    canJump: true,
    keys: {
        forward: false,
        backward: false,
        left: false,
        right: false,
        jump: false
    }
};

// Three.js variables
let scene, camera, renderer, player;
let platforms = [];
let collectibles = [];
let raycaster;
let clock;
let gameContainer;
let scoreDisplay;
let gameStarted = false;

// DOM Elements
document.addEventListener('DOMContentLoaded', () => {
    // Create game container
    setupGameContainer();
    
    // Show instructions and start button
    createGameInstructions();
    
    // Add skip game button
    createSkipButton();
});

function setupGameContainer() {
    // Create game container div
    gameContainer = document.createElement('div');
    gameContainer.id = 'game-container';
    document.body.prepend(gameContainer);
    
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
    
    // Add locked class to sections
    const contentSections = document.querySelectorAll('section[id]');
    contentSections.forEach(section => {
        const sectionId = section.id;
        if (sectionId !== 'about') {
            section.classList.add('locked-section');
            gameState.totalCollectibles++;
        }
    });
    
    // Update collectibles counter
    updateScore();
}

function createGameInstructions() {
    const instructions = document.createElement('div');
    instructions.id = 'game-instructions';
    instructions.innerHTML = `
        <h2>Welcome to my 3D Interactive Portfolio!</h2>
        <p>Explore my professional journey through this interactive 3D game.</p>
        <p>Controls:</p>
        <ul>
            <li>W/↑ : Move forward</li>
            <li>S/↓ : Move backward</li>
            <li>A/← : Move left</li>
            <li>D/→ : Move right</li>
            <li>Space : Jump</li>
        </ul>
        <p>Collect all portfolio items to unlock information about my skills and experience!</p>
    `;
    
    const startButton = document.createElement('button');
    startButton.id = 'start-game';
    startButton.textContent = 'Start 3D Game';
    startButton.addEventListener('click', initGame);
    
    gameContainer.appendChild(instructions);
    gameContainer.appendChild(startButton);
}

function createSkipButton() {
    const skipButton = document.createElement('button');
    skipButton.id = 'skip-game';
    skipButton.textContent = 'Skip Game';
    skipButton.addEventListener('click', skipGame);
    gameContainer.appendChild(skipButton);
}

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

function initGame() {
    // Hide instructions and start button
    document.getElementById('game-instructions').style.display = 'none';
    document.getElementById('start-game').style.display = 'none';
    
    // Initialize Three.js scene
    initThreeJS();
    
    // Add event listeners for controls
    setupEventListeners();
    
    // Start the game loop
    gameStarted = true;
    animate();
}

function initThreeJS() {
    // Create scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb);  // Sky blue background
    
    // Create camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 3, 10);
    camera.lookAt(0, 0, 0);
    
    // Create renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    gameContainer.appendChild(renderer.domElement);
    
    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    // Add directional light (sun)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(50, 200, 100);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 1024;
    directionalLight.shadow.mapSize.height = 1024;
    scene.add(directionalLight);
    
    // Create player
    createPlayer();
    
    // Create platforms and collectibles
    createPlatforms();
    
    // Create ground
    createGround();
    
    // Create decorative elements
    createSkybox();
    createClouds();
    
    // Initialize raycaster for collision detection
    raycaster = new THREE.Raycaster();
    
    // Initialize clock for consistent movement
    clock = new THREE.Clock();
}

function createPlayer() {
    // Create player geometry (simple character for now)
    const geometry = new THREE.BoxGeometry(1, 2, 1);
    const material = new THREE.MeshPhongMaterial({ 
        color: 0x3a86ff,  // Blue color
        shininess: 30
    });
    
    player = new THREE.Mesh(geometry, material);
    player.position.set(0, 1, 0);  // Position player at origin
    player.castShadow = true;
    player.receiveShadow = true;
    
    // Add a simple face to the player
    const faceGeometry = new THREE.PlaneGeometry(0.6, 0.3);
    const faceMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const face = new THREE.Mesh(faceGeometry, faceMaterial);
    face.position.set(0, 0.5, 0.51);
    player.add(face);
    
    scene.add(player);
}

function createPlatforms() {
    // Get section IDs
    const sectionIds = ['projects', 'experience', 'certifications', 'skills', 'education', 'contact'];
    
    // Create platforms in a spiral pattern
    sectionIds.forEach((sectionId, index) => {
        // Calculate position in a spiral
        const angle = index * 0.8;
        const radius = 15 + index * 5;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        
        // Create platform
        const platformGeometry = new THREE.BoxGeometry(
            gameConfig.platformWidth,
            1,
            gameConfig.platformDepth
        );
        const platformMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x4caf50,  // Green color
            shininess: 30
        });
        
        const platform = new THREE.Mesh(platformGeometry, platformMaterial);
        platform.position.set(x, -0.5, z);
        platform.receiveShadow = true;
        platform.userData = { sectionId: sectionId };
        
        scene.add(platform);
        platforms.push(platform);
        
        // Create collectible on this platform
        createCollectible(x, 1.5, z, sectionId);
        
        // Add section label
        createSectionLabel(x, 1, z, sectionId);
    });
}

function createCollectible(x, y, z, sectionId) {
    // Create a collectible (rotating star)
    const starShape = new THREE.Shape();
    
    // Define star shape
    const outerRadius = 0.5;
    const innerRadius = 0.2;
    const spikes = 5;
    
    for (let i = 0; i < spikes * 2; i++) {
        const radius = i % 2 === 0 ? outerRadius : innerRadius;
        const angle = (i / (spikes * 2)) * Math.PI * 2;
        const sx = Math.cos(angle) * radius;
        const sy = Math.sin(angle) * radius;
        
        if (i === 0) {
            starShape.moveTo(sx, sy);
        } else {
            starShape.lineTo(sx, sy);
        }
    }
    starShape.closePath();
    
    const extrudeSettings = {
        depth: 0.1,
        bevelEnabled: true,
        bevelSegments: 1,
        bevelSize: 0.05,
        bevelThickness: 0.05
    };
    
    const geometry = new THREE.ExtrudeGeometry(starShape, extrudeSettings);
    const material = new THREE.MeshPhongMaterial({ 
        color: 0xffcc00,  // Gold color
        metalness: 0.5,
        roughness: 0.3,
        shininess: 100
    });
    
    const collectible = new THREE.Mesh(geometry, material);
    collectible.position.set(x, y, z);
    collectible.castShadow = true;
    collectible.receiveShadow = true;
    collectible.userData = { type: 'collectible', sectionId: sectionId };
    
    scene.add(collectible);
    collectibles.push(collectible);
}

function createSectionLabel(x, y, z, sectionId) {
    // Create a text label for each platform
    const div = document.createElement('div');
    div.className = 'section-label';
    div.textContent = sectionId.charAt(0).toUpperCase() + sectionId.slice(1);
    div.style.position = 'absolute';
    div.style.color = 'white';
    div.style.padding = '5px 10px';
    div.style.background = 'rgba(0, 0, 0, 0.7)';
    div.style.borderRadius = '5px';
    div.style.transform = 'translate(-50%, -50%)';
    div.style.pointerEvents = 'none';
    div.style.fontSize = '14px';
    div.style.fontWeight = 'bold';
    div.style.fontFamily = 'Poppins, sans-serif';
    
    gameContainer.appendChild(div);
    
    // Update position in animation loop
    const updateLabelPosition = () => {
        if (!gameStarted) return;
        
        const vector = new THREE.Vector3(x, y + 1.2, z);
        vector.project(camera);
        
        const widthHalf = window.innerWidth / 2;
        const heightHalf = window.innerHeight / 2;
        
        div.style.left = (vector.x * widthHalf + widthHalf) + 'px';
        div.style.top = (- vector.y * heightHalf + heightHalf) + 'px';
        
        // Hide if behind camera
        div.style.display = vector.z > 1 ? 'none' : 'block';
        
        requestAnimationFrame(updateLabelPosition);
    };
    
    updateLabelPosition();
}

function createGround() {
    // Create large ground plane
    const groundGeometry = new THREE.PlaneGeometry(1000, 1000);
    const groundMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x3867d6,
        side: THREE.DoubleSide
    });
    
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -1;
    ground.receiveShadow = true;
    
    scene.add(ground);
}

function createSkybox() {
    const skyGeometry = new THREE.BoxGeometry(1000, 1000, 1000);
    const materialArray = [];
    
    const skyColors = [
        0x87ceeb, // Right
        0x87ceeb, // Left
        0x6ca9e0, // Top (darker blue)
        0xa1c4fd, // Bottom (lighter blue)
        0x87ceeb, // Front
        0x87ceeb  // Back
    ];
    
    for (let i = 0; i < 6; i++) {
        materialArray.push(
            new THREE.MeshBasicMaterial({
                color: skyColors[i],
                side: THREE.BackSide
            })
        );
    }
    
    const skybox = new THREE.Mesh(skyGeometry, materialArray);
    scene.add(skybox);
}

function createClouds() {
    // Create multiple clouds
    for (let i = 0; i < 20; i++) {
        const cloudGroup = new THREE.Group();
        
        // Create cloud puffs
        const puffs = Math.floor(Math.random() * 3) + 3;
        
        for (let j = 0; j < puffs; j++) {
            const puffGeometry = new THREE.SphereGeometry(
                Math.random() * 2 + 1,
                8,
                8
            );
            const puffMaterial = new THREE.MeshPhongMaterial({
                color: 0xffffff,
                transparent: true,
                opacity: 0.8
            });
            
            const puff = new THREE.Mesh(puffGeometry, puffMaterial);
            puff.position.set(
                Math.random() * 4 - 2,
                Math.random() * 1,
                Math.random() * 4 - 2
            );
            
            cloudGroup.add(puff);
        }
        
        // Position the cloud randomly in the scene
        cloudGroup.position.set(
            Math.random() * 200 - 100,
            Math.random() * 20 + 30,
            Math.random() * 200 - 100
        );
        
        scene.add(cloudGroup);
        
        // Add animation data to cloud for movement
        cloudGroup.userData = {
            speed: Math.random() * 0.05 + 0.01,
            direction: new THREE.Vector3(
                Math.random() * 2 - 1,
                0,
                Math.random() * 2 - 1
            ).normalize()
        };
        
        // Add cloud to a list for animation
        animateClouds(cloudGroup);
    }
}

function animateClouds(cloud) {
    const animate = () => {
        if (!gameStarted) {
            requestAnimationFrame(animate);
            return;
        }
        
        // Move cloud according to its speed and direction
        cloud.position.x += cloud.userData.direction.x * cloud.userData.speed;
        cloud.position.z += cloud.userData.direction.z * cloud.userData.speed;
        
        // If cloud moves too far, reset position
        if (
            Math.abs(cloud.position.x) > 100 ||
            Math.abs(cloud.position.z) > 100
        ) {
            cloud.position.set(
                Math.random() * 200 - 100,
                Math.random() * 20 + 30,
                Math.random() * 200 - 100
            );
        }
        
        requestAnimationFrame(animate);
    };
    
    animate();
}

function setupEventListeners() {
    // Keyboard controls
    document.addEventListener('keydown', (e) => {
        switch (e.code) {
            case 'KeyW':
            case 'ArrowUp':
                gameState.keys.forward = true;
                break;
            case 'KeyS':
            case 'ArrowDown':
                gameState.keys.backward = true;
                break;
            case 'KeyA':
            case 'ArrowLeft':
                gameState.keys.left = true;
                break;
            case 'KeyD':
            case 'ArrowRight':
                gameState.keys.right = true;
                break;
            case 'Space':
                gameState.keys.jump = true;
                if (gameState.canJump) {
                    jump();
                }
                break;
        }
    });
    
    document.addEventListener('keyup', (e) => {
        switch (e.code) {
            case 'KeyW':
            case 'ArrowUp':
                gameState.keys.forward = false;
                break;
            case 'KeyS':
            case 'ArrowDown':
                gameState.keys.backward = false;
                break;
            case 'KeyA':
            case 'ArrowLeft':
                gameState.keys.left = false;
                break;
            case 'KeyD':
            case 'ArrowRight':
                gameState.keys.right = false;
                break;
            case 'Space':
                gameState.keys.jump = false;
                break;
        }
    });
    
    // Touch controls for mobile
    createTouchControls();
    
    // Handle window resize
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

function createTouchControls() {
    const controlsContainer = document.createElement('div');
    controlsContainer.className = 'game-controls';
    
    // Directional buttons
    const directions = [
        { id: 'up', text: '↑', key: 'forward' },
        { id: 'down', text: '↓', key: 'backward' },
        { id: 'left', text: '←', key: 'left' },
        { id: 'right', text: '→', key: 'right' }
    ];
    
    directions.forEach(dir => {
        const button = document.createElement('button');
        button.className = 'game-control-btn';
        button.id = `move-${dir.id}`;
        button.innerHTML = dir.text;
        
        // Touch events for mobile
        button.addEventListener('touchstart', () => {
            gameState.keys[dir.key] = true;
        });
        
        button.addEventListener('touchend', () => {
            gameState.keys[dir.key] = false;
        });
        
        controlsContainer.appendChild(button);
    });
    
    // Jump button
    const jumpBtn = document.createElement('button');
    jumpBtn.className = 'game-control-btn';
    jumpBtn.id = 'jump';
    jumpBtn.innerHTML = 'Jump';
    
    jumpBtn.addEventListener('touchstart', () => {
        if (gameState.canJump) {
            jump();
        }
    });
    
    controlsContainer.appendChild(jumpBtn);
    gameContainer.appendChild(controlsContainer);
}

function jump() {
    if (gameState.canJump) {
        gameState.playerVelocity.y = gameConfig.jumpForce;
        gameState.isJumping = true;
        gameState.canJump = false;
    }
}

function updatePlayerMovement(deltaTime) {
    // Store the initial position for collision detection
    const initialPosition = player.position.clone();
    
    // Apply gravity
    gameState.playerVelocity.y -= gameConfig.gravity;
    
    // Update player position based on velocity
    player.position.y += gameState.playerVelocity.y;
    
    // Check for ground/platform collision
    checkGroundCollision();
    
    // Handle keyboard input for movement
    const moveDirection = new THREE.Vector3(0, 0, 0);
    
    // Move direction is relative to camera
    if (gameState.keys.forward) {
        moveDirection.z -= 1;
    }
    if (gameState.keys.backward) {
        moveDirection.z += 1;
    }
    if (gameState.keys.left) {
        moveDirection.x -= 1;
    }
    if (gameState.keys.right) {
        moveDirection.x += 1;
    }
    
    // Normalize movement vector
    if (moveDirection.length() > 0) {
        moveDirection.normalize();
    }
    
    // Apply movement based on camera direction
    if (moveDirection.length() > 0) {
        // Get camera direction
        const cameraDirection = new THREE.Vector3();
        camera.getWorldDirection(cameraDirection);
        cameraDirection.y = 0;
        cameraDirection.normalize();
        
        // Calculate movement vectors
        const sideVector = new THREE.Vector3();
        sideVector.crossVectors(camera.up, cameraDirection).normalize();
        
        const moveX = moveDirection.x * sideVector.x + moveDirection.z * cameraDirection.x;
        const moveZ = moveDirection.x * sideVector.z + moveDirection.z * cameraDirection.z;
        
        player.position.x += moveX * gameConfig.movementSpeed * deltaTime;
        player.position.z += moveZ * gameConfig.movementSpeed * deltaTime;
        
        // Face movement direction
        if (moveX !== 0 || moveZ !== 0) {
            const angle = Math.atan2(moveX, moveZ);
            player.rotation.y = angle;
        }
    }
    
    // Check for collectibles
    checkCollectibleCollision();
    
    // Update camera position to follow player
    updateCameraPosition();
}

function checkGroundCollision() {
    // Check if player has hit the ground (y = 0)
    if (player.position.y <= 1) {
        player.position.y = 1;
        gameState.playerVelocity.y = 0;
        gameState.isJumping = false;
        gameState.canJump = true;
        return;
    }
    
    // Cast a ray downward from the player
    raycaster.set(
        new THREE.Vector3(player.position.x, player.position.y, player.position.z),
        new THREE.Vector3(0, -1, 0)
    );
    
    const intersects = raycaster.intersectObjects(platforms);
    
    if (intersects.length > 0 && intersects[0].distance <= 1.1) {
        player.position.y = intersects[0].point.y + 1;
        gameState.playerVelocity.y = 0;
        gameState.isJumping = false;
        gameState.canJump = true;
    }
}

function checkCollectibleCollision() {
    // Define a simple collision radius
    const collisionRadius = 1.5;
    
    collectibles.forEach((collectible, index) => {
        if (collectible.visible) {
            const distance = player.position.distanceTo(collectible.position);
            
            if (distance < collisionRadius) {
                // Collect the item
                collectible.visible = false;
                gameState.score += 10;
                gameState.collectiblesFound++;
                
                // Unlock the corresponding section
                const sectionId = collectible.userData.sectionId;
                unlockSection(sectionId);
                
                // Update score
                updateScore();
                
                // Show celebratory animation
                showCelebration(sectionId);
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
        
        // Scroll to the section after game completion
        if (gameState.collectiblesFound === gameState.totalCollectibles) {
            setTimeout(() => {
                section.scrollIntoView({ behavior: 'smooth' });
            }, 3000);
        }
    }
}

function updateCameraPosition() {
    // Calculate target camera position (behind player)
    const cameraOffset = new THREE.Vector3(0, 3, 7);
    
    // Rotate offset based on player rotation
    cameraOffset.applyAxisAngle(new THREE.Vector3(0, 1, 0), player.rotation.y);
    
    // Add offset to player position
    const targetPosition = player.position.clone().add(cameraOffset);
    
    // Smoothly move camera to target position
    camera.position.lerp(targetPosition, gameConfig.cameraFollowSpeed);
    
    // Make camera look at player
    camera.lookAt(
        player.position.x,
        player.position.y + 1,
        player.position.z
    );
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
        <button id="explore-btn">Explore Portfolio</button>
        <button id="contact-me-btn">Contact Me</button>
    `;
    gameContainer.appendChild(victoryMessage);
    
    document.getElementById('explore-btn').addEventListener('click', () => {
        skipGame();
    });
    
    document.getElementById('contact-me-btn').addEventListener('click', () => {
        skipGame();
        document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });
    });
}

function animate() {
    if (!gameStarted) return;
    
    requestAnimationFrame(animate);
    
    const deltaTime = clock.getDelta();
    
    // Update player movement
    updatePlayerMovement(deltaTime * 60);  // Multiply by 60 to normalize for 60fps
    
    // Rotate collectibles
    collectibles.forEach(collectible => {
        if (collectible.visible) {
            collectible.rotation.y += gameConfig.collectibleRotationSpeed;
        }
    });
    
    // Render the scene
    renderer.render(scene, camera);
}