// Game3D - Multi-Universe Portfolio Explorer inspired by Doctor Who

// Universe types with themes
const universeTypes = {
    hub: {
        name: "Hub World",
        description: "Central hub with doors to different universes",
        skyColor: 0x1a237e, // Deep blue
        groundColor: 0x303f9f,
        ambientLight: 0x9fa8da,
        fogColor: 0x283593,
        fogDensity: 0.01
    },
    experience: {
        name: "Work Experience Universe",
        description: "A futuristic cityscape representing your career path",
        skyColor: 0x0288d1, // Blue
        groundColor: 0x0277bd,
        ambientLight: 0x81d4fa,
        fogColor: 0x01579b,
        fogDensity: 0.015
    },
    certifications: {
        name: "Certifications Universe",
        description: "A mystical library with floating certifications",
        skyColor: 0x4a148c, // Purple
        groundColor: 0x6a1b9a,
        ambientLight: 0xce93d8,
        fogColor: 0x4a148c,
        fogDensity: 0.02
    },
    projects: {
        name: "Projects Universe",
        description: "A technological workshop with interactive project displays",
        skyColor: 0x1b5e20, // Green
        groundColor: 0x2e7d32,
        ambientLight: 0xa5d6a7,
        fogColor: 0x1b5e20,
        fogDensity: 0.01
    },
    skills: {
        name: "Skills Universe",
        description: "A constellation of stars representing your skill set",
        skyColor: 0x212121, // Dark space
        groundColor: 0x424242,
        ambientLight: 0x757575,
        fogColor: 0x000000,
        fogDensity: 0.008
    },
    education: {
        name: "Education Universe",
        description: "A campus-like environment with academic elements",
        skyColor: 0xbf360c, // Orange
        groundColor: 0xd84315,
        ambientLight: 0xffab91,
        fogColor: 0xbf360c,
        fogDensity: 0.015
    },
    tes: {
        name: "TES Universe",
        description: "Technology Education Space with interactive learning modules",
        skyColor: 0x006064, // Teal
        groundColor: 0x00838f,
        ambientLight: 0x80deea,
        fogColor: 0x006064,
        fogDensity: 0.012
    }
};

// Game Configuration
const gameConfig = {
    movementSpeed: 0.15,
    jumpForce: 0.3,
    gravity: 0.01,
    cameraFollowSpeed: 0.05,
    collectibleRotationSpeed: 0.02,
    doorTransitionSpeed: 0.02,
    starCollectionRadius: 1.5,
    doorActivationDistance: 3,
    maxStarsPerUniverse: 5
};

// Game State
const gameState = {
    currentUniverse: "hub",
    previousUniverse: null,
    universeVisited: {
        hub: true,
        experience: false,
        certifications: false,
        projects: false,
        skills: false,
        education: false
    },
    starsCollected: {
        hub: 0,
        experience: 0,
        certifications: 0,
        projects: 0,
        skills: 0,
        education: 0
    },
    totalStars: {
        hub: 0,
        experience: 0,
        certifications: 0,
        projects: 0,
        skills: 0,
        education: 0
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
    },
    doorTransitioning: false,
    transitionAlpha: 0,
    transitionTarget: null
};

// Three.js variables
let scene, camera, renderer, player;
let universesData = {};
let doors = [];
let stars = [];
let raycaster;
let clock;
let gameContainer;
let scoreDisplay;
let gameStarted = false;
let universeInfoDisplay;

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
    scoreDisplay.innerHTML = 'Stars: 0/0';
    gameContainer.appendChild(scoreDisplay);
    
    // Create universe info display
    universeInfoDisplay = document.createElement('div');
    universeInfoDisplay.id = 'universe-info';
    universeInfoDisplay.innerHTML = 'Current Universe: Hub World';
    gameContainer.appendChild(universeInfoDisplay);
    
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
        }
    });
    
    // Set up total stars based on sections
    Object.keys(universeTypes).forEach(universeKey => {
        if (universeKey !== "hub") {
            gameState.totalStars[universeKey] = gameConfig.maxStarsPerUniverse;
        }
    });
}

function createGameInstructions() {
    const instructions = document.createElement('div');
    instructions.id = 'game-instructions';
    instructions.innerHTML = `
        <h2>Welcome to the Multi-Universe Portfolio Explorer!</h2>
        <p>Inspired by Doctor Who, explore different universes through special doors to discover my professional journey!</p>
        <p>Each universe contains hidden stars that unlock parts of my portfolio.</p>
        <p>Controls:</p>
        <ul>
            <li>W/↑ : Move forward</li>
            <li>S/↓ : Move backward</li>
            <li>A/← : Move left</li>
            <li>D/→ : Move right</li>
            <li>Space : Jump</li>
            <li>E : Interact with doors when nearby</li>
        </ul>
        <p>Start in the Hub World and travel through doors to discover different aspects of my professional background!</p>
    `;
    
    const startButton = document.createElement('button');
    startButton.id = 'start-game';
    startButton.textContent = 'Start Universe Explorer';
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
    
    // Initialize universes
    initUniverses();
    
    // Add event listeners for controls
    setupEventListeners();
    
    // Update universe info display
    updateUniverseInfo();
    
    // Start the game loop
    gameStarted = true;
    animate();
}

function initThreeJS() {
    // Create scene
    scene = new THREE.Scene();
    
    // Create camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 3, 10);
    camera.lookAt(0, 0, 0);
    
    // Create renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    gameContainer.appendChild(renderer.domElement);
    
    // Initialize raycaster for collision detection
    raycaster = new THREE.Raycaster();
    
    // Initialize clock for consistent movement
    clock = new THREE.Clock();
}

function initUniverses() {
    // Create data structures for each universe
    Object.keys(universeTypes).forEach(universeKey => {
        const universeData = universeTypes[universeKey];
        
        const universeScene = new THREE.Scene();
        
        // Set background color and fog
        universeScene.background = new THREE.Color(universeData.skyColor);
        universeScene.fog = new THREE.FogExp2(universeData.fogColor, universeData.fogDensity);
        
        // Add lights
        const ambientLight = new THREE.AmbientLight(universeData.ambientLight, 0.7);
        universeScene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(50, 200, 100);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 1024;
        directionalLight.shadow.mapSize.height = 1024;
        universeScene.add(directionalLight);
        
        // Add ground
        const groundGeometry = new THREE.PlaneGeometry(500, 500);
        const groundMaterial = new THREE.MeshStandardMaterial({ 
            color: universeData.groundColor,
            roughness: 0.8,
            metalness: 0.2
        });
        
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = -1;
        ground.receiveShadow = true;
        universeScene.add(ground);
        
        // Store universe data
        universesData[universeKey] = {
            scene: universeScene,
            doors: [],
            stars: []
        };
    });
    
    // Create player (shared across universes)
    createPlayer();
    
    // Add player to current universe
    universesData[gameState.currentUniverse].scene.add(player);
    
    // Create doors between universes
    createDoors();
    
    // Create stars in each universe
    createStars();
    
    // Add universe-specific decorations
    createUniverseDecorations();
    
    // Update scene reference to current universe
    scene = universesData[gameState.currentUniverse].scene;
}

function createPlayer() {
    // Create player geometry (TARDIS-inspired character)
    const playerGeometry = new THREE.BoxGeometry(1, 2, 1);
    const playerMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x0047ab,  // TARDIS blue
        shininess: 30
    });
    
    player = new THREE.Mesh(playerGeometry, playerMaterial);
    player.position.set(0, 1, 0);  // Position player at origin
    player.castShadow = true;
    player.receiveShadow = true;
    
    // Add a light on top (like the TARDIS light)
    const lightGeometry = new THREE.BoxGeometry(0.3, 0.3, 0.3);
    const lightMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const topLight = new THREE.Mesh(lightGeometry, lightMaterial);
    topLight.position.set(0, 1.2, 0);
    player.add(topLight);
    
    // Add point light to the player
    const playerLight = new THREE.PointLight(0xffffff, 0.5, 5);
    playerLight.position.set(0, 1.5, 0);
    player.add(playerLight);
}

function createDoors() {
    // Create doors to different universes in hub world
    const hubUniverse = universesData.hub;
    
    // Calculate positions in a circle
    const universeKeys = Object.keys(universeTypes).filter(key => key !== "hub");
    const radius = 20;
    const angleStep = (Math.PI * 2) / universeKeys.length;
    
    universeKeys.forEach((universeKey, index) => {
        const angle = angleStep * index;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        
        // Create door to this universe
        createDoor(universeKey, x, 0, z, hubUniverse.scene);
        
        // Create return door in the universe
        createDoor("hub", 0, 0, -10, universesData[universeKey].scene);
    });
}

function createDoor(targetUniverse, x, y, z, parentScene) {
    const universeData = universeTypes[targetUniverse];
    
    // Create door frame
    const frameGeometry = new THREE.BoxGeometry(3, 4, 0.5);
    const frameMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x5d4037, // Wood brown
        shininess: 10
    });
    
    const frame = new THREE.Mesh(frameGeometry, frameMaterial);
    frame.position.set(x, y + 2, z);
    frame.castShadow = true;
    frame.receiveShadow = true;
    parentScene.add(frame);
    
    // Create door
    const doorGeometry = new THREE.BoxGeometry(2.5, 3.5, 0.3);
    const doorMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x1a237e, // TARDIS blue
        shininess: 50,
        emissive: universeData.skyColor,
        emissiveIntensity: 0.2
    });
    
    const door = new THREE.Mesh(doorGeometry, doorMaterial);
    door.position.set(0, 0, 0.2);
    frame.add(door);
    
    // Add universe name label to door
    const universeLabel = document.createElement('div');
    universeLabel.className = 'door-label';
    universeLabel.textContent = universeData.name;
    gameContainer.appendChild(universeLabel);
    
    // Store door data
    const doorData = {
        mesh: frame,
        target: targetUniverse,
        label: universeLabel
    };
    
    doors.push(doorData);
    
    // Create door glow effect
    const glowGeometry = new THREE.BoxGeometry(2.7, 3.7, 0.1);
    const glowMaterial = new THREE.MeshBasicMaterial({ 
        color: universeData.skyColor,
        transparent: true,
        opacity: 0.5
    });
    
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    glow.position.set(0, 0, 0.3);
    door.add(glow);
    
    // Animate glow
    const pulseAnimation = () => {
        if (!gameStarted) {
            requestAnimationFrame(pulseAnimation);
            return;
        }
        
        glow.material.opacity = 0.3 + 0.2 * Math.sin(Date.now() * 0.001);
        requestAnimationFrame(pulseAnimation);
    };
    
    pulseAnimation();
    
    return doorData;
}

function createStars() {
    // Create collectible stars in each universe
    Object.keys(universesData).forEach(universeKey => {
        if (universeKey === "hub") return; // No stars in hub
        
        const universeScene = universesData[universeKey].scene;
        const universeStars = [];
        
        // Create stars
        for (let i = 0; i < gameConfig.maxStarsPerUniverse; i++) {
            // Position randomly, but not too close to doors or other stars
            const minDistance = 5;
            let position;
            let isValidPosition = false;
            
            while (!isValidPosition) {
                position = new THREE.Vector3(
                    (Math.random() - 0.5) * 40,
                    Math.random() * 3 + 1, // Height between 1 and 4
                    (Math.random() - 0.5) * 40
                );
                
                // Check distance from doors
                isValidPosition = true;
                
                // Check distance from other stars
                for (const existingStar of universeStars) {
                    if (position.distanceTo(existingStar.position) < minDistance) {
                        isValidPosition = false;
                        break;
                    }
                }
            }
            
            // Create star
            const star = createStar(position.x, position.y, position.z);
            universeScene.add(star);
            universeStars.push(star);
            stars.push({
                mesh: star,
                universe: universeKey,
                index: i
            });
            
            // Update total stars counter
            gameState.totalStars[universeKey]++;
        }
        
        // Store stars in universe data
        universesData[universeKey].stars = universeStars;
    });
    
    // Update score display
    updateScoreDisplay();
}

function createStar(x, y, z) {
    // Create a star geometry
    const starShape = new THREE.Shape();
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
        shininess: 100,
        emissive: 0xffcc00,
        emissiveIntensity: 0.3
    });
    
    const star = new THREE.Mesh(geometry, material);
    star.position.set(x, y, z);
    star.castShadow = true;
    star.receiveShadow = true;
    
    return star;
}

function createUniverseDecorations() {
    // Add specific decorations to each universe
    
    // Experience Universe - Futuristic cityscape
    createExperienceUniverse();
    
    // Certifications Universe - Mystical library
    createCertificationsUniverse();
    
    // Projects Universe - Workshop
    createProjectsUniverse();
    
    // Skills Universe - Space with constellations
    createSkillsUniverse();
    
    // Education Universe - Campus
    createEducationUniverse();
    
    // TES Universe - Technology Education Space
    createTESUniverse();
    
    // Hub Universe - Central plaza with TARDIS elements
    createHubUniverse();
}

// Implementation of universe decoration functions will follow in Phase 2
// These will create unique visual elements for each universe

function setupEventListeners() {
    // Keyboard controls
    document.addEventListener('keydown', (event) => {
        switch(event.code) {
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
                if (gameState.canJump) {
                    gameState.keys.jump = true;
                }
                break;
            case 'KeyE':
                // Door interaction
                checkDoorInteraction();
                break;
        }
    });

    document.addEventListener('keyup', (event) => {
        switch(event.code) {
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

    // Window resize handler
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

function animate() {
    if (!gameStarted) return;
    
    requestAnimationFrame(animate);
    
    const delta = clock.getDelta();
    
    // Handle player movement and physics
    updatePlayerMovement(delta);
    
    // Update door labels position
    updateDoorLabels();
    
    // Check for star collection
    checkStarCollection();
    
    // Handle universe transition if active
    if (gameState.doorTransitioning) {
        handleUniverseTransition();
    }
    
    // Render current universe scene
    renderer.render(scene, camera);
}

function updatePlayerMovement(delta) {
    // Apply gravity
    if (player.position.y > 0) {
        gameState.playerVelocity.y -= gameConfig.gravity;
    } else {
        gameState.playerVelocity.y = 0;
        player.position.y = 0;
        gameState.canJump = true;
        gameState.isJumping = false;
    }
    
    // Get camera direction for movement relative to view
    const cameraDirection = new THREE.Vector3();
    camera.getWorldDirection(cameraDirection);
    cameraDirection.y = 0;
    cameraDirection.normalize();
    
    // Calculate movement direction
    const moveDirection = new THREE.Vector3(0, 0, 0);
    
    if (gameState.keys.forward) {
        moveDirection.add(cameraDirection);
    }
    if (gameState.keys.backward) {
        moveDirection.add(cameraDirection.clone().negate());
    }
    
    const rightVector = new THREE.Vector3();
    rightVector.crossVectors(camera.up, cameraDirection).normalize();
    
    if (gameState.keys.right) {
        moveDirection.add(rightVector);
    }
    if (gameState.keys.left) {
        moveDirection.add(rightVector.clone().negate());
    }
    
    // Normalize movement vector
    if (moveDirection.length() > 0) {
        moveDirection.normalize();
    }
    
    // Apply horizontal movement
    player.position.x += moveDirection.x * gameConfig.movementSpeed;
    player.position.z += moveDirection.z * gameConfig.movementSpeed;
    
    // Handle jumping
    if (gameState.keys.jump && gameState.canJump && !gameState.isJumping) {
        gameState.playerVelocity.y = gameConfig.jumpForce;
        gameState.canJump = false;
        gameState.isJumping = true;
    }
    
    // Apply vertical movement from velocity
    player.position.y += gameState.playerVelocity.y;
    
    // Update camera position to follow player
    const cameraTargetPosition = new THREE.Vector3(
        player.position.x,
        player.position.y + 3, // Camera height above player
        player.position.z + 5  // Camera distance behind player
    );
    
    // Smooth camera movement
    camera.position.lerp(cameraTargetPosition, gameConfig.cameraFollowSpeed);
    camera.lookAt(player.position);
    
    // Rotate stars
    stars.forEach(starData => {
        if (starData.mesh && starData.universe === gameState.currentUniverse) {
            starData.mesh.rotation.y += gameConfig.collectibleRotationSpeed;
        }
    });
}

function updateDoorLabels() {
    doors.forEach(door => {
        if (door.mesh && door.label) {
            // Convert 3D position to 2D screen position
            const doorPosition = door.mesh.position.clone();
            doorPosition.y += 3; // Display above the door
            
            const vector = doorPosition.clone();
            vector.project(camera);
            
            const x = (vector.x * 0.5 + 0.5) * window.innerWidth;
            const y = (-(vector.y * 0.5) + 0.5) * window.innerHeight;
            
            // Update label position
            door.label.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px)`;
            
            // Show label only when facing the door and within visibility range
            const cameraDirection = new THREE.Vector3();
            camera.getWorldDirection(cameraDirection);
            
            const doorDirection = doorPosition.clone().sub(camera.position).normalize();
            const dot = cameraDirection.dot(doorDirection);
            
            // Show only if facing door (dot product > 0) and not too far away
            const distance = camera.position.distanceTo(doorPosition);
            if (dot > 0 && distance < 30) {
                door.label.style.opacity = '1';
                
                // Make label bigger when closer to door
                const scale = Math.max(1.0, 2 - (distance / 15));
                door.label.style.transform += ` scale(${scale})`;
                
                // Show activation hint when very close
                if (distance < gameConfig.doorActivationDistance) {
                    door.label.classList.add('door-active');
                } else {
                    door.label.classList.remove('door-active');
                }
            } else {
                door.label.style.opacity = '0';
            }
        }
    });
}

function checkStarCollection() {
    if (gameState.doorTransitioning) return;
    
    // Check if player is close to any stars in current universe
    stars.forEach(starData => {
        if (starData.universe !== gameState.currentUniverse) return;
        if (!starData.mesh) return;
        
        const distance = player.position.distanceTo(starData.mesh.position);
        
        if (distance < gameConfig.starCollectionRadius) {
            collectStar(starData);
        }
    });
}

function collectStar(starData) {
    const universeKey = starData.universe;
    
    // Remove star from scene
    scene.remove(starData.mesh);
    
    // Update star as collected
    starData.mesh = null;
    
    // Update game state
    gameState.starsCollected[universeKey]++;
    
    // Update score display
    updateScoreDisplay();
    
    // Play collection sound
    playCollectionSound();
    
    // Check if all stars in universe collected
    checkUniverseCompletion(universeKey);
}

function updateScoreDisplay() {
    let totalCollected = 0;
    let totalStars = 0;
    
    Object.keys(gameState.starsCollected).forEach(universe => {
        totalCollected += gameState.starsCollected[universe];
        totalStars += gameState.totalStars[universe];
    });
    
    scoreDisplay.innerHTML = `Stars: ${totalCollected}/${totalStars}`;
}

function updateUniverseInfo() {
    const currentUniverseData = universeTypes[gameState.currentUniverse];
    universeInfoDisplay.innerHTML = `Current Universe: ${currentUniverseData.name}`;
    
    // Add description
    universeInfoDisplay.innerHTML += `<p>${currentUniverseData.description}</p>`;
    
    // Add star counter for this universe
    const collected = gameState.starsCollected[gameState.currentUniverse];
    const total = gameState.totalStars[gameState.currentUniverse];
    
    if (total > 0) {
        universeInfoDisplay.innerHTML += `<p>Stars in this universe: ${collected}/${total}</p>`;
    }
}

function checkDoorInteraction() {
    if (gameState.doorTransitioning) return;
    
    // Find closest door in current universe
    let closestDoor = null;
    let closestDistance = Infinity;
    
    doors.forEach(door => {
        // Check if door is in current scene
        const doorInCurrentScene = scene.getObjectById(door.mesh.id) !== undefined;
        
        if (doorInCurrentScene) {
            const distance = player.position.distanceTo(door.mesh.position);
            
            if (distance < closestDistance) {
                closestDistance = distance;
                closestDoor = door;
            }
        }
    });
    
    // If close enough to a door, initiate universe transition
    if (closestDoor && closestDistance < gameConfig.doorActivationDistance) {
        initiateUniverseTransition(closestDoor.target);
    }
}

function initiateUniverseTransition(targetUniverse) {
    // Start transition effect
    gameState.doorTransitioning = true;
    gameState.transitionAlpha = 0;
    gameState.transitionTarget = targetUniverse;
    
    // Create transition overlay if it doesn't exist
    if (!document.getElementById('transition-overlay')) {
        const overlay = document.createElement('div');
        overlay.id = 'transition-overlay';
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.backgroundColor = '#000';
        overlay.style.opacity = '0';
        overlay.style.transition = 'opacity 0.5s ease';
        overlay.style.pointerEvents = 'none';
        overlay.style.zIndex = '999';
        gameContainer.appendChild(overlay);
    }
    
    // Play TARDIS sound
    playTARDISSound();
}

function handleUniverseTransition() {
    const overlay = document.getElementById('transition-overlay');
    
    if (gameState.transitionAlpha < 1) {
        // Fade to black
        gameState.transitionAlpha += gameConfig.doorTransitionSpeed;
        if (overlay) {
            overlay.style.opacity = gameState.transitionAlpha;
        }
    } else if (gameState.transitionAlpha >= 1 && gameState.transitionAlpha < 2) {
        // Change universe when fully black
        if (gameState.transitionAlpha === 1) {
            changeUniverse(gameState.transitionTarget);
        }
        gameState.transitionAlpha += gameConfig.doorTransitionSpeed;
    } else {
        // Fade back in
        if (overlay) {
            overlay.style.opacity = 0;
        }
        gameState.doorTransitioning = false;
        gameState.transitionAlpha = 0;
        gameState.transitionTarget = null;
    }
}

function changeUniverse(targetUniverse) {
    // Store previous universe
    gameState.previousUniverse = gameState.currentUniverse;
    
    // Remove player from current universe
    universesData[gameState.currentUniverse].scene.remove(player);
    
    // Update current universe
    gameState.currentUniverse = targetUniverse;
    gameState.universeVisited[targetUniverse] = true;
    
    // Position player near entrance door in new universe
    player.position.set(0, 0, -5);
    
    // Add player to new universe
    universesData[targetUniverse].scene.add(player);
    
    // Update scene reference to new universe
    scene = universesData[targetUniverse].scene;
    
    // Update universe info display
    updateUniverseInfo();
    
    // Unlock corresponding section if it's the first visit
    unlockSection(targetUniverse);
}

function unlockSection(universeKey) {
    if (universeKey === 'hub') return;
    
    const sectionElement = document.getElementById(universeKey);
    if (sectionElement) {
        sectionElement.classList.remove('locked-section');
        
        // Show notification
        showUnlockNotification(universeKey);
    }
}

function showUnlockNotification(sectionName) {
    const notification = document.createElement('div');
    notification.className = 'unlock-notification';
    notification.innerHTML = `<p>Unlocked: ${universeTypes[sectionName].name}</p>`;
    
    gameContainer.appendChild(notification);
    
    // Remove notification after a delay
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => {
            gameContainer.removeChild(notification);
        }, 500);
    }, 3000);
}

function checkUniverseCompletion(universeKey) {
    if (gameState.starsCollected[universeKey] === gameState.totalStars[universeKey]) {
        // Show completion notification
        const notification = document.createElement('div');
        notification.className = 'completion-notification';
        notification.innerHTML = `<p>Universe Complete: ${universeTypes[universeKey].name}</p><p>All stars collected!</p>`;
        
        gameContainer.appendChild(notification);
        
        // Remove notification after a delay
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => {
                gameContainer.removeChild(notification);
            }, 500);
        }, 3000);
        
        // Maybe add some special reward or effect
        createCompletionEffect(universeKey);
    }
}

function createCompletionEffect(universeKey) {
    // Create particle effect or special animation for universe completion
    console.log(`Universe ${universeKey} completed!`);
    // Implementation will be added in Phase 2
}

function playCollectionSound() {
    // Play sound effect when collecting a star
    // Implementation will be added in Phase 3
}

function playTARDISSound() {
    // Play TARDIS sound when transitioning between universes
    // Implementation will be added in Phase 3
}

// Initialize empty universe decoration functions (to be implemented in Phase 2)
function createHubUniverse() {
    const hubScene = universesData.hub.scene;
    
    // Create central console (TARDIS-inspired)
    const consoleGeometry = new THREE.CylinderGeometry(5, 5, 1, 6);
    const consoleMaterial = new THREE.MeshPhongMaterial({
        color: 0x1a237e,
        shininess: 50,
        emissive: 0x3949ab,
        emissiveIntensity: 0.3
    });
    
    const console = new THREE.Mesh(consoleGeometry, consoleMaterial);
    console.position.set(0, 0, 0);
    console.receiveShadow = true;
    hubScene.add(console);
    
    // Add central time rotor
    const rotorGeometry = new THREE.CylinderGeometry(1, 1, 5, 8);
    const rotorMaterial = new THREE.MeshPhongMaterial({
        color: 0x64b5f6,
        transparent: true,
        opacity: 0.7,
        shininess: 90,
        emissive: 0x64b5f6,
        emissiveIntensity: 0.5
    });
    
    const timeRotor = new THREE.Mesh(rotorGeometry, rotorMaterial);
    timeRotor.position.set(0, 3, 0);
    hubScene.add(timeRotor);
    
    // Add glowing light to the time rotor
    const rotorLight = new THREE.PointLight(0x64b5f6, 1, 15);
    rotorLight.position.set(0, 3, 0);
    hubScene.add(rotorLight);
    
    // Create console controls
    for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2;
        const x = Math.cos(angle) * 4;
        const z = Math.sin(angle) * 4;
        
        // Control panel
        const panelGeometry = new THREE.BoxGeometry(2, 0.5, 1);
        const panelMaterial = new THREE.MeshPhongMaterial({
            color: 0x424242,
            shininess: 50
        });
        
        const panel = new THREE.Mesh(panelGeometry, panelMaterial);
        panel.position.set(x, 0.5, z);
        panel.rotation.y = angle;
        hubScene.add(panel);
        
        // Control lever
        const leverGeometry = new THREE.BoxGeometry(0.2, 0.8, 0.2);
        const leverMaterial = new THREE.MeshPhongMaterial({
            color: 0xf44336
        });
        
        const lever = new THREE.Mesh(leverGeometry, leverMaterial);
        lever.position.set(x, 1, z);
        hubScene.add(lever);
    }
    
    // Add circular pattern to the floor around the console
    const circleGeometry = new THREE.RingGeometry(5.5, 6, 32);
    const circleMaterial = new THREE.MeshBasicMaterial({
        color: 0x64b5f6,
        side: THREE.DoubleSide
    });
    
    const circlePattern = new THREE.Mesh(circleGeometry, circleMaterial);
    circlePattern.rotation.x = Math.PI / 2;
    circlePattern.position.y = -0.98;
    hubScene.add(circlePattern);
    
    // Add TARDIS-like roundels to the walls around the area
    const wallRadius = 25;
    for (let i = 0; i < 16; i++) {
        const angle = (i / 16) * Math.PI * 2;
        const wallX = Math.cos(angle) * wallRadius;
        const wallZ = Math.sin(angle) * wallRadius;
        
        // Wall segment
        const wallGeometry = new THREE.BoxGeometry(8, 6, 0.5);
        const wallMaterial = new THREE.MeshPhongMaterial({
            color: 0x1a237e
        });
        
        const wall = new THREE.Mesh(wallGeometry, wallMaterial);
        wall.position.set(wallX, 2, wallZ);
        wall.lookAt(new THREE.Vector3(0, 2, 0));
        hubScene.add(wall);
        
        // Add roundels (the circular indentations on TARDIS walls)
        for (let j = 0; j < 6; j++) {
            const roundelGeometry = new THREE.CircleGeometry(0.5, 16);
            const roundelMaterial = new THREE.MeshPhongMaterial({
                color: 0xffffff,
                emissive: 0x64b5f6,
                emissiveIntensity: 0.2
            });
            
            const roundel = new THREE.Mesh(roundelGeometry, roundelMaterial);
            const rowOffset = j % 2 === 0 ? 0 : 1;
            roundel.position.set(wallX + (j % 3 - 1) * 2, 3 + Math.floor(j / 3) * 2 - 1, wallZ);
            roundel.lookAt(new THREE.Vector3(0, roundel.position.y, 0));
            
            // Move the roundel slightly forward from the wall
            const normal = new THREE.Vector3().subVectors(roundel.position, new THREE.Vector3(0, roundel.position.y, 0)).normalize();
            roundel.position.add(normal.multiplyScalar(-0.3));
            
            hubScene.add(roundel);
        }
    }
    
    // Add animated particles for time vortex effect
    const particleCount = 200;
    const particles = new THREE.BufferGeometry();
    const particleMaterial = new THREE.PointsMaterial({
        color: 0x64b5f6,
        size: 0.2,
        transparent: true,
        opacity: 0.7
    });
    
    const particlePositions = new Float32Array(particleCount * 3);
    const particleSpeeds = [];
    
    for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        const radius = Math.random() * 20 + 7;
        const angle = Math.random() * Math.PI * 2;
        const height = (Math.random() - 0.5) * 10;
        
        particlePositions[i3] = Math.cos(angle) * radius;      // x
        particlePositions[i3 + 1] = height;                   // y
        particlePositions[i3 + 2] = Math.sin(angle) * radius; // z
        
        particleSpeeds.push({
            rotationSpeed: (Math.random() - 0.5) * 0.02,
            floatSpeed: (Math.random() - 0.5) * 0.01
        });
    }
    
    particles.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleSystem = new THREE.Points(particles, particleMaterial);
    hubScene.add(particleSystem);
    
    // Animation function for the hub universe elements
    function animateHub() {
        if (!gameStarted || gameState.currentUniverse !== 'hub') {
            requestAnimationFrame(animateHub);
            return;
        }
        
        // Rotate the time rotor
        timeRotor.rotation.y += 0.01;
        
        // Animate particle system (time vortex effect)
        const positions = particles.getAttribute('position').array;
        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            const speed = particleSpeeds[i];
            
            // Calculate new position
            const x = positions[i3];
            const y = positions[i3 + 1];
            const z = positions[i3 + 2];
            
            // Calculate distance from center
            const dist = Math.sqrt(x*x + z*z);
            
            // Update position with rotation
            const angle = Math.atan2(z, x) + speed.rotationSpeed;
            positions[i3] = Math.cos(angle) * dist;
            positions[i3 + 2] = Math.sin(angle) * dist;
            
            // Add floating motion
            positions[i3 + 1] = y + speed.floatSpeed;
            
            // Reset particles that go too high or too low
            if (positions[i3 + 1] > 15 || positions[i3 + 1] < -5) {
                speed.floatSpeed = -speed.floatSpeed;
            }
        }
        
        particles.getAttribute('position').needsUpdate = true;
        
        requestAnimationFrame(animateHub);
    }
    
    animateHub();
    
    console.log("Hub Universe created");
}

function createExperienceUniverse() {
    const expScene = universesData.experience.scene;
    
    // Create futuristic buildings in a grid layout
    const buildingCount = 20;
    const cityRadius = 50;
    const minHeight = 5;
    const maxHeight = 20;
    
    // Create city grid
    for (let i = 0; i < buildingCount; i++) {
        // Random position within radius but not too close to center (where player starts)
        let x, z;
        do {
            x = (Math.random() * 2 - 1) * cityRadius;
            z = (Math.random() * 2 - 1) * cityRadius;
        } while (Math.sqrt(x*x + z*z) < 15); // Keep buildings away from center
        
        // Building properties
        const width = Math.random() * 3 + 2;
        const depth = Math.random() * 3 + 2;
        const height = Math.random() * (maxHeight - minHeight) + minHeight;
        
        // Create main building
        const buildingGeometry = new THREE.BoxGeometry(width, height, depth);
        const buildingMaterial = new THREE.MeshPhongMaterial({
            color: 0x0277bd,
            emissive: 0x0288d1,
            emissiveIntensity: 0.2,
            shininess: 70
        });
        
        const building = new THREE.Mesh(buildingGeometry, buildingMaterial);
        building.position.set(x, height/2 - 1, z);
        building.castShadow = true;
        building.receiveShadow = true;
        expScene.add(building);
        
        // Add windows to the building
        const windowSize = 0.5;
        const windowSpacing = 1.2;
        const windowEmissive = 0x64ffda;
        
        // Calculate how many windows can fit on each side
        const widthWindows = Math.floor(width / windowSpacing);
        const heightWindows = Math.floor(height / windowSpacing);
        
        // Create windows for two sides of the building
        for (let wx = 0; wx < widthWindows; wx++) {
            for (let wy = 0; wy < heightWindows; wy++) {
                // Skip some windows randomly for variety
                if (Math.random() > 0.7) continue;
                
                // Window material - some windows lit, some dark
                const isLit = Math.random() > 0.3;
                const windowMaterial = new THREE.MeshPhongMaterial({
                    color: 0x90caf9,
                    emissive: isLit ? windowEmissive : 0x000000,
                    emissiveIntensity: 0.5,
                    shininess: 100
                });
                
                // Front windows
                const window1Geometry = new THREE.PlaneGeometry(windowSize, windowSize);
                const window1 = new THREE.Mesh(window1Geometry, windowMaterial);
                const xPos = (wx * windowSpacing) - (width/2 - windowSpacing/2);
                const yPos = (wy * windowSpacing) + (windowSpacing/2);
                window1.position.set(xPos, yPos, depth/2 + 0.01);
                building.add(window1);
                
                // Side windows
                const window2Geometry = new THREE.PlaneGeometry(windowSize, windowSize);
                const window2 = new THREE.Mesh(window2Geometry, windowMaterial);
                window2.position.set(width/2 + 0.01, yPos, (wx * windowSpacing) - (depth/2 - windowSpacing/2));
                window2.rotation.y = Math.PI / 2;
                building.add(window2);
            }
        }
        
        // Add antennas or features to some tall buildings
        if (height > maxHeight * 0.7 && Math.random() > 0.5) {
            const antennaHeight = Math.random() * 3 + 1;
            const antennaGeometry = new THREE.CylinderGeometry(0.1, 0.1, antennaHeight, 8);
            const antennaMaterial = new THREE.MeshPhongMaterial({ color: 0x757575 });
            
            const antenna = new THREE.Mesh(antennaGeometry, antennaMaterial);
            antenna.position.set(0, height/2 + antennaHeight/2, 0);
            building.add(antenna);
            
            // Add blinking light on top
            const lightGeometry = new THREE.SphereGeometry(0.2, 8, 8);
            const lightMaterial = new THREE.MeshBasicMaterial({
                color: 0xff0000,
                emissive: 0xff0000
            });
            
            const light = new THREE.Mesh(lightGeometry, lightMaterial);
            light.position.set(0, antennaHeight + 0.2, 0);
            antenna.add(light);
            
            // Animate blinking
            const blinkSpeed = 0.5 + Math.random();
            setInterval(() => {
                if (!gameStarted || gameState.currentUniverse !== 'experience') return;
                light.visible = !light.visible;
            }, blinkSpeed * 1000);
        }
    }
    
    // Add flying vehicles (hover cars)
    const vehicleCount = 10;
    const vehiclePaths = [];
    
    for (let i = 0; i < vehicleCount; i++) {
        // Create a vehicle
        const vehicleGroup = new THREE.Group();
        
        // Main body
        const bodyGeometry = new THREE.CapsuleGeometry(0.5, 1.5, 4, 8);
        const bodyMaterial = new THREE.MeshPhongMaterial({
            color: Math.random() > 0.5 ? 0xf5f5f5 : 0xe0e0e0,
            shininess: 80
        });
        
        const vehicleBody = new THREE.Mesh(bodyGeometry, bodyMaterial);
        vehicleBody.rotation.z = Math.PI / 2; // Rotate to make it horizontal
        vehicleGroup.add(vehicleBody);
        
        // Lights
        const frontLightGeometry = new THREE.SphereGeometry(0.2, 8, 8);
        const frontLightMaterial = new THREE.MeshBasicMaterial({
            color: 0xffeb3b,
            emissive: 0xffeb3b
        });
        
        const frontLight = new THREE.Mesh(frontLightGeometry, frontLightMaterial);
        frontLight.position.set(0.9, 0, 0);
        frontLight.scale.set(0.5, 0.3, 0.3);
        vehicleGroup.add(frontLight);
        
        const backLightGeometry = new THREE.SphereGeometry(0.2, 8, 8);
        const backLightMaterial = new THREE.MeshBasicMaterial({
            color: 0xff5252,
            emissive: 0xff5252
        });
        
        const backLight = new THREE.Mesh(backLightGeometry, backLightMaterial);
        backLight.position.set(-0.9, 0, 0);
        backLight.scale.set(0.5, 0.3, 0.3);
        vehicleGroup.add(backLight);
        
        // Add glow effect under the vehicle
        const glowGeometry = new THREE.PlaneGeometry(1.5, 0.5);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0x4fc3f7,
            transparent: true,
            opacity: 0.7,
            side: THREE.DoubleSide
        });
        
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        glow.position.set(0, -0.5, 0);
        glow.rotation.x = Math.PI / 2;
        vehicleGroup.add(glow);
        
        // Define a path for the vehicle
        const pathRadius = Math.random() * 30 + 15;
        const pathHeight = Math.random() * 10 + 5;
        const speed = Math.random() * 0.02 + 0.01;
        const startAngle = Math.random() * Math.PI * 2;
        
        vehiclePaths.push({
            vehicle: vehicleGroup,
            radius: pathRadius,
            height: pathHeight,
            speed: speed,
            angle: startAngle
        });
        
        // Position and add to scene
        vehicleGroup.position.set(
            Math.cos(startAngle) * pathRadius,
            pathHeight,
            Math.sin(startAngle) * pathRadius
        );
        
        expScene.add(vehicleGroup);
    }
    
    // Add holographic displays with experience information
    const experiences = [
        "Freelance - Upwork (2017 - Present)",
        "UI programmer - Naama.Online (2024)",
        "Courier Partner - Wolt (2022 - 2024)",
        "Company Owner - Wellness Salas (2020 - 2024)",
        "Sales Development Representative - Vaadin (2023)"
    ];
    
    // Create holographic displays for experiences
    experiences.forEach((exp, index) => {
        // Position in a semi-circle around the center
        const angle = (index / experiences.length) * Math.PI;
        const radius = 12;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        
        // Create floating platform
        const platformGeometry = new THREE.CylinderGeometry(1.5, 1.5, 0.3, 16);
        const platformMaterial = new THREE.MeshPhongMaterial({
            color: 0x0288d1,
            emissive: 0x0277bd,
            emissiveIntensity: 0.3
        });
        
        const platform = new THREE.Mesh(platformGeometry, platformMaterial);
        platform.position.set(x, 0, z);
        expScene.add(platform);
        
        // Add hologram
        const holoHeight = 3;
        const holoGeometry = new THREE.CylinderGeometry(1, 1, holoHeight, 16, 1, true);
        const holoMaterial = new THREE.MeshPhongMaterial({
            color: 0x64b5f6,
            transparent: true,
            opacity: 0.4,
            side: THREE.DoubleSide,
            emissive: 0x64b5f6,
            emissiveIntensity: 0.5
        });
        
        const hologram = new THREE.Mesh(holoGeometry, holoMaterial);
        hologram.position.set(0, holoHeight/2 + 0.15, 0);
        platform.add(hologram);
        
        // Add animated particles inside hologram
        const particleCount = 50;
        const particleGeometry = new THREE.BufferGeometry();
        const particleMaterial = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 0.05,
            transparent: true,
            opacity: 0.7
        });
        
        const positions = new Float32Array(particleCount * 3);
        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            const angle = Math.random() * Math.PI * 2;
            const radius = Math.random() * 0.8;
            const height = Math.random() * holoHeight - holoHeight/2;
            
            positions[i3] = Math.cos(angle) * radius;
            positions[i3 + 1] = height;
            positions[i3 + 2] = Math.sin(angle) * radius;
        }
        
        particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const particles = new THREE.Points(particleGeometry, particleMaterial);
        hologram.add(particles);
        
        // Add experience text label
        const textLabel = document.createElement('div');
        textLabel.className = 'exp-hologram-label';
        textLabel.textContent = exp;
        textLabel.style.position = 'absolute';
        textLabel.style.color = 'white';
        textLabel.style.fontFamily = 'Arial, sans-serif';
        textLabel.style.fontSize = '14px';
        textLabel.style.padding = '5px 10px';
        textLabel.style.backgroundColor = 'rgba(0, 50, 100, 0.7)';
        textLabel.style.borderRadius = '5px';
        textLabel.style.opacity = '0';
        textLabel.style.transition = 'opacity 0.3s ease';
        textLabel.style.pointerEvents = 'none';
        textLabel.style.textAlign = 'center';
        gameContainer.appendChild(textLabel);
        
        // Store reference for positioning update
        platform.userData = { label: textLabel };
    });
    
    // Animation function for the experience universe
    function animateExperienceUniverse() {
        if (!gameStarted || gameState.currentUniverse !== 'experience') {
            requestAnimationFrame(animateExperienceUniverse);
            return;
        }
        
        // Animate flying vehicles
        vehiclePaths.forEach(path => {
            const vehicle = path.vehicle;
            path.angle += path.speed;
            
            // Update position based on circular path
            vehicle.position.x = Math.cos(path.angle) * path.radius;
            vehicle.position.z = Math.sin(path.angle) * path.radius;
            
            // Make vehicle face direction of travel
            vehicle.rotation.y = path.angle + Math.PI / 2;
        });
        
        // Update hologram labels
        expScene.children.forEach(object => {
            if (object.userData && object.userData.label) {
                // Convert 3D position to screen position
                const worldPos = object.position.clone();
                worldPos.y += 3; // Position label above object
                
                const screenPos = worldPos.clone().project(camera);
                const x = (screenPos.x + 1) * window.innerWidth / 2;
                const y = (-screenPos.y + 1) * window.innerHeight / 2;
                
                // Update label position and visibility
                const label = object.userData.label;
                label.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px)`;
                
                // Show label if object is in front of camera and close enough
                const distance = camera.position.distanceTo(object.position);
                label.style.opacity = (screenPos.z > 0 && distance < 30) ? '1' : '0';
            }
        });
        
        requestAnimationFrame(animateExperienceUniverse);
    }
    
    animateExperienceUniverse();
    
    console.log("Experience Universe created");
}

function createCertificationsUniverse() {
    const certScene = universesData.certifications.scene;
    
    // Create mystical library setting
    
    // Main library structure - circular building
    const libraryRadius = 25;
    const libraryHeight = 15;
    
    // Create floor
    const floorGeometry = new THREE.CircleGeometry(libraryRadius, 32);
    const floorMaterial = new THREE.MeshPhongMaterial({
        color: 0x4a148c,
        shininess: 20,
        emissive: 0x6a1b9a,
        emissiveIntensity: 0.1
    });
    
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.99;
    floor.receiveShadow = true;
    certScene.add(floor);
    
    // Create magical pattern on floor
    const patternGeometry = new THREE.RingGeometry(5, libraryRadius - 1, 32, 8);
    const patternMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xce93d8,
        transparent: true,
        opacity: 0.3,
        side: THREE.DoubleSide
    });
    
    const floorPattern = new THREE.Mesh(patternGeometry, patternMaterial);
    floorPattern.rotation.x = -Math.PI / 2;
    floorPattern.position.y = -0.98;
    certScene.add(floorPattern);
    
    // Create arcane symbols on floor
    for (let i = 0; i < 5; i++) {
        const angle = (i / 5) * Math.PI * 2;
        const distance = 15;
        const x = Math.cos(angle) * distance;
        const z = Math.sin(angle) * distance;
        
        const symbolGeometry = new THREE.CircleGeometry(2, 5);
        const symbolMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xce93d8,
            transparent: true,
            opacity: 0.5,
            side: THREE.DoubleSide
        });
        
        const symbol = new THREE.Mesh(symbolGeometry, symbolMaterial);
        symbol.rotation.x = -Math.PI / 2;
        symbol.position.set(x, -0.97, z);
        
        // Add glow effect to symbol
        const glowGeometry = new THREE.CircleGeometry(2.3, 5);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0xce93d8,
            transparent: true,
            opacity: 0.2,
            side: THREE.DoubleSide
        });
        
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        glow.rotation.x = -Math.PI / 2;
        glow.position.y = -0.96;
        symbol.add(glow);
        
        certScene.add(symbol);
    }
    
    // Create ceiling
    const ceilingGeometry = new THREE.CircleGeometry(libraryRadius, 32);
    const ceilingMaterial = new THREE.MeshPhongMaterial({
        color: 0x4a148c,
        emissive: 0x6a1b9a,
        emissiveIntensity: 0.2,
        side: THREE.DoubleSide
    });
    
    const ceiling = new THREE.Mesh(ceilingGeometry, ceilingMaterial);
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.y = libraryHeight;
    ceiling.receiveShadow = true;
    certScene.add(ceiling);
    
    // Create pillars around the perimeter
    const pillarCount = 12;
    for (let i = 0; i < pillarCount; i++) {
        const angle = (i / pillarCount) * Math.PI * 2;
        const x = Math.cos(angle) * (libraryRadius - 2);
        const z = Math.sin(angle) * (libraryRadius - 2);
        
        const pillarGeometry = new THREE.CylinderGeometry(1, 1, libraryHeight, 8);
        const pillarMaterial = new THREE.MeshPhongMaterial({
            color: 0x4a148c,
            shininess: 50
        });
        
        const pillar = new THREE.Mesh(pillarGeometry, pillarMaterial);
        pillar.position.set(x, libraryHeight / 2, z);
        pillar.castShadow = true;
        pillar.receiveShadow = true;
        certScene.add(pillar);
        
        // Add ornate capital to pillar top
        const capitalGeometry = new THREE.CylinderGeometry(1.5, 1, 1, 8);
        const capitalMaterial = new THREE.MeshPhongMaterial({
            color: 0x7b1fa2,
            shininess: 100
        });
        
        const capital = new THREE.Mesh(capitalGeometry, capitalMaterial);
        capital.position.y = libraryHeight / 2;
        pillar.add(capital);
        
        // Add base to pillar
        const baseGeometry = new THREE.CylinderGeometry(1.5, 1.5, 0.5, 8);
        const base = new THREE.Mesh(baseGeometry, capitalMaterial);
        base.position.y = -libraryHeight / 2 - 0.25;
        pillar.add(base);
    }
    
    // Create floating bookshelves between pillars
    for (let i = 0; i < pillarCount; i++) {
        const angle1 = (i / pillarCount) * Math.PI * 2;
        const angle2 = ((i + 1) / pillarCount) * Math.PI * 2;
        
        const x1 = Math.cos(angle1) * (libraryRadius - 3);
        const z1 = Math.sin(angle1) * (libraryRadius - 3);
        const x2 = Math.cos(angle2) * (libraryRadius - 3);
        const z2 = Math.sin(angle2) * (libraryRadius - 3);
        
        // Calculate shelf dimensions
        const distance = Math.sqrt((x2 - x1) ** 2 + (z2 - z1) ** 2);
        const midX = (x1 + x2) / 2;
        const midZ = (z1 + z2) / 2;
        const rotationY = Math.atan2(z2 - z1, x2 - x1);
        
        // Create multiple shelves with different heights
        for (let shelfLevel = 0; shelfLevel < 3; shelfLevel++) {
            const shelfHeight = 2 + shelfLevel * 4;
            
            const shelfGeometry = new THREE.BoxGeometry(distance - 2, 0.5, 2);
            const shelfMaterial = new THREE.MeshPhongMaterial({
                color: 0x4a148c,
                shininess: 50
            });
            
            const shelf = new THREE.Mesh(shelfGeometry, shelfMaterial);
            shelf.position.set(midX, shelfHeight, midZ);
            shelf.rotation.y = rotationY;
            shelf.castShadow = true;
            shelf.receiveShadow = true;
            certScene.add(shelf);
            
            // Add books on each shelf
            const bookCount = Math.floor(distance * 2);
            const bookWidth = (distance - 2) / bookCount;
            
            for (let b = 0; b < bookCount; b++) {
                // Skip some books randomly
                if (Math.random() > 0.8) continue;
                
                const bookHeight = Math.random() * 0.5 + 1;
                const bookDepth = 1.5;
                
                const bookGeometry = new THREE.BoxGeometry(bookWidth * 0.8, bookHeight, bookDepth);
                
                // Random book colors
                const hue = Math.random() * 0.8 + 0.1; // Keep within purple/blue range
                const bookColor = new THREE.Color().setHSL(hue, 0.8, 0.5);
                
                const bookMaterial = new THREE.MeshPhongMaterial({
                    color: bookColor,
                    shininess: 30
                });
                
                const book = new THREE.Mesh(bookGeometry, bookMaterial);
                
                // Position book on shelf
                const bookX = -distance / 2 + 1 + b * bookWidth + bookWidth / 2;
                const bookY = bookHeight / 2 + 0.25;
                book.position.set(bookX, bookY, 0);
                
                // Random rotation for some books
                if (Math.random() > 0.7) {
                    book.rotation.z = (Math.random() - 0.5) * 0.3;
                }
                
                shelf.add(book);
            }
        }
    }
    
    // Add central magical pedestal
    const pedestalGeometry = new THREE.CylinderGeometry(2, 3, 1.5, 8);
    const pedestalMaterial = new THREE.MeshPhongMaterial({
        color: 0x4a148c,
        shininess: 100,
        emissive: 0x6a1b9a,
        emissiveIntensity: 0.3
    });
    
    const pedestal = new THREE.Mesh(pedestalGeometry, pedestalMaterial);
    pedestal.position.set(0, 0.75, 0);
    pedestal.castShadow = true;
    pedestal.receiveShadow = true;
    certScene.add(pedestal);
    
    // Add magical effect to pedestal
    const magicGeometry = new THREE.CylinderGeometry(1.8, 1.8, 0.1, 16);
    const magicMaterial = new THREE.MeshBasicMaterial({
        color: 0xce93d8,
        transparent: true,
        opacity: 0.8
    });
    
    const magicEffect = new THREE.Mesh(magicGeometry, magicMaterial);
    magicEffect.position.y = 0.8;
    pedestal.add(magicEffect);
    
    // Add point light to the pedestal
    const pedestalLight = new THREE.PointLight(0xce93d8, 1, 20);
    pedestalLight.position.set(0, 3, 0);
    certScene.add(pedestalLight);
    
    // Certification data from portfolio
    const certifications = [
        {
            title: "Foundations: Data, Data, Everywhere",
            issuer: "Google",
            date: "2023"
        },
        {
            title: "Building AI Applications With Haystack",
            issuer: "deepset",
            date: "2023"
        },
        {
            title: "Building and Evaluating Advanced RAG",
            issuer: "deepset",
            date: "2023"
        },
        {
            title: "Ingles Basico",
            issuer: "",
            date: "2022"
        }
    ];
    
    // Create floating certification displays
    const certRadius = 10;
    certifications.forEach((cert, index) => {
        const angle = (index / certifications.length) * Math.PI * 2;
        const x = Math.cos(angle) * certRadius;
        const z = Math.sin(angle) * certRadius;
        
        // Create floating certificate frame
        const frameGroup = new THREE.Group();
        frameGroup.position.set(x, 5, z);
        frameGroup.lookAt(new THREE.Vector3(0, 5, 0));
        certScene.add(frameGroup);
        
        // Certificate frame
        const frameGeometry = new THREE.BoxGeometry(4, 5, 0.2);
        const frameMaterial = new THREE.MeshPhongMaterial({
            color: 0xce93d8,
            shininess: 100,
            emissive: 0xce93d8,
            emissiveIntensity: 0.2
        });
        
        const frame = new THREE.Mesh(frameGeometry, frameMaterial);
        frameGroup.add(frame);
        
        // Certificate content (lighter color)
        const contentGeometry = new THREE.PlaneGeometry(3.6, 4.6);
        const contentMaterial = new THREE.MeshBasicMaterial({
            color: 0xf3e5f5,
            side: THREE.DoubleSide
        });
        
        const content = new THREE.Mesh(contentGeometry, contentMaterial);
        content.position.z = 0.11;
        frameGroup.add(content);
        
        // Add text label
        const textLabel = document.createElement('div');
        textLabel.className = 'cert-label';
        textLabel.innerHTML = `<strong>${cert.title}</strong><br>${cert.issuer} ${cert.date}`;
        textLabel.style.position = 'absolute';
        textLabel.style.color = 'white';
        textLabel.style.fontFamily = 'Arial, sans-serif';
        textLabel.style.fontSize = '14px';
        textLabel.style.padding = '10px';
        textLabel.style.width = '200px';
        textLabel.style.backgroundColor = 'rgba(74, 20, 140, 0.7)';
        textLabel.style.borderRadius = '5px';
        textLabel.style.opacity = '0';
        textLabel.style.transition = 'opacity 0.3s ease';
        textLabel.style.pointerEvents = 'none';
        textLabel.style.textAlign = 'center';
        gameContainer.appendChild(textLabel);
        
        // Store reference to label for positioning update
        frameGroup.userData = { label: textLabel };
        
        // Add hover effect
        frameGroup.userData.angle = angle;
        frameGroup.userData.baseY = 5;
        frameGroup.userData.floatSpeed = 0.0005 + Math.random() * 0.0005;
        frameGroup.userData.floatOffset = Math.random() * Math.PI * 2;
        
        // Add glow effect
        const glowGeometry = new THREE.BoxGeometry(4.2, 5.2, 0.1);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0xce93d8,
            transparent: true,
            opacity: 0.5
        });
        
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        glow.position.z = -0.1;
        frameGroup.add(glow);
    });
    
    // Create floating crystal light sources
    for (let i = 0; i < 5; i++) {
        const angle = (i / 5) * Math.PI * 2;
        const radius = 15;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        
        // Crystal geometry
        const crystalGeometry = new THREE.OctahedronGeometry(0.8, 0);
        const crystalMaterial = new THREE.MeshPhongMaterial({
            color: 0xce93d8,
            transparent: true,
            opacity: 0.8,
            shininess: 100,
            emissive: 0xce93d8,
            emissiveIntensity: 0.5
        });
        
        const crystal = new THREE.Mesh(crystalGeometry, crystalMaterial);
        crystal.position.set(x, 10, z);
        crystal.rotation.x = Math.random() * Math.PI;
        crystal.rotation.y = Math.random() * Math.PI;
        certScene.add(crystal);
        
        // Add light source
        const crystalLight = new THREE.PointLight(0xce93d8, 0.8, 15);
        crystal.add(crystalLight);
        
        // Store animation parameters
        crystal.userData = {
            rotationSpeed: (Math.random() - 0.5) * 0.01,
            floatSpeed: 0.0005 + Math.random() * 0.0005,
            floatHeight: 10,
            floatOffset: Math.random() * Math.PI * 2
        };
    }
    
    // Add floating particle effects
    const particleCount = 300;
    const particleGeometry = new THREE.BufferGeometry();
    const particleMaterial = new THREE.PointsMaterial({
        color: 0xce93d8,
        size: 0.1,
        transparent: true,
        opacity: 0.7,
        blending: THREE.AdditiveBlending
    });
    
    const positions = new Float32Array(particleCount * 3);
    const particleData = [];
    
    for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        const radius = Math.random() * libraryRadius;
        const angle = Math.random() * Math.PI * 2;
        const height = Math.random() * libraryHeight;
        
        positions[i3] = Math.cos(angle) * radius;      // x
        positions[i3 + 1] = height;                    // y
        positions[i3 + 2] = Math.sin(angle) * radius;  // z
        
        particleData.push({
            velocity: new THREE.Vector3(
                (Math.random() - 0.5) * 0.01,
                (Math.random() - 0.5) * 0.01,
                (Math.random() - 0.5) * 0.01
            ),
            radius: radius,
            angle: angle,
            height: height
        });
    }
    
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particles = new THREE.Points(particleGeometry, particleMaterial);
    certScene.add(particles);
    
    // Animation function for certifications universe
    function animateCertificationsUniverse() {
        if (!gameStarted || gameState.currentUniverse !== 'certifications') {
            requestAnimationFrame(animateCertificationsUniverse);
            return;
        }
        
        // Animate pedestal light
        pedestalLight.intensity = 1 + 0.2 * Math.sin(Date.now() * 0.003);
        magicEffect.material.opacity = 0.6 + 0.3 * Math.sin(Date.now() * 0.002);
        
        // Animate floating certificates
        certScene.children.forEach(object => {
            if (object.userData && object.userData.angle !== undefined) {
                // Float up and down
                object.position.y = object.userData.baseY + 
                    0.5 * Math.sin(Date.now() * object.userData.floatSpeed + object.userData.floatOffset);
                
                // Slow rotation
                object.rotation.y = Math.atan2(
                    -Math.cos(object.userData.angle), 
                    -Math.sin(object.userData.angle)
                );
                
                // Update label position if exists
                if (object.userData.label) {
                    const label = object.userData.label;
                    
                    // Convert 3D position to 2D screen position
                    const position = new THREE.Vector3();
                    position.setFromMatrixPosition(object.matrixWorld);
                    
                    const vectorPos = position.clone();
                    vectorPos.project(camera);
                    
                    const x = (vectorPos.x * 0.5 + 0.5) * window.innerWidth;
                    const y = (-vectorPos.y * 0.5 + 0.5) * window.innerHeight;
                    
                    // Update label position
                    label.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px)`;
                    
                    // Show/hide label based on distance and angle to camera
                    const cameraDirection = new THREE.Vector3();
                    camera.getWorldDirection(cameraDirection);
                    
                    const objectDirection = position.clone().sub(camera.position).normalize();
                    const dot = cameraDirection.dot(objectDirection);
                    
                    const distance = camera.position.distanceTo(position);
                    if (dot > 0.7 && distance < 15) {
                        label.style.opacity = '1';
                    } else {
                        label.style.opacity = '0';
                    }
                }
            }
            
            // Animate floating crystals
            if (object.userData && object.userData.floatHeight !== undefined) {
                // Float up and down
                object.position.y = object.userData.floatHeight + 
                    0.5 * Math.sin(Date.now() * object.userData.floatSpeed + object.userData.floatOffset);
                
                // Slow rotation
                object.rotation.x += object.userData.rotationSpeed;
                object.rotation.y += object.userData.rotationSpeed * 0.7;
            }
        });
        
        // Animate magical particles
        const positions = particles.geometry.getAttribute('position').array;
        
        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            const data = particleData[i];
            
            // Update position with velocity
            positions[i3] += data.velocity.x;
            positions[i3 + 1] += data.velocity.y;
            positions[i3 + 2] += data.velocity.z;
            
            // Keep particles within library bounds
            const x = positions[i3];
            const y = positions[i3 + 1];
            const z = positions[i3 + 2];
            
            const distanceFromCenter = Math.sqrt(x*x + z*z);
            
            if (distanceFromCenter > libraryRadius || y < 0 || y > libraryHeight) {
                // Reset particle to a new position in the library
                const newRadius = Math.random() * libraryRadius * 0.8;
                const newAngle = Math.random() * Math.PI * 2;
                const newHeight = Math.random() * libraryHeight;
                
                positions[i3] = Math.cos(newAngle) * newRadius;      // x
                positions[i3 + 1] = newHeight;                        // y
                positions[i3 + 2] = Math.sin(newAngle) * newRadius;   // z
                
                // Randomize velocity
                data.velocity.set(
                    (Math.random() - 0.5) * 0.01,
                    (Math.random() - 0.5) * 0.01,
                    (Math.random() - 0.5) * 0.01
                );
            }
        }
        
        particles.getAttribute('position').needsUpdate = true;
        
        requestAnimationFrame(animateCertificationsUniverse);
    }
    
    animateCertificationsUniverse();
    
    console.log("Certifications Universe created");
}

function createProjectsUniverse() {
    const projectsScene = universesData.projects.scene;
    
    // Set up workshop environment
    const workshopRadius = 30;
    const workshopHeight = 8;
    
    // Create central workshop structure
    const workshopFloorGeometry = new THREE.CircleGeometry(workshopRadius, 32);
    const workshopFloorMaterial = new THREE.MeshPhongMaterial({
        color: 0x2e7d32,
        shininess: 30,
        emissive: 0x1b5e20,
        emissiveIntensity: 0.1
    });
    
    const workshopFloor = new THREE.Mesh(workshopFloorGeometry, workshopFloorMaterial);
    workshopFloor.rotation.x = -Math.PI / 2;
    workshopFloor.position.y = -0.99;
    workshopFloor.receiveShadow = true;
    projectsScene.add(workshopFloor);
    
    // Add grid pattern to the workshop floor
    const gridSize = workshopRadius * 2;
    const gridDivisions = 20;
    const gridHelper = new THREE.GridHelper(gridSize, gridDivisions, 0x388e3c, 0x1b5e20);
    gridHelper.position.y = -0.98;
    projectsScene.add(gridHelper);
    
    // Create circular wall around the workshop
    const wallSegments = 16;
    for (let i = 0; i < wallSegments; i++) {
        const angle = (i / wallSegments) * Math.PI * 2;
        const nextAngle = ((i + 1) / wallSegments) * Math.PI * 2;
        
        const x1 = Math.cos(angle) * workshopRadius;
        const z1 = Math.sin(angle) * workshopRadius;
        const x2 = Math.cos(nextAngle) * workshopRadius;
        const z2 = Math.sin(nextAngle) * workshopRadius;
        
        // Calculate wall dimensions
        const wallLength = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(z2 - z1, 2));
        const wallHeight = workshopHeight;
        const wallThickness = 0.5;
        
        // Create wall segment
        const wallGeometry = new THREE.BoxGeometry(wallLength, wallHeight, wallThickness);
        const wallMaterial = new THREE.MeshPhongMaterial({
            color: 0x2e7d32,
            shininess: 20
        });
        
        const wall = new THREE.Mesh(wallGeometry, wallMaterial);
        
        // Position wall segment
        const midX = (x1 + x2) / 2;
        const midZ = (z1 + z2) / 2;
        wall.position.set(midX, wallHeight / 2, midZ);
        
        // Rotate wall to face center
        wall.lookAt(new THREE.Vector3(0, wall.position.y, 0));
            const windowWidth = wallLength * 0.6;
            const windowHeight = wallHeight * 0.4;
            const windowGeometry = new THREE.PlaneGeometry(windowWidth, windowHeight);
            const windowMaterial = new THREE.MeshPhongMaterial({
                color: 0x81c784,
                transparent: true,
                opacity: 0.7,
                emissive: 0x81c784,
                emissiveIntensity: 0.3,
                side: THREE.DoubleSide
            });
            
            const windowMesh = new THREE.Mesh(windowGeometry, windowMaterial);
            windowMesh.position.set(0, 0, -0.1);
            wall.add(windowMesh);
        }
        
        projectsScene.add(wall);
    }
    
    // Create ceiling/roof
    const ceilingGeometry = new THREE.CircleGeometry(workshopRadius, 32);
    const ceilingMaterial = new THREE.MeshPhongMaterial({
        color: 0x2e7d32,
        shininess: 30,
        emissive: 0x1b5e20,
        emissiveIntensity: 0.1,
        transparent: true,
        opacity: 0.9,
        side: THREE.DoubleSide
    });
    
    const ceiling = new THREE.Mesh(ceilingGeometry, ceilingMaterial);
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.y = workshopHeight;
    projectsScene.add(ceiling);
    
    // Add central workbench
    const workbenchGeometry = new THREE.BoxGeometry(8, 1, 4);
    const workbenchMaterial = new THREE.MeshPhongMaterial({
        color: 0x795548,  // Brown
        shininess: 30
    });
    
    const workbench = new THREE.Mesh(workbenchGeometry, workbenchMaterial);
    workbench.position.set(0, 0.5, 0);
    workbench.castShadow = true;
    workbench.receiveShadow = true;
    projectsScene.add(workbench);
    
    // Add tools to workbench
    const tools = [
        { name: "hammer", position: new THREE.Vector3(2, 1.1, 0.5), color: 0xbdbdbd },
        { name: "screwdriver", position: new THREE.Vector3(1, 1.1, -0.5), color: 0xf44336 },
        { name: "wrench", position: new THREE.Vector3(3, 1.1, 0), color: 0x9e9e9e }
    ];
    
    tools.forEach(tool => {
        let toolMesh;
        
        if (tool.name === "hammer") {
            // Create hammer
            const handleGeometry = new THREE.CylinderGeometry(0.1, 0.1, 1, 8);
            const handleMaterial = new THREE.MeshPhongMaterial({
                color: 0x795548,
                shininess: 30
            });
            
            const handle = new THREE.Mesh(handleGeometry, handleMaterial);
            handle.rotation.x = Math.PI / 2;
            
            const headGeometry = new THREE.BoxGeometry(0.6, 0.3, 0.2);
            const headMaterial = new THREE.MeshPhongMaterial({
                color: tool.color,
                shininess: 50
            });
            
            const head = new THREE.Mesh(headGeometry, headMaterial);
            head.position.set(0, 0, 0.6);
            
            toolMesh = new THREE.Group();
            toolMesh.add(handle);
            toolMesh.add(head);
        } else if (tool.name === "screwdriver") {
            // Create screwdriver
            const handleGeometry = new THREE.CylinderGeometry(0.15, 0.15, 0.6, 8);
            const handleMaterial = new THREE.MeshPhongMaterial({
                color: tool.color,
                shininess: 30
            });
            
            const handle = new THREE.Mesh(handleGeometry, handleMaterial);
            
            const shaftGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.8, 8);
            const shaftMaterial = new THREE.MeshPhongMaterial({
                color: 0xbdbdbd,
                metalness: 0.7,
                roughness: 0.3
            });
            
            const shaft = new THREE.Mesh(shaftGeometry, shaftMaterial);
            shaft.position.y = 0.7;
            
            toolMesh = new THREE.Group();
            toolMesh.add(handle);
            toolMesh.add(shaft);
        } else if (tool.name === "wrench") {
            // Create wrench
            const wrenchGeometry = new THREE.BoxGeometry(0.9, 0.1, 0.2);
            const wrenchMaterial = new THREE.MeshPhongMaterial({
                color: tool.color,
                metalness: 0.7,
                roughness: 0.3
            });
            
            const wrenchBody = new THREE.Mesh(wrenchGeometry, wrenchMaterial);
            
            const headGeometry1 = new THREE.CylinderGeometry(0.2, 0.2, 0.1, 8);
            const head1 = new THREE.Mesh(headGeometry1, wrenchMaterial);
            head1.position.set(0.4, 0, 0);
            head1.rotation.x = Math.PI / 2;
            
            const headGeometry2 = new THREE.CylinderGeometry(0.2, 0.2, 0.1, 8);
            const head2 = new THREE.Mesh(headGeometry2, wrenchMaterial);
            head2.position.set(-0.4, 0, 0);
            head2.rotation.x = Math.PI / 2;
            
            toolMesh = new THREE.Group();
            toolMesh.add(wrenchBody);
            toolMesh.add(head1);
            toolMesh.add(head2);
            toolMesh.rotation.y = Math.PI / 4;
        }
        
        if (toolMesh) {
            toolMesh.position.copy(tool.position);
            toolMesh.castShadow = true;
            projectsScene.add(toolMesh);
        }
    });
    
    // Add project displays around the workshop
    // Get project data from the portfolio
    const projects = [
        {
            title: "Abogado2.com",
            description: "A comprehensive legal services website for a law firm",
            technologies: ["HTML5", "CSS3", "JavaScript", "PHP"],
            image: "abogado2.jpg"
        }
    ];
    
    // Create project displays in a circle around the center
    const projectRadius = 15; // Distance from center
    projects.forEach((project, index) => {
        const angle = (index / projects.length) * Math.PI * 2;
        const x = Math.cos(angle) * projectRadius;
        const z = Math.sin(angle) * projectRadius;
        
        // Create project display booth
        const boothGroup = new THREE.Group();
        boothGroup.position.set(x, 0, z);
        boothGroup.lookAt(new THREE.Vector3(0, 0, 0));
        projectsScene.add(boothGroup);
        
        // Create display stand
        const standGeometry = new THREE.BoxGeometry(4, 1, 2);
        const standMaterial = new THREE.MeshPhongMaterial({
            color: 0x546e7a,
            shininess: 50
        });
        
        const stand = new THREE.Mesh(standGeometry, standMaterial);
        stand.position.y = 0.5;
        stand.castShadow = true;
        stand.receiveShadow = true;
        boothGroup.add(stand);
        
        // Create holographic display
        const displayGeometry = new THREE.PlaneGeometry(3.5, 2.5);
        const displayMaterial = new THREE.MeshPhongMaterial({
            color: 0xa5d6a7,
            transparent: true,
            opacity: 0.7,
            emissive: 0xa5d6a7,
            emissiveIntensity: 0.3,
            side: THREE.DoubleSide
        });
        
        const display = new THREE.Mesh(displayGeometry, displayMaterial);
        display.position.set(0, 2.5, 0);
        boothGroup.add(display);
        
        // Add project title above display
        const titleLabel = document.createElement('div');
        titleLabel.className = 'project-label';
        titleLabel.textContent = project.title;
        titleLabel.style.position = 'absolute';
        titleLabel.style.color = 'white';
        titleLabel.style.fontFamily = 'Arial, sans-serif';
        titleLabel.style.fontWeight = 'bold';
        titleLabel.style.fontSize = '16px';
        titleLabel.style.padding = '8px 12px';
        titleLabel.style.backgroundColor = 'rgba(46, 125, 50, 0.8)';
        titleLabel.style.borderRadius = '5px';
        titleLabel.style.opacity = '0';
        titleLabel.style.transition = 'opacity 0.3s ease';
        titleLabel.style.pointerEvents = 'none';
        titleLabel.style.textAlign = 'center';
        gameContainer.appendChild(titleLabel);
        
        // Add project description beneath title
        const descLabel = document.createElement('div');
        descLabel.className = 'project-desc';
        descLabel.innerHTML = `
            <p>${project.description}</p>
            <p>Technologies: ${project.technologies.join(', ')}</p>
        `;
        descLabel.style.position = 'absolute';
        descLabel.style.color = 'white';
        descLabel.style.fontFamily = 'Arial, sans-serif';
        descLabel.style.fontSize = '14px';
        descLabel.style.padding = '8px 12px';
        descLabel.style.backgroundColor = 'rgba(46, 125, 50, 0.7)';
        descLabel.style.borderRadius = '5px';
        descLabel.style.opacity = '0';
        descLabel.style.transition = 'opacity 0.3s ease';
        descLabel.style.pointerEvents = 'none';
        descLabel.style.textAlign = 'left';
        descLabel.style.maxWidth = '250px';
        gameContainer.appendChild(descLabel);
        
        // Store labels for positioning update
        boothGroup.userData = {
            titleLabel: titleLabel,
            descLabel: descLabel
        };
        
        // Add holographic particles inside display
        const particleCount = 100;
        const particleGeometry = new THREE.BufferGeometry();
        const particleMaterial = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 0.05,
            transparent: true,
            opacity: 0.7
        });
        
        const positions = new Float32Array(particleCount * 3);
        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            positions[i3] = (Math.random() - 0.5) * 3;       // x
            positions[i3 + 1] = (Math.random() - 0.5) * 2;   // y
            positions[i3 + 2] = (Math.random() - 0.5) * 0.2; // z
        }
        
        particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const particles = new THREE.Points(particleGeometry, particleMaterial);
        display.add(particles);
        
        // Add floating project model
        const modelGeometry = new THREE.BoxGeometry(1, 1, 1);
        const modelMaterial = new THREE.MeshPhongMaterial({
            color: 0xa5d6a7,
            transparent: true,
            opacity: 0.9,
            wireframe: true
        });
        
        const projectModel = new THREE.Mesh(modelGeometry, modelMaterial);
        projectModel.position.set(0, 2.5, 0.5);
        projectModel.scale.set(1.5, 1.5, 0.2);
        boothGroup.add(projectModel);
        
        // Store animation parameters for this model
        projectModel.userData = {
            rotationSpeed: 0.01,
            pulseSpeed: 0.002,
            pulseOffset: Math.random() * Math.PI * 2
        };
    });
    
    // Add tech tools and gadgets around the workshop
    const gadgetPositions = [
        { pos: new THREE.Vector3(-8, 1, -5), rotation: Math.PI / 4 },
        { pos: new THREE.Vector3(7, 1, 6), rotation: -Math.PI / 3 },
        { pos: new THREE.Vector3(-4, 1, 8), rotation: Math.PI }
    ];
    
    gadgetPositions.forEach((gadgetData, index) => {
        const gadget = createRandomGadget(index);
        gadget.position.copy(gadgetData.pos);
        gadget.rotation.y = gadgetData.rotation;
        projectsScene.add(gadget);
    });
    
    // Add floating code particles throughout the scene
    const codeParticleCount = 500;
    const codeParticleGeometry = new THREE.BufferGeometry();
    const codeParticleMaterial = new THREE.PointsMaterial({
        color: 0xa5d6a7,
        size: 0.1,
        transparent: true,
        opacity: 0.5
    });
    
    const codePositions = new Float32Array(codeParticleCount * 3);
    const codeParticleData = [];
    
    for (let i = 0; i < codeParticleCount; i++) {
        const i3 = i * 3;
        const radius = Math.random() * workshopRadius * 0.9;
        const angle = Math.random() * Math.PI * 2;
        const height = Math.random() * workshopHeight;
        
        codePositions[i3] = Math.cos(angle) * radius;      // x
        codePositions[i3 + 1] = height;                    // y
        codePositions[i3 + 2] = Math.sin(angle) * radius;  // z
        
        codeParticleData.push({
            velocity: new THREE.Vector3(
                (Math.random() - 0.5) * 0.01,
                (Math.random() - 0.5) * 0.008,
                (Math.random() - 0.5) * 0.01
            ),
            lifespan: Math.random() * 100 + 100,
            age: Math.floor(Math.random() * 200)
        });
    }
    
    codeParticleGeometry.setAttribute('position', new THREE.BufferAttribute(codePositions, 3));
    const codeParticles = new THREE.Points(codeParticleGeometry, codeParticleMaterial);
    projectsScene.add(codeParticles);
    
    // Add ambient lighting to the scene
    const ambientLight = new THREE.AmbientLight(0xa5d6a7, 0.2);
    projectsScene.add(ambientLight);
    
    // Add spotlights over each project display
    projects.forEach((project, index) => {
        const angle = (index / projects.length) * Math.PI * 2;
        const x = Math.cos(angle) * projectRadius;
        const z = Math.sin(angle) * projectRadius;
        
        const spotlight = new THREE.SpotLight(0xa5d6a7, 1, 15, Math.PI / 8, 0.5, 1);
        spotlight.position.set(x, workshopHeight - 1, z);
        spotlight.target.position.set(x, 0, z);
        spotlight.castShadow = true;
        
        projectsScene.add(spotlight);
        projectsScene.add(spotlight.target);
    });
    
    // Helper function to create random tech gadgets
    function createRandomGadget(type) {
        const gadgetGroup = new THREE.Group();
        
        switch (type % 3) {
            case 0: // Computer terminal
                const terminalBaseGeometry = new THREE.BoxGeometry(2, 0.2, 1.2);
                const terminalBaseMaterial = new THREE.MeshPhongMaterial({
                    color: 0x616161,
                    shininess: 30
                });
                const terminalBase = new THREE.Mesh(terminalBaseGeometry, terminalBaseMaterial);
                
                const screenGeometry = new THREE.BoxGeometry(2, 1.5, 0.1);
                const screenMaterial = new THREE.MeshPhongMaterial({
                    color: 0x212121,
                    emissive: 0x81c784,
                    emissiveIntensity: 0.5
                });
                const screen = new THREE.Mesh(screenGeometry, screenMaterial);
                screen.position.set(0, 0.85, -0.5);
                
                gadgetGroup.add(terminalBase);
                gadgetGroup.add(screen);
                break;
                
            case 1: // 3D printer
                const printerBaseGeometry = new THREE.BoxGeometry(1.5, 0.3, 1.5);
                const printerBaseMaterial = new THREE.MeshPhongMaterial({
                    color: 0x424242,
                    shininess: 30
                });
                const printerBase = new THREE.Mesh(printerBaseGeometry, printerBaseMaterial);
                
                const printerFrameGeometry = new THREE.BoxGeometry(1.3, 1.2, 1.3);
                const printerFrameMaterial = new THREE.MeshPhongMaterial({
                    color: 0x616161,
                    shininess: 30,
                    transparent: true,
                    opacity: 0.7
                });
                const printerFrame = new THREE.Mesh(printerFrameGeometry, printerFrameMaterial);
                printerFrame.position.y = 0.75;
                
                // Add printing head
                const printHeadGeometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
                const printHeadMaterial = new THREE.MeshPhongMaterial({
                    color: 0xf44336,
                    emissive: 0xf44336,
                    emissiveIntensity: 0.3
                });
                const printHead = new THREE.Mesh(printHeadGeometry, printHeadMaterial);
                printHead.position.y = 1;
                
                gadgetGroup.add(printerBase);
                gadgetGroup.add(printerFrame);
                gadgetGroup.add(printHead);
                break;
                
            case 2: // Robot arm
                const baseGeometry = new THREE.CylinderGeometry(0.5, 0.5, 0.3, 16);
                const baseMaterial = new THREE.MeshPhongMaterial({
                    color: 0x616161,
                    shininess: 30
                });
                const base = new THREE.Mesh(baseGeometry, baseMaterial);
                
                const armLowerGeometry = new THREE.BoxGeometry(0.2, 1, 0.2);
                const armMaterial = new THREE.MeshPhongMaterial({
                    color: 0x9e9e9e,
                    metalness: 0.7,
                    roughness: 0.3
                });
                const armLower = new THREE.Mesh(armLowerGeometry, armMaterial);
                armLower.position.set(0, 0.65, 0);
                
                const jointGeometry = new THREE.SphereGeometry(0.2, 16, 16);
                const jointMaterial = new THREE.MeshPhongMaterial({
                    color: 0x616161,
                    shininess: 50
                });
                const joint = new THREE.Mesh(jointGeometry, jointMaterial);
                joint.position.set(0, 1.3, 0);
                
                const armUpperGeometry = new THREE.BoxGeometry(0.2, 0.8, 0.2);
                const armUpper = new THREE.Mesh(armUpperGeometry, armMaterial);
                armUpper.position.set(0, 0.4, 0.4);
                armUpper.rotation.x = Math.PI / 4;
                joint.add(armUpper);
                
                const clawGeometry = new THREE.ConeGeometry(0.2, 0.4, 8);
                const clawMaterial = new THREE.MeshPhongMaterial({
                    color: 0xf44336,
                    shininess: 50
                });
                const claw = new THREE.Mesh(clawGeometry, clawMaterial);
                claw.position.set(0, 0.6, 0.2);
                claw.rotation.x = -Math.PI / 4;
                armUpper.add(claw);
                
                gadgetGroup.add(base);
                gadgetGroup.add(armLower);
                gadgetGroup.add(joint);
                break;
        }
        
        return gadgetGroup;
    }
    
    // Animation function for projects universe
    function animateProjectsUniverse() {
        if (!gameStarted || gameState.currentUniverse !== 'projects') {
            requestAnimationFrame(animateProjectsUniverse);
            return;
        }
        
        // Animate project displays
        projectsScene.children.forEach(object => {
            // Rotate project models
            if (object.userData && object.userData.rotationSpeed !== undefined) {
                object.rotation.y += object.userData.rotationSpeed;
                
                // Pulse effect
                if (object.userData.pulseSpeed !== undefined) {
                    const scale = 1 + 0.1 * Math.sin(Date.now() * object.userData.pulseSpeed + object.userData.pulseOffset);
                    object.scale.set(1.5 * scale, 1.5 * scale, 0.2);
                }
            }
            
            // Update project labels
            if (object.userData && object.userData.titleLabel) {
                const titleLabel = object.userData.titleLabel;
                const descLabel = object.userData.descLabel;
                
                // Convert 3D position to 2D screen position
                const position = new THREE.Vector3();
                position.setFromMatrixPosition(object.matrixWorld);
                position.y += 4; // Position above the display
                
                const vectorPos = position.clone();
                vectorPos.project(camera);
                
                const x = (vectorPos.x * 0.5 + 0.5) * window.innerWidth;
                const y = (-vectorPos.y * 0.5 + 0.5) * window.innerHeight;
                
                // Update label positions
                titleLabel.style.transform = `translate(-50%, -120%) translate(${x}px, ${y}px)`;
                descLabel.style.transform = `translate(-50%, 0%) translate(${x}px, ${y}px)`;
                
                // Show/hide labels based on distance and camera direction
                const cameraDirection = new THREE.Vector3();
                camera.getWorldDirection(cameraDirection);
                
                const objectDirection = position.clone().sub(camera.position).normalize();
                const dot = cameraDirection.dot(objectDirection);
                
                const distance = camera.position.distanceTo(position);
                if (dot > 0.7 && distance < 20) {
                    titleLabel.style.opacity = '1';
                    descLabel.style.opacity = '1';
                } else {
                    titleLabel.style.opacity = '0';
                    descLabel.style.opacity = '0';
                }
            }
        });
        
        // Animate code particles
        const positions = codeParticles.geometry.getAttribute('position').array;
        
        for (let i = 0; i < codeParticleCount; i++) {
            const i3 = i * 3;
            const data = codeParticleData[i];
            
            // Update position based on velocity
            positions[i3] += data.velocity.x;
            positions[i3 + 1] += data.velocity.y;
            positions[i3 + 2] += data.velocity.z;
            
            // Update age
            data.age++;
            
            // Reset particle if it's too old or out of bounds
            if (data.age > data.lifespan || 
                Math.abs(positions[i3]) > workshopRadius || 
                positions[i3 + 1] < 0 || 
                positions[i3 + 1] > workshopHeight || 
                Math.abs(positions[i3 + 2]) > workshopRadius) {
                
                // Reset position
                const radius = Math.random() * workshopRadius * 0.9;
                const angle = Math.random() * Math.PI * 2;
                const height = Math.random() * workshopHeight;
                
                positions[i3] = Math.cos(angle) * radius;
                positions[i3 + 1] = height;
                positions[i3 + 2] = Math.sin(angle) * radius;
                
                // Reset age
                data.age = 0;
                
                // New lifespan
                data.lifespan = Math.random() * 100 + 100;
                
                // New velocity
                data.velocity.set(
                    (Math.random() - 0.5) * 0.01,
                    (Math.random() - 0.5) * 0.008,
                    (Math.random() - 0.5) * 0.01
                );
            }
        }
        
        codeParticles.geometry.getAttribute('position').needsUpdate = true;
        
        requestAnimationFrame(animateProjectsUniverse);
    }
    
    animateProjectsUniverse();
    
    console.log("Projects Universe created");
}

function createSkillsUniverse() {
    const skillsScene = universesData.skills.scene;
    
    // Create a starry space background
    const starsCount = 2000;
    const starsGeometry = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starsCount * 3);
    const starSizes = new Float32Array(starsCount);
    
    // Create stars with random positions
    for (let i = 0; i < starsCount; i++) {
        const i3 = i * 3;
        // Position stars in a large sphere around the scene
        const radius = 100 + Math.random() * 900; // Stars between 100 and 1000 units away
        const theta = Math.random() * Math.PI * 2; // Random angle around y-axis
        const phi = Math.acos((Math.random() * 2) - 1); // Random angle from y-axis
        
        starPositions[i3] = radius * Math.sin(phi) * Math.cos(theta);
        starPositions[i3 + 1] = radius * Math.cos(phi);
        starPositions[i3 + 2] = radius * Math.sin(phi) * Math.sin(theta);
        
        // Random star sizes
        starSizes[i] = Math.random() * 2 + 0.5;
    }
    
    starsGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starsGeometry.setAttribute('size', new THREE.BufferAttribute(starSizes, 1));
    
    // Create shader material for stars
    const starsMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 2,
        blending: THREE.AdditiveBlending,
        transparent: true,
        sizeAttenuation: true
    });
    
    const starField = new THREE.Points(starsGeometry, starsMaterial);
    skillsScene.add(starField);
    
    // Create nebula effects (colorful clouds in space)
    const nebulaColors = [
        0x3a86ff, // Blue
        0x8338ec, // Purple
        0xff006e, // Pink
        0xfb5607  // Orange
    ];
    
    // Create several nebulae with different colors
    for (let i = 0; i < 4; i++) {
        createNebula(
            Math.random() * 60 - 30,
            Math.random() * 40 - 20,
            Math.random() * 60 - 30,
            nebulaColors[i],
            skillsScene
        );
    }
    
    // Create platform for the player to stand on
    const platformGeometry = new THREE.CircleGeometry(5, 32);
    const platformMaterial = new THREE.MeshPhongMaterial({
        color: 0x111111,
        emissive: 0x222222,
        emissiveIntensity: 0.3,
        shininess: 100
    });
    
    const platform = new THREE.Mesh(platformGeometry, platformMaterial);
    platform.rotation.x = -Math.PI / 2;
    platform.position.y = -1;
    platform.receiveShadow = true;
    skillsScene.add(platform);
    
    // Add glowing ring to platform edge
    const ringGeometry = new THREE.RingGeometry(4.7, 5, 32);
    const ringMaterial = new THREE.MeshBasicMaterial({
        color: 0x3a86ff,
        side: THREE.DoubleSide
    });
    
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = -0.99;
    skillsScene.add(ring);
    
    // Skills data - organize skills in categories
    const skillCategories = [
        {
            name: "Programming Languages",
            skills: ["JavaScript", "TypeScript", "Python", "Java", "C#"],
            color: 0x3a86ff, // Blue
            radius: 15
        },
        {
            name: "Web Development",
            skills: ["HTML", "CSS", "React", "Angular", "Node.js", "Express"],
            color: 0x8338ec, // Purple
            radius: 18
        },
        {
            name: "Data Science",
            skills: ["Machine Learning", "Data Analysis", "TensorFlow", "pandas", "NumPy"],
            color: 0xff006e, // Pink
            radius: 21
        },
        {
            name: "Tools & Others",
            skills: ["Git", "Docker", "AWS", "Firebase", "MongoDB", "SQL"],
            color: 0xfb5607, // Orange
            radius: 24
        }
    ];
    
    // Create constellations for each skill category
    skillCategories.forEach((category, categoryIndex) => {
        // Create category label
        const categoryLabel = document.createElement('div');
        categoryLabel.className = 'skill-category-label';
        categoryLabel.textContent = category.name;
        categoryLabel.style.color = '#' + category.color.toString(16).padStart(6, '0');
        gameContainer.appendChild(categoryLabel);
        
        // Create parent object for this constellation
        const constellation = new THREE.Group();
        constellation.userData = { 
            categoryLabel, 
            orbitRadius: category.radius,
            rotationSpeed: 0.0001 * (1 - categoryIndex * 0.1)
        };
        skillsScene.add(constellation);
        
        // Place skills in a circle to form constellation
        const skills = category.skills;
        skills.forEach((skill, index) => {
            // Calculate position in circle
            const angle = (index / skills.length) * Math.PI * 2;
            const skillRadius = category.radius;
            const x = Math.cos(angle) * skillRadius;
            const z = Math.sin(angle) * skillRadius;
            const y = (Math.random() - 0.5) * 5; // Random height variation
            
            // Create star for this skill
            const starGeometry = new THREE.SphereGeometry(0.5, 16, 16);
            const starMaterial = new THREE.MeshPhongMaterial({
                color: category.color,
                emissive: category.color,
                emissiveIntensity: 0.7,
                shininess: 100
            });
            
            const star = new THREE.Mesh(starGeometry, starMaterial);
            star.position.set(x, y, z);
            constellation.add(star);
            
            // Add glow effect
            const glowGeometry = new THREE.SphereGeometry(0.7, 16, 16);
            const glowMaterial = new THREE.MeshBasicMaterial({
                color: category.color,
                transparent: true,
                opacity: 0.3
            });
            
            const glow = new THREE.Mesh(glowGeometry, glowMaterial);
            star.add(glow);
            
            // Connect stars with lines to form constellation
            if (index > 0) {
                const prevIndex = (index - 1) % skills.length;
                const prevAngle = (prevIndex / skills.length) * Math.PI * 2;
                const prevX = Math.cos(prevAngle) * skillRadius;
                const prevZ = Math.sin(prevAngle) * skillRadius;
                const prevY = constellation.children[index - 1].position.y;
                
                // Create line between stars
                const lineMaterial = new THREE.LineBasicMaterial({ 
                    color: category.color,
                    transparent: true,
                    opacity: 0.4
                });
                
                const lineGeometry = new THREE.BufferGeometry().setFromPoints([
                    new THREE.Vector3(x, y, z),
                    new THREE.Vector3(prevX, prevY, prevZ)
                ]);
                
                const line = new THREE.Line(lineGeometry, lineMaterial);
                constellation.add(line);
            }
            
            // Add connecting line to first star if this is the last one
            if (index === skills.length - 1) {
                const firstAngle = 0;
                const firstX = Math.cos(firstAngle) * skillRadius;
                const firstZ = Math.sin(firstAngle) * skillRadius;
                const firstY = constellation.children[0].position.y;
                
                const lineMaterial = new THREE.LineBasicMaterial({ 
                    color: category.color,
                    transparent: true,
                    opacity: 0.4
                });
                
                const lineGeometry = new THREE.BufferGeometry().setFromPoints([
                    new THREE.Vector3(x, y, z),
                    new THREE.Vector3(firstX, firstY, firstZ)
                ]);
                
                const line = new THREE.Line(lineGeometry, lineMaterial);
                constellation.add(line);
            }
            
            // Create skill label
            const skillLabel = document.createElement('div');
            skillLabel.className = 'skill-label';
            skillLabel.textContent = skill;
            skillLabel.style.color = '#' + category.color.toString(16).padStart(6, '0');
            skillLabel.style.position = 'absolute';
            skillLabel.style.fontSize = '14px';
            skillLabel.style.fontFamily = 'Arial, sans-serif';
            skillLabel.style.padding = '2px 8px';
            skillLabel.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
            skillLabel.style.borderRadius = '10px';
            skillLabel.style.opacity = '0';
            skillLabel.style.transition = 'opacity 0.3s ease';
            skillLabel.style.pointerEvents = 'none';
            gameContainer.appendChild(skillLabel);
            
            // Store label for positioning update
            star.userData = { label: skillLabel, pulseSpeed: Math.random() * 0.05 + 0.02 };
        });
    });
    
    // Add ambient lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    skillsScene.add(ambientLight);
    
    // Add a central light source
    const centralLight = new THREE.PointLight(0xffffff, 1, 100);
    centralLight.position.set(0, 10, 0);
    skillsScene.add(centralLight);
    
    // Animation function for the skills universe
    function animateSkillsUniverse() {
        if (!gameStarted || gameState.currentUniverse !== 'skills') {
            requestAnimationFrame(animateSkillsUniverse);
            return;
        }
        
        // Rotate star field slightly for parallax effect
        starField.rotation.y += 0.0002;
        
        // Update skill labels positions and animations
        skillsScene.children.forEach(object => {
            // Handle constellation rotations
            if (object.userData && object.userData.orbitRadius) {
                // Rotate the constellation
                object.rotation.y += object.userData.rotationSpeed;
                
                // Update category label position
                if (object.userData.categoryLabel) {
                    const labelPos = getScreenPosition(object.position, camera);
                    object.userData.categoryLabel.style.left = labelPos.x + 'px';
                    object.userData.categoryLabel.style.top = labelPos.y + 'px';
                    
                    // Show category label if it's in front of camera
                    if (labelPos.visible) {
                        object.userData.categoryLabel.style.opacity = '1';
                    } else {
                        object.userData.categoryLabel.style.opacity = '0';
                    }
                }
                
                // Update skill stars and labels
                object.children.forEach(child => {
                    if (child.userData && child.userData.label) {
                        // Calculate world position
                        const starWorldPos = new THREE.Vector3();
                        child.getWorldPosition(starWorldPos);
                        
                        // Get screen position
                        const labelPos = getScreenPosition(starWorldPos, camera);
                        
                        // Update label position
                        if (child.userData.label) {
                            child.userData.label.style.left = labelPos.x + 'px';
                            child.userData.label.style.top = labelPos.y + 'px';
                            
                            // Get distance to camera
                            const distToCamera = camera.position.distanceTo(starWorldPos);
                            
                            // Show label if close enough and in front of camera
                            if (distToCamera < 30 && labelPos.visible) {
                                child.userData.label.style.opacity = '1';
                            } else {
                                child.userData.label.style.opacity = '0';
                            }
                        }
                        
                        // Pulse the star
                        if (child.userData.pulseSpeed) {
                            // Get the glow child
                            const glow = child.children[0];
                            if (glow) {
                                glow.scale.setScalar(1 + 0.2 * Math.sin(Date.now() * child.userData.pulseSpeed));
                            }
                        }
                    }
                });
            }
        });
        
        // Animate central light
        const time = Date.now() * 0.001;
        centralLight.intensity = 1 + 0.2 * Math.sin(time * 0.5);
        
        requestAnimationFrame(animateSkillsUniverse);
    }
    
    // Helper function to get screen position from 3D world position
    function getScreenPosition(position, camera) {
        const vector = position.clone();
        vector.project(camera);
        
        const widthHalf = window.innerWidth / 2;
        const heightHalf = window.innerHeight / 2;
        
        const x = (vector.x * widthHalf) + widthHalf;
        const y = -(vector.y * heightHalf) + heightHalf;
        
        // Check if the position is in front of the camera (otherwise it would appear behind)
        if (vector.z > 1) {
            return { x: x, y: y, visible: false };
        }
        
        return { x: x, y: y, visible: true };
    }
    
    // Helper function to create nebula effect
    function createNebula(x, y, z, color, scene) {
        const nebulaGeometry = new THREE.PlaneGeometry(30, 30);
        const nebulaMaterial = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.15,
            side: THREE.DoubleSide,
            blending: THREE.AdditiveBlending
        });
        
        const nebula = new THREE.Mesh(nebulaGeometry, nebulaMaterial);
        nebula.position.set(x, y, z);
        nebula.rotation.x = Math.random() * Math.PI;
        nebula.rotation.y = Math.random() * Math.PI;
        nebula.rotation.z = Math.random() * Math.PI;
        scene.add(nebula);
        
        // Add subtle animation
        nebula.userData = {
            rotationSpeed: {
                x: (Math.random() - 0.5) * 0.0005,
                y: (Math.random() - 0.5) * 0.0005,
                z: (Math.random() - 0.5) * 0.0005
            },
            pulseSpeed: Math.random() * 0.001 + 0.0005
        };
        
        // Create animation update function
        function animateNebula() {
            if (!gameStarted || gameState.currentUniverse !== 'skills') {
                requestAnimationFrame(animateNebula);
                return;
            }
            
            // Rotate slowly
            nebula.rotation.x += nebula.userData.rotationSpeed.x;
            nebula.rotation.y += nebula.userData.rotationSpeed.y;
            nebula.rotation.z += nebula.userData.rotationSpeed.z;
            
            // Pulse opacity
            const time = Date.now() * 0.001;
            nebula.material.opacity = 0.1 + 0.05 * Math.sin(time * nebula.userData.pulseSpeed);
            
            requestAnimationFrame(animateNebula);
        }
        
        animateNebula();
    }
    
    // Start animation loop
    animateSkillsUniverse();
    
    console.log("Skills Universe created");
}

function createEducationUniverse() {
    const eduScene = universesData.education.scene;
    
    // Create campus environment
    const campusRadius = 30;
    
    // Create main campus ground
    const campusGroundGeometry = new THREE.CircleGeometry(campusRadius, 32);
    const campusGroundMaterial = new THREE.MeshPhongMaterial({
        color: 0xd84315,
        shininess: 20,
        emissive: 0xbf360c,
        emissiveIntensity: 0.1
    });
    
    const campusGround = new THREE.Mesh(campusGroundGeometry, campusGroundMaterial);
    campusGround.rotation.x = -Math.PI / 2;
    campusGround.position.y = -0.99;
    campusGround.receiveShadow = true;
    eduScene.add(campusGround);
    
    // Add pathways
    createCampusPathways(eduScene);
    
    // Main academic buildings
    const educationData = [
        {
            name: "Hame University of Applied Sciences",
            degree: "Computer Applications",
            years: "2020-2024",
            position: new THREE.Vector3(-12, 0, -8)
        },
        {
            name: "Self-Education",
            degree: "Web Development & Programming",
            years: "2016-Present",
            position: new THREE.Vector3(10, 0, 5)
        }
    ];
    
    // Create buildings for each education item
    educationData.forEach((edu, index) => {
        createAcademicBuilding(edu, eduScene);
    });
    
    // Add decorative elements
    createCampusDecorations(eduScene);
    
    // Set up day/night cycle
    setupDayNightCycle(eduScene);
    
    console.log("Education Universe created");
}

// Helper function to create campus pathways
function createCampusPathways(scene) {
    // Main central pathway
    const mainPathGeometry = new THREE.PlaneGeometry(4, 25);
    const pathMaterial = new THREE.MeshPhongMaterial({
        color: 0xe0e0e0,
        shininess: 0,
        emissive: 0xbdbdbd,
        emissiveIntensity: 0.05
    });
    
    const mainPath = new THREE.Mesh(mainPathGeometry, pathMaterial);
    mainPath.rotation.x = -Math.PI / 2;
    mainPath.position.y = -0.98;
    mainPath.receiveShadow = true;
    scene.add(mainPath);
    
    // Circular pathway around central area
    const circlePathGeometry = new THREE.RingGeometry(9, 10, 32);
    const circlePath = new THREE.Mesh(circlePathGeometry, pathMaterial);
    circlePath.rotation.x = -Math.PI / 2;
    circlePath.position.y = -0.98;
    scene.add(circlePath);
    
    // Connecting paths to buildings
    const paths = [
        { start: new THREE.Vector3(0, 0, -10), end: new THREE.Vector3(-12, 0, -8) },
        { start: new THREE.Vector3(0, 0, 5), end: new THREE.Vector3(10, 0, 5) }
    ];
    
    paths.forEach(path => {
        const start = path.start;
        const end = path.end;
        
        // Calculate path properties
        const direction = new THREE.Vector3().subVectors(end, start);
        const length = direction.length();
        const pathGeometry = new THREE.PlaneGeometry(2, length);
        
        const pathSegment = new THREE.Mesh(pathGeometry, pathMaterial);
        pathSegment.rotation.x = -Math.PI / 2;
        
        // Position at midpoint between start and end
        const midpoint = new THREE.Vector3().addVectors(start, end).divideScalar(2);
        pathSegment.position.set(midpoint.x, -0.98, midpoint.z);
        
        // Rotate to connect the points
        pathSegment.rotation.y = Math.atan2(direction.x, direction.z);
        
        scene.add(pathSegment);
    });
}

// Helper function to create an academic building
function createAcademicBuilding(educationItem, scene) {
    const { name, degree, years, position } = educationItem;
    const buildingGroup = new THREE.Group();
    buildingGroup.position.copy(position);
    
    // Main building structure
    const buildingWidth = 8;
    const buildingDepth = 6;
    const buildingHeight = 5;
    
    const buildingGeometry = new THREE.BoxGeometry(buildingWidth, buildingHeight, buildingDepth);
    const buildingMaterial = new THREE.MeshPhongMaterial({
        color: 0xffab91,
        shininess: 50
    });
    
    const building = new THREE.Mesh(buildingGeometry, buildingMaterial);
    building.position.y = buildingHeight / 2;
    building.castShadow = true;
    building.receiveShadow = true;
    buildingGroup.add(building);
    
    // Add roof
    const roofGeometry = new THREE.ConeGeometry(buildingWidth * 0.7, 2, 4);
    const roofMaterial = new THREE.MeshPhongMaterial({
        color: 0xd84315,
        shininess: 30
    });
    
    const roof = new THREE.Mesh(roofGeometry, roofMaterial);
    roof.position.y = buildingHeight + 1;
    roof.rotation.y = Math.PI / 4;
    buildingGroup.add(roof);
    
    // Add windows
    const windowSize = 1;
    const windowGeometry = new THREE.PlaneGeometry(windowSize, windowSize * 1.5);
    const windowMaterial = new THREE.MeshPhongMaterial({
        color: 0x90caf9,
        transparent: true,
        opacity: 0.7,
        emissive: 0x64b5f6,
        emissiveIntensity: 0.2,
        side: THREE.DoubleSide
    });
    
    // Front windows
    for (let i = 0; i < 3; i++) {
        const windowMesh = new THREE.Mesh(windowGeometry, windowMaterial);
        windowMesh.position.set((i - 1) * 2, buildingHeight / 2, buildingDepth / 2 + 0.01);
        building.add(windowMesh);
    }
    
    // Side windows
    for (let i = 0; i < 2; i++) {
        const windowMesh = new THREE.Mesh(windowGeometry, windowMaterial);
        windowMesh.position.set(buildingWidth / 2 + 0.01, buildingHeight / 2, (i - 0.5) * 2);
        windowMesh.rotation.y = Math.PI / 2;
        building.add(windowMesh);
    }
    
    // Add door
    const doorGeometry = new THREE.PlaneGeometry(1.5, 2.5);
    const doorMaterial = new THREE.MeshPhongMaterial({
        color: 0x5d4037,
        emissive: 0x3e2723,
        emissiveIntensity: 0.2,
        side: THREE.DoubleSide
    });
    
    const door = new THREE.Mesh(doorGeometry, doorMaterial);
    door.position.set(0, 1.25, buildingDepth / 2 + 0.02);
    building.add(door);
    
    // Add building info label
    const infoLabel = document.createElement('div');
    infoLabel.className = 'edu-label';
    infoLabel.innerHTML = `
        <strong>${name}</strong><br>
        ${degree}<br>
        <i>${years}</i>
    `;
    infoLabel.style.position = 'absolute';
    infoLabel.style.color = 'white';
    infoLabel.style.fontFamily = 'Arial, sans-serif';
    infoLabel.style.fontSize = '14px';
    infoLabel.style.padding = '8px 12px';
    infoLabel.style.backgroundColor = 'rgba(191, 54, 12, 0.8)';
    infoLabel.style.borderRadius = '5px';
    infoLabel.style.opacity = '0';
    infoLabel.style.transition = 'opacity 0.3s ease';
    infoLabel.style.pointerEvents = 'none';
    infoLabel.style.textAlign = 'center';
    infoLabel.style.maxWidth = '200px';
    gameContainer.appendChild(infoLabel);
    
    // Store reference to label for positioning update
    buildingGroup.userData = { label: infoLabel };
    
    // Add a flag pole with school flag
    const poleGeometry = new THREE.CylinderGeometry(0.05, 0.05, 8, 8);
    const poleMaterial = new THREE.MeshPhongMaterial({
        color: 0xbdbdbd,
        metalness: 0.7,
        roughness: 0.3
    });
    
    const pole = new THREE.Mesh(poleGeometry, poleMaterial);
    pole.position.set(buildingWidth / 2 - 1, 4, buildingDepth / 2 - 1);
    buildingGroup.add(pole);
    
    // Add flag
    const flagGeometry = new THREE.PlaneGeometry(1.5, 1);
    const flagMaterial = new THREE.MeshPhongMaterial({
        color: 0xff7043,
        emissive: 0xff5722,
        emissiveIntensity: 0.2,
        side: THREE.DoubleSide
    });
    
    const flag = new THREE.Mesh(flagGeometry, flagMaterial);
    flag.position.set(0.75, 3, 0);
    pole.add(flag);
    
    // Add subtle animation to flag
    flag.userData = {
        waveSpeed: 0.003,
        waveAmount: 0.1
    };
    
    scene.add(buildingGroup);
    return buildingGroup;
}

// Helper function to create campus decorations
function createCampusDecorations(scene) {
    // Add trees
    const treePositions = [
        new THREE.Vector3(5, 0, -5),
        new THREE.Vector3(-7, 0, 2),
        new THREE.Vector3(15, 0, -8),
        new THREE.Vector3(-15, 0, -15),
        new THREE.Vector3(8, 0, 12),
        new THREE.Vector3(-10, 0, 10)
    ];
    
    treePositions.forEach(pos => {
        createTree(pos, scene);
    });
    
    // Add central fountain
    createFountain(new THREE.Vector3(0, 0, 0), scene);
    
    // Add benches
    const benchPositions = [
        { pos: new THREE.Vector3(3, 0, 2), rot: Math.PI / 4 },
        { pos: new THREE.Vector3(-3, 0, 2), rot: -Math.PI / 4 },
        { pos: new THREE.Vector3(0, 0, -4), rot: Math.PI }
    ];
    
    benchPositions.forEach(benchData => {
        createBench(benchData.pos, benchData.rot, scene);
    });
    
    // Add campus sign
    createCampusSign(new THREE.Vector3(0, 0, -12), scene);
}

// Helper function to create a tree
function createTree(position, scene) {
    const treeGroup = new THREE.Group();
    treeGroup.position.copy(position);
    
    // Tree trunk
    const trunkGeometry = new THREE.CylinderGeometry(0.3, 0.5, 2, 8);
    const trunkMaterial = new THREE.MeshPhongMaterial({
        color: 0x795548,
        shininess: 5
    });
    
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.position.y = 1;
    trunk.castShadow = true;
    treeGroup.add(trunk);
    
    // Tree foliage (leaves)
    const foliageGeometry = new THREE.ConeGeometry(2, 4, 8);
    const foliageMaterial = new THREE.MeshPhongMaterial({
        color: 0x558b2f,
        shininess: 10
    });
    
    const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
    foliage.position.y = 4;
    foliage.castShadow = true;
    treeGroup.add(foliage);
    
    scene.add(treeGroup);
}

// Helper function to create a fountain
function createFountain(position, scene) {
    const fountainGroup = new THREE.Group();
    fountainGroup.position.copy(position);
    
    // Fountain base
    const baseGeometry = new THREE.CylinderGeometry(3, 3.5, 0.5, 16);
    const baseMaterial = new THREE.MeshPhongMaterial({
        color: 0xe0e0e0,
        shininess: 30
    });
    
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    base.position.y = 0.25;
    fountainGroup.add(base);
    
    // Fountain water basin
    const basinGeometry = new THREE.CylinderGeometry(2.5, 3, 0.7, 16);
    const basinMaterial = new THREE.MeshPhongMaterial({
        color: 0xeeeeee,
        shininess: 50
    });
    
    const basin = new THREE.Mesh(basinGeometry, basinMaterial);
    basin.position.y = 0.85;
    fountainGroup.add(basin);
    
    // Fountain center piece
    const centerGeometry = new THREE.CylinderGeometry(0.5, 0.7, 1, 8);
    const centerMaterial = new THREE.MeshPhongMaterial({
        color: 0xbdbdbd,
        shininess: 80
    });
    
    const center = new THREE.Mesh(centerGeometry, centerMaterial);
    center.position.y = 1.7;
    fountainGroup.add(center);
    
    // Water
    const waterGeometry = new THREE.CylinderGeometry(2.3, 2.3, 0.2, 16);
    const waterMaterial = new THREE.MeshPhongMaterial({
        color: 0x90caf9,
        transparent: true,
        opacity: 0.7,
        emissive: 0x64b5f6,
        emissiveIntensity: 0.2
    });
    
    const water = new THREE.Mesh(waterGeometry, waterMaterial);
    water.position.y = 1;
    fountainGroup.add(water);
    
    // Water particles
    const particleCount = 100;
    const particleGeometry = new THREE.BufferGeometry();
    const particleMaterial = new THREE.PointsMaterial({
        color: 0xb3e5fc,
        size: 0.1,
        transparent: true,
        opacity: 0.7
    });
    
    const particlePositions = new Float32Array(particleCount * 3);
    const particleVelocities = [];
    
    for (let i = 0; i < particleCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * 0.5;
        const height = Math.random() * 0.1;
        
        particlePositions[i * 3] = Math.cos(angle) * radius;
        particlePositions[i * 3 + 1] = 1.7 + height;
        particlePositions[i * 3 + 2] = Math.sin(angle) * radius;
        
        particleVelocities.push({
            x: (Math.random() - 0.5) * 0.03,
            y: Math.random() * 0.02 + 0.02,
            z: (Math.random() - 0.5) * 0.03,
            age: 0,
            lifespan: Math.random() * 50 + 50
        });
    }
    
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particles = new THREE.Points(particleGeometry, particleMaterial);
    fountainGroup.add(particles);
    
    // Store particle data for animation
    particles.userData = { velocities: particleVelocities };
    
    scene.add(fountainGroup);
}

// Helper function to create a bench
function createBench(position, rotation, scene) {
    const benchGroup = new THREE.Group();
    benchGroup.position.copy(position);
    benchGroup.rotation.y = rotation;
    
    // Bench seat
    const seatGeometry = new THREE.BoxGeometry(2.5, 0.1, 0.8);
    const woodMaterial = new THREE.MeshPhongMaterial({
        color: 0x8d6e63,
        shininess: 10
    });
    
    const seat = new THREE.Mesh(seatGeometry, woodMaterial);
    seat.position.y = 0.5;
    benchGroup.add(seat);
    
    // Bench backrest
    const backrestGeometry = new THREE.BoxGeometry(2.5, 0.8, 0.1);
    const backrest = new THREE.Mesh(backrestGeometry, woodMaterial);
    backrest.position.set(0, 0.9, -0.35);
    benchGroup.add(backrest);
    
    // Bench legs
    const legGeometry = new THREE.BoxGeometry(0.1, 0.5, 0.8);
    const metalMaterial = new THREE.MeshPhongMaterial({
        color: 0x616161,
        metalness: 0.5,
        roughness: 0.5
    });
    
    // Left leg
    const leftLeg = new THREE.Mesh(legGeometry, metalMaterial);
    leftLeg.position.set(-1.1, 0.25, 0);
    benchGroup.add(leftLeg);
    
    // Right leg
    const rightLeg = new THREE.Mesh(legGeometry, metalMaterial);
    rightLeg.position.set(1.1, 0.25, 0);
    benchGroup.add(rightLeg);
    
    scene.add(benchGroup);
}

// Helper function to create campus sign
function createCampusSign(position, scene) {
    const signGroup = new THREE.Group();
    signGroup.position.copy(position);
    
    // Sign post
    const postGeometry = new THREE.CylinderGeometry(0.1, 0.1, 3, 8);
    const postMaterial = new THREE.MeshPhongMaterial({
        color: 0x616161
    });
    
    const post = new THREE.Mesh(postGeometry, postMaterial);
    post.position.y = 1.5;
    signGroup.add(post);
    
    // Sign board
    const boardGeometry = new THREE.BoxGeometry(4, 1.5, 0.1);
    const boardMaterial = new THREE.MeshPhongMaterial({
        color: 0xd84315,
        shininess: 30
    });
    
    const board = new THREE.Mesh(boardGeometry, boardMaterial);
    board.position.y = 2.5;
    signGroup.add(board);
    
    // Sign text (as a texture)
    const textCanvas = document.createElement('canvas');
    textCanvas.width = 256;
    textCanvas.height = 128;
    const ctx = textCanvas.getContext('2d');
    
    // Draw sign text
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, textCanvas.width, textCanvas.height);
    
    ctx.font = 'bold 36px Arial';
    ctx.fillStyle = '#BF360C';
    ctx.textAlign = 'center';
    ctx.fillText('EDUCATION', textCanvas.width / 2, 50);
    
    ctx.font = '24px Arial';
    ctx.fillText('CAMPUS', textCanvas.width / 2, 90);
    
    // Create texture from canvas
    const texture = new THREE.CanvasTexture(textCanvas);
    
    // Apply texture to sign face
    const textGeometry = new THREE.PlaneGeometry(3.8, 1.3);
    const textMaterial = new THREE.MeshBasicMaterial({
        map: texture,
        side: THREE.DoubleSide
    });
    
    const textMesh = new THREE.Mesh(textGeometry, textMaterial);
    textMesh.position.z = 0.06;
    board.add(textMesh);
    
    scene.add(signGroup);
}

// Setup day/night cycle system
function setupDayNightCycle(scene) {
    // Create sun
    const sunGeometry = new THREE.SphereGeometry(5, 16, 16);
    const sunMaterial = new THREE.MeshBasicMaterial({
        color: 0xffeb3b,
        transparent: true,
        opacity: 0.8
    });
    
    const sun = new THREE.Mesh(sunGeometry, sunMaterial);
    sun.position.set(50, 50, 50);
    scene.add(sun);
    
    // Create directional light from sun
    const sunLight = new THREE.DirectionalLight(0xffffff, 1);
    sunLight.position.copy(sun.position);
    sunLight.castShadow = true;
    scene.add(sunLight);
    
    // Animation function for day/night cycle
    function animateEducationUniverse() {
        if (!gameStarted || gameState.currentUniverse !== 'education') {
            requestAnimationFrame(animateEducationUniverse);
            return;
        }
        
        // Animate fountain particles
        scene.children.forEach(object => {
            // Update building info labels
            if (object.userData && object.userData.label) {
                const label = object.userData.label;
                
                // Convert 3D position to 2D screen position
                const worldPosition = new THREE.Vector3();
                object.getWorldPosition(worldPosition);
                worldPosition.y += 5;  // Position above building
                
                const vectorPos = worldPosition.clone();
                vectorPos.project(camera);
                
                const x = (vectorPos.x * 0.5 + 0.5) * window.innerWidth;
                const y = (-vectorPos.y * 0.5 + 0.5) * window.innerHeight;
                
                // Update label position
                label.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px)`;
                
                // Show/hide label based on distance and camera direction
                const cameraDirection = new THREE.Vector3();
                camera.getWorldDirection(cameraDirection);
                
                const objectDirection = worldPosition.clone().sub(camera.position).normalize();
                const dot = cameraDirection.dot(objectDirection);
                
                const distance = camera.position.distanceTo(worldPosition);
                if (dot > 0.5 && distance < 20) {
                    label.style.opacity = '1';
                } else {
                    label.style.opacity = '0';
                }
            }
            
            // Animate fountain particles
            if (object.children) {
                object.children.forEach(child => {
                    if (child.userData && child.userData.velocities) {
                        const particles = child;
                        const positions = particles.geometry.getAttribute('position').array;
                        const velocities = particles.userData.velocities;
                        
                        for (let i = 0; i < velocities.length; i++) {
                            const velocity = velocities[i];
                            const i3 = i * 3;
                            
                            // Update position
                            positions[i3] += velocity.x;
                            positions[i3 + 1] += velocity.y;
                            positions[i3 + 2] += velocity.z;
                            
                            // Apply gravity
                            velocity.y -= 0.001;
                            
                            // Update age
                            velocity.age++;
                            
                            // Reset particle if it's too old or falls below water level
                            if (velocity.age > velocity.lifespan || positions[i3 + 1] < 1) {
                                const angle = Math.random() * Math.PI * 2;
                                const radius = Math.random() * 0.5;
                                
                                positions[i3] = Math.cos(angle) * radius;
                                positions[i3 + 1] = 1.7;
                                positions[i3 + 2] = Math.sin(angle) * radius;
                                
                                velocity.x = (Math.random() - 0.5) * 0.03;
                                velocity.y = Math.random() * 0.02 + 0.02;
                                velocity.z = (Math.random() - 0.5) * 0.03;
                                velocity.age = 0;
                                velocity.lifespan = Math.random() * 50 + 50;
                            }
                        }
                        
                        particles.geometry.getAttribute('position').needsUpdate = true;
                    }
                    
                    // Animate flags
                    if (child.userData && child.userData.waveSpeed) {
                        child.rotation.y = Math.sin(Date.now() * child.userData.waveSpeed) * child.userData.waveAmount;
                    }
                });
            }
        });
        
        requestAnimationFrame(animateEducationUniverse);
    }
    
    animateEducationUniverse();
}

function createTESUniverse() {
    const tesScene = universesData.tes.scene;
    
    // Create interactive learning modules
    const moduleCount = 5;
    const moduleRadius = 20;
    
    for (let i = 0; i < moduleCount; i++) {
        const angle = (i / moduleCount) * Math.PI * 2;
        const x = Math.cos(angle) * moduleRadius;
        const z = Math.sin(angle) * moduleRadius;
        
        // Create module base
        const baseGeometry = new THREE.CylinderGeometry(2, 2, 0.5, 16);
        const baseMaterial = new THREE.MeshPhongMaterial({
            color: 0x00838f,
            shininess: 30,
            emissive: 0x006064,
            emissiveIntensity: 0.2
        });
        
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        base.position.set(x, 0.25, z);
        base.castShadow = true;
        base.receiveShadow = true;
        tesScene.add(base);
        
        // Create module display
        const displayGeometry = new THREE.BoxGeometry(3, 2, 0.2);
        const displayMaterial = new THREE.MeshPhongMaterial({
            color: 0x80deea,
            shininess: 50,
            emissive: 0x80deea,
            emissiveIntensity: 0.3,
            transparent: true,
            opacity: 0.8
        });
        
        const display = new THREE.Mesh(displayGeometry, displayMaterial);
        display.position.set(0, 1.5, 0);
        base.add(display);
        
        // Add interactive elements
        const buttonGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.1, 16);
        const buttonMaterial = new THREE.MeshPhongMaterial({
            color: 0xff5722,
            shininess: 50,
            emissive: 0xff5722,
            emissiveIntensity: 0.3
        });
        
        const button = new THREE.Mesh(buttonGeometry, buttonMaterial);
        button.position.set(0, 0.6, 0.6);
        button.rotation.x = Math.PI / 2;
        display.add(button);
        
        // Add text label
        const textLabel = document.createElement('div');
        textLabel.className = 'tes-label';
        textLabel.textContent = `Module ${i + 1}`;
        textLabel.style.position = 'absolute';
        textLabel.style.color = 'white';
        textLabel.style.fontFamily = 'Arial, sans-serif';
        textLabel.style.fontSize = '14px';
        textLabel.style.padding = '8px 12px';
        textLabel.style.backgroundColor = 'rgba(0, 96, 100, 0.8)';
        textLabel.style.borderRadius = '5px';
        textLabel.style.opacity = '0';
        textLabel.style.transition = 'opacity 0.3s ease';
        textLabel.style.pointerEvents = 'none';
        textLabel.style.textAlign = 'center';
        gameContainer.appendChild(textLabel);
        
        // Store reference to label for positioning update
        base.userData = { label: textLabel };
    }
    
    // Add ambient lighting
    const ambientLight = new THREE.AmbientLight(0x80deea, 0.2);
    tesScene.add(ambientLight);
    
    // Add central light source
    const centralLight = new THREE.PointLight(0x80deea, 1, 100);
    centralLight.position.set(0, 10, 0);
    tesScene.add(centralLight);
    
    // Animation function for TES universe
    function animateTESUniverse() {
        if (!gameStarted || gameState.currentUniverse !== 'tes') {
            requestAnimationFrame(animateTESUniverse);
            return;
        }
        
        // Update module labels
        tesScene.children.forEach(object => {
            if (object.userData && object.userData.label) {
                const worldPos = new THREE.Vector3().setFromMatrixPosition(object.matrixWorld);
                worldPos.y += 3;
                
                const screenPos = worldPos.clone().project(camera);
                const x = (screenPos.x + 1) * window.innerWidth / 2;
                const y = (-screenPos.y + 1) * window.innerHeight / 2;
                
                const label = object.userData.label;
                label.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px)`;
                
                // Show label if object is in front of camera and close enough
                const distance = camera.position.distanceTo(object.position);
                label.style.opacity = (screenPos.z > 0 && distance < 25) ? '1' : '0';
            }
        });
        
        requestAnimationFrame(animateTESUniverse);
    }
    
    animateTESUniverse();
    
    console.log("TES Universe created");
}