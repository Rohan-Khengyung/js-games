// Game state
const gameState = {
    score: 0,
    foundWords: 0,
    totalWords: 8,
    timeLeft: 300,
    timer: null,
    gridSize: 10,
    words: [],
    placedWords: [],
    grid: [],
    selectedCells: [],
    hintsUsed: 0,
    maxHints: 3,
    showAllWords: false,
    gameActive: false,
    gamePaused: false,
    timeLimit: 300,
    gameSettings: {
        gridSize: 10,
        wordCount: 8,
        difficulty: 'easy',
        timeLimit: 300
    }
};

// Word lists by difficulty (optimized for 8-12 letter grids)
const wordLists = {
    easy: [
        "WORD", "GAME", "PLAY", "FIND", "GRID", "LIST", "TIME", "LOVE", "BOOK", "HOME",
        "FIRE", "FOOD", "WATER", "LIFE", "WORK", "CARE", "MOON", "STAR", "SUN", "TREE",
        "HOUSE", "MUSIC", "COLOR", "SOUND", "LIGHT", "DARK", "SOFT", "HARD", "FAST", "SLOW",
        "HIGH", "LOW", "HOT", "COLD", "WARM", "COOL", "NEW", "OLD", "BIG", "SMALL",
        "GOOD", "BAD", "HAPPY", "SAD", "RICH", "POOR", "WISE", "FOOL", "KIND", "MEAN",
        "CITY", "TOWN", "ROAD", "PATH", "DOOR", "WINDOW", "TABLE", "CHAIR", "BED", "SOFA",
        "FISH", "BIRD", "CAT", "DOG", "LION", "BEAR", "DEER", "WOLF", "FOX", "RABBIT",
        "APPLE", "PEAR", "GRAPE", "BANANA", "MANGO", "LEMON", "PEACH", "BERRY", "MELON", "KIWI",
        "EARTH", "MARS", "VENUS", "JUPITER", "SATURN", "PLUTO", "COMET", "STAR", "MOON", "SUN"
    ],
    medium: [
        "PUZZLE", "SEARCH", "CHALLENGE", "SOLUTION", "HORIZONTAL", "VERTICAL", "DIAGONAL",
        "BACKWARD", "FORWARD", "LOCATE", "DISCOVER", "EXPLORE", "MYSTERY", "PATTERN",
        "COMPLETE", "PROGRESS", "VICTORY", "SUCCESS", "ACHIEVE", "ACCOMPLISH", "ELEPHANT",
        "BUTTERFLY", "CHOCOLATE", "MOUNTAIN", "OCEAN", "UNIVERSE", "ADVENTURE", "BEAUTIFUL",
        "CELEBRATION", "KNOWLEDGE", "IMAGINATION", "MAGNIFICENT", "OPPORTUNITY", "REMARKABLE",
        "SIGNIFICANT", "TREMENDOUS", "WONDERFUL", "LIBRARY", "SCHOOL", "COLLEGE", "UNIVERSITY",
        "TEACHER", "STUDENT", "PENCIL", "PAPER", "NOTEBOOK", "COMPUTER", "KEYBOARD", "MONITOR",
        "GARDEN", "FLOWER", "FOREST", "RIVER", "VALLEY", "DESERT", "ISLAND", "BEACH", "CLOUD"
    ],
    hard: [
        "DETERMINATION", "ENTHUSIASTIC", "EXTRAORDINARY", "FANTASTIC", "KNOWLEDGEABLE",
        "PERSEVERANCE", "UNFORGETTABLE", "VOLUNTEER", "XENOPHILE", "YOUTHFUL", "ZEALOUS",
        "ARCHITECTURE", "ENGINEERING", "TECHNOLOGY", "SCIENCE", "MATHEMATICS", "CHEMISTRY",
        "BIOLOGY", "PHYSICS", "ASTRONOMY", "GEOGRAPHY", "HISTORY", "LITERATURE", "PHILOSOPHY",
        "PSYCHOLOGY", "SOCIOLOGY", "ECONOMICS", "POLITICS", "GOVERNMENT", "DEMOCRACY",
        "CONSTITUTION", "REVOLUTION", "EVOLUTION", "INVENTION", "DISCOVERY", "EXPLORATION"
    ]
};

// DOM elements
const startScreen = document.getElementById('start-screen');
const gameScreen = document.getElementById('game-screen');
const startGameBtn = document.getElementById('start-game-btn');
const clearScoresBtn = document.getElementById('clear-scores-btn');
const scoreElement = document.getElementById('score');
const foundElement = document.getElementById('found');
const timerElement = document.getElementById('timer');
const hintsLeftElement = document.getElementById('hints-left');
const messageElement = document.getElementById('message');
const hintTextElement = document.getElementById('hint-text');
const wordListElement = document.getElementById('word-list');
const puzzleGridElement = document.getElementById('puzzle-grid');
const gridSizeDisplay = document.getElementById('grid-size-display');
const currentGridSize = document.getElementById('current-grid-size');
const currentWordCount = document.getElementById('current-word-count');
const currentDifficulty = document.getElementById('current-difficulty');
const highScoresElement = document.getElementById('high-scores');
const selectedCountElement = document.getElementById('selected-count');
const currentWordElement = document.getElementById('current-word');

// Control buttons
const pauseBtn = document.getElementById('pause-btn');
const hintBtn = document.getElementById('hint-btn');
const showWordsBtn = document.getElementById('show-words-btn');
const resetBtn = document.getElementById('reset-btn');
const clearHighlightBtn = document.getElementById('clear-highlight-btn');
const checkWordBtn = document.getElementById('check-word-btn');
const backToMenuBtn = document.getElementById('back-to-menu-btn');
const restartGameBtn = document.getElementById('restart-game-btn');

// Mobile grid controls
const zoomOutBtn = document.getElementById('zoom-out-btn');
const zoomInBtn = document.getElementById('zoom-in-btn');
const centerGridBtn = document.getElementById('center-grid-btn');

// Settings elements
const gridSizeSelect = document.getElementById('grid-size');
const wordCountSelect = document.getElementById('word-count');
const difficultySelect = document.getElementById('difficulty');
const timeLimitSelect = document.getElementById('time-limit');

// Score storage
const STORAGE_KEY = 'wordSearchHighScores';
const MAX_SCORES = 10;

// Initialize game
function initGame() {
    // Set current year in footer
    document.getElementById('current-year').textContent = new Date().getFullYear();
    
    // Set up event listeners for start screen
    startGameBtn.addEventListener('click', startGame);
    clearScoresBtn.addEventListener('click', clearAllScores);
    
    // Set up event listeners for game controls
    pauseBtn.addEventListener('click', togglePause);
    hintBtn.addEventListener('click', useHint);
    showWordsBtn.addEventListener('click', toggleShowWords);
    resetBtn.addEventListener('click', resetGame);
    clearHighlightBtn.addEventListener('click', clearHighlight);
    checkWordBtn.addEventListener('click', checkHighlightedWord);
    backToMenuBtn.addEventListener('click', goBackToMenu);
    restartGameBtn.addEventListener('click', restartGame);
    
    // Set up mobile grid controls
    if (zoomOutBtn) zoomOutBtn.addEventListener('click', zoomOutGrid);
    if (zoomInBtn) zoomInBtn.addEventListener('click', zoomInGrid);
    if (centerGridBtn) centerGridBtn.addEventListener('click', centerGrid);
    
    // Handle window resize
    window.addEventListener('resize', handleResize);
    
    // Initialize with start screen and load high scores
    showStartScreen();
    loadHighScores();
}

// Handle window resize
function handleResize() {
    if (gameState.gameActive && puzzleGridElement.children.length > 0) {
        adjustGridSize();
    }
}

// Adjust grid cell sizes based on screen size and grid size
function adjustGridSize() {
    const gridCells = document.querySelectorAll('.grid-cell');
    const gridSize = gameState.gridSize;
    const containerWidth = document.querySelector('.grid-container').offsetWidth;
    
    // Calculate maximum cell size based on container width and grid size
    let maxCellSize = Math.floor((containerWidth - 20) / gridSize); // 20px for padding/margin
    
    // Ensure minimum cell size
    if (maxCellSize < 20) maxCellSize = 20;
    if (maxCellSize > 45) maxCellSize = 45;
    
    // Set base sizes for different grid sizes
    let cellSize, fontSize;
    
    switch(gridSize) {
        case 8:
            cellSize = Math.min(maxCellSize, 45);
            fontSize = '1.1rem';
            break;
        case 10:
            cellSize = Math.min(maxCellSize, 40);
            fontSize = '1rem';
            break;
        case 12:
            cellSize = Math.min(maxCellSize, 35);
            fontSize = '0.9rem';
            break;
        default:
            cellSize = maxCellSize;
            fontSize = '1rem';
    }
    
    // Adjust for very small screens
    if (window.innerWidth < 400) {
        cellSize = Math.max(cellSize - 4, 18);
        fontSize = '0.9rem';
    }
    
    // Apply styles
    gridCells.forEach(cell => {
        cell.style.width = `${cellSize}px`;
        cell.style.height = `${cellSize}px`;
        cell.style.fontSize = fontSize;
        cell.style.minWidth = `${cellSize}px`;
        cell.style.minHeight = `${cellSize}px`;
    });
    
    // Update grid class for CSS adjustments
    puzzleGridElement.className = `puzzle-grid grid-size-${gridSize}`;
    
    // Show mobile controls on small screens
    const mobileControls = document.querySelector('.mobile-grid-controls');
    if (mobileControls) {
        if (window.innerWidth < 600 || (gridSize === 12 && window.innerWidth < 768)) {
            mobileControls.style.display = 'flex';
        } else {
            mobileControls.style.display = 'none';
        }
    }
}

// Mobile grid controls
function zoomOutGrid() {
    const gridContainer = document.querySelector('.grid-container');
    if (gridContainer) {
        gridContainer.style.transform = 'scale(0.9)';
        setTimeout(() => {
            gridContainer.style.transform = '';
        }, 300);
        
        // Feedback message
        showTemporaryMessage('Grid zoomed out', '#26d0ce');
    }
}

function zoomInGrid() {
    const gridContainer = document.querySelector('.grid-container');
    if (gridContainer) {
        gridContainer.style.transform = 'scale(1.1)';
        setTimeout(() => {
            gridContainer.style.transform = '';
        }, 300);
        
        // Feedback message
        showTemporaryMessage('Grid zoomed in', '#26d0ce');
    }
}

function centerGrid() {
    const gridContainer = document.querySelector('.grid-container');
    const puzzleGrid = document.getElementById('puzzle-grid');
    
    if (gridContainer && puzzleGrid) {
        gridContainer.scrollTo({
            left: (puzzleGrid.offsetWidth - gridContainer.offsetWidth) / 2,
            top: (puzzleGrid.offsetHeight - gridContainer.offsetHeight) / 2,
            behavior: 'smooth'
        });
        
        // Flash effect
        gridContainer.style.boxShadow = '0 0 0 3px #26d0ce';
        setTimeout(() => {
            gridContainer.style.boxShadow = '';
        }, 500);
        
        // Feedback message
        showTemporaryMessage('Grid centered', '#26d0ce');
    }
}

// Show temporary message
function showTemporaryMessage(text, color) {
    const originalMessage = messageElement.textContent;
    const originalColor = messageElement.style.color;
    
    messageElement.textContent = text;
    messageElement.style.color = color;
    
    setTimeout(() => {
        if (gameState.gameActive) {
            messageElement.textContent = originalMessage;
            messageElement.style.color = originalColor;
        }
    }, 1500);
}

// Load high scores from localStorage
function loadHighScores() {
    try {
        const scores = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
        displayHighScores(scores);
    } catch (error) {
        console.error('Error loading high scores:', error);
        highScoresElement.innerHTML = '<div class="no-scores">No high scores yet</div>';
    }
}

// Save high score to localStorage
function saveHighScore(score, settings) {
    try {
        let scores = [];
        const storedScores = localStorage.getItem(STORAGE_KEY);
        
        if (storedScores) {
            try {
                scores = JSON.parse(storedScores);
                if (!Array.isArray(scores)) {
                    scores = [];
                }
            } catch (e) {
                console.error('Error parsing stored scores:', e);
                scores = [];
            }
        }
        
        // Create new score object
        const newScore = {
            score: score,
            gridSize: settings.gridSize,
            wordCount: settings.wordCount,
            difficulty: settings.difficulty,
            date: new Date().toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
            }),
            timestamp: Date.now()
        };
        
        // Add new score
        scores.push(newScore);
        
        // Sort scores in descending order
        scores.sort((a, b) => b.score - a.score);
        
        // Keep only top scores
        scores = scores.slice(0, MAX_SCORES);
        
        // Save back to localStorage
        localStorage.setItem(STORAGE_KEY, JSON.stringify(scores));
        
        // Update display
        displayHighScores(scores);
        
        return true;
    } catch (error) {
        console.error('Error saving high score:', error);
        return false;
    }
}

// Display high scores
function displayHighScores(scores) {
    if (!scores || scores.length === 0) {
        highScoresElement.innerHTML = '<div class="no-scores">No high scores yet. Be the first!</div>';
        return;
    }
    
    let html = '';
    scores.forEach((score, index) => {
        const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`;
        
        html += `
            <div class="score-item">
                <div class="score-info">
                    <span class="score-value">${medal} ${score.score} points</span>
                    <div class="score-details">
                        <span>${score.gridSize}×${score.gridSize}</span>
                        <span>${score.wordCount} words</span>
                        <span>${score.difficulty}</span>
                    </div>
                    <div class="score-date">${score.date || 'Recent'}</div>
                </div>
            </div>
        `;
    });
    
    highScoresElement.innerHTML = html;
}

// Clear all scores
function clearAllScores() {
    if (confirm('Are you sure you want to clear all high scores? This action cannot be undone.')) {
        localStorage.removeItem(STORAGE_KEY);
        loadHighScores();
        
        // Show confirmation message
        showTemporaryMessage('All high scores have been cleared.', '#ff5252');
    }
}

// Show start screen
function showStartScreen() {
    startScreen.style.display = 'flex';
    gameScreen.style.display = 'none';
    gameState.gameActive = false;
    clearInterval(gameState.timer);
}

// Start the game
function startGame() {
    // Get settings from form
    gameState.gameSettings.gridSize = parseInt(gridSizeSelect.value);
    gameState.gameSettings.wordCount = parseInt(wordCountSelect.value);
    gameState.gameSettings.difficulty = difficultySelect.value;
    gameState.gameSettings.timeLimit = parseInt(timeLimitSelect.value);
    
    // Apply settings to game state
    gameState.gridSize = gameState.gameSettings.gridSize;
    gameState.totalWords = gameState.gameSettings.wordCount;
    gameState.timeLimit = gameState.gameSettings.timeLimit;
    gameState.timeLeft = gameState.timeLimit;
    
    // Update display of current settings
    currentGridSize.textContent = `${gameState.gridSize}×${gameState.gridSize}`;
    currentWordCount.textContent = gameState.totalWords;
    currentDifficulty.textContent = difficultySelect.options[difficultySelect.selectedIndex].text;
    gridSizeDisplay.textContent = `Grid: ${gameState.gridSize}×${gameState.gridSize}`;
    
    // Reset game state
    gameState.score = 0;
    gameState.foundWords = 0;
    gameState.hintsUsed = 0;
    gameState.gameActive = true;
    gameState.gamePaused = false;
    gameState.showAllWords = false;
    gameState.selectedCells = [];
    
    // Update UI
    updateScore();
    updateFoundWords();
    updateHintsLeft();
    updateTimerDisplay();
    updateSelectionCounter();
    
    // Enable/disable buttons
    pauseBtn.innerHTML = '<i class="fas fa-pause"></i> Pause';
    pauseBtn.disabled = false;
    hintBtn.disabled = false;
    showWordsBtn.disabled = false;
    checkWordBtn.disabled = false;
    clearHighlightBtn.disabled = false;
    
    // Show game screen
    startScreen.style.display = 'none';
    gameScreen.style.display = 'block';
    
    // Generate puzzle
    generatePuzzle();
    
    // Adjust grid size
    setTimeout(() => {
        adjustGridSize();
        // Auto-center on mobile
        if (window.innerWidth < 600) {
            setTimeout(centerGrid, 200);
        }
    }, 100);
    
    // Start timer
    startTimer();
    
    // Initial message
    messageElement.textContent = "Click letters one by one to select them. Click 'Check' when ready.";
    messageElement.style.color = "#1a2980";
    hintTextElement.textContent = "";
}

// Generate a new puzzle
function generatePuzzle() {
    // Reset game state
    gameState.selectedCells = [];
    gameState.words = [];
    gameState.placedWords = [];
    gameState.grid = [];
    
    // Get words based on difficulty
    const difficulty = gameState.gameSettings.difficulty;
    const wordPool = [...wordLists[difficulty]];
    
    // Select random words that fit the grid
    const selectedWords = new Set();
    const maxWordLength = gameState.gridSize;
    
    // Filter words that fit in the current grid size
    const fittingWords = wordPool.filter(word => word.length <= maxWordLength);
    
    // Shuffle the fitting words
    const shuffledWords = [...fittingWords].sort(() => Math.random() - 0.5);
    
    // Select words for the puzzle
    for (let i = 0; i < gameState.totalWords && i < shuffledWords.length; i++) {
        const word = shuffledWords[i].toUpperCase();
        if (!selectedWords.has(word)) {
            selectedWords.add(word);
        }
    }
    
    // If we don't have enough words, add fallback words
    const fallbackWords = ["GAME", "WORD", "FIND", "PLAY", "GRID", "PUZZLE", "SEARCH", "SOLVE"];
    while (selectedWords.size < gameState.totalWords) {
        for (const word of fallbackWords) {
            if (word.length <= maxWordLength && selectedWords.size < gameState.totalWords) {
                selectedWords.add(word.toUpperCase());
            }
        }
    }
    
    // Convert set to array
    gameState.words = Array.from(selectedWords);
    
    // Initialize empty grid
    for (let i = 0; i < gameState.gridSize; i++) {
        gameState.grid[i] = [];
        for (let j = 0; j < gameState.gridSize; j++) {
            gameState.grid[i][j] = "";
        }
    }
    
    // Place words in the grid
    placeWordsInGrid();
    
    // Fill empty cells with random letters
    fillEmptyCells();
    
    // Render the grid
    renderGrid();
    
    // Render word list
    renderWordList();
}

// Place words in the grid
function placeWordsInGrid() {
    const directions = [
        { x: 1, y: 0, name: 'horizontal' },
        { x: 0, y: 1, name: 'vertical' },
        { x: 1, y: 1, name: 'diagonal-down-right' },
        { x: 1, y: -1, name: 'diagonal-up-right' },
        { x: -1, y: 0, name: 'horizontal-reverse' },
        { x: 0, y: -1, name: 'vertical-reverse' },
        { x: -1, y: -1, name: 'diagonal-up-left' },
        { x: -1, y: 1, name: 'diagonal-down-left' }
    ];
    
    // Sort words by length (longest first) for better placement
    const sortedWords = [...gameState.words].sort((a, b) => b.length - a.length);
    
    // Place each word
    for (const word of sortedWords) {
        let placed = false;
        let attempts = 0;
        const maxAttempts = 500;
        
        // Shuffle directions for each word
        const shuffledDirections = [...directions].sort(() => Math.random() - 0.5);
        
        while (!placed && attempts < maxAttempts) {
            attempts++;
            
            // Choose random direction
            const direction = shuffledDirections[attempts % shuffledDirections.length];
            
            // Calculate maximum possible starting position
            let maxStartX = gameState.gridSize - 1;
            let maxStartY = gameState.gridSize - 1;
            let minStartX = 0;
            let minStartY = 0;
            
            // Adjust bounds based on direction
            if (direction.x > 0) {
                maxStartX = gameState.gridSize - word.length;
            } else if (direction.x < 0) {
                minStartX = word.length - 1;
            }
            
            if (direction.y > 0) {
                maxStartY = gameState.gridSize - word.length;
            } else if (direction.y < 0) {
                minStartY = word.length - 1;
            }
            
            // Ensure bounds are valid
            if (maxStartX < minStartX || maxStartY < minStartY) {
                continue;
            }
            
            // Choose random starting position
            const startX = Math.floor(Math.random() * (maxStartX - minStartX + 1)) + minStartX;
            const startY = Math.floor(Math.random() * (maxStartY - minStartY + 1)) + minStartY;
            
            // Check if word fits
            let canPlace = true;
            const cellsToCheck = [];
            
            for (let i = 0; i < word.length; i++) {
                const x = startX + direction.x * i;
                const y = startY + direction.y * i;
                
                if (!gameState.grid[x] || gameState.grid[x][y] === undefined) {
                    canPlace = false;
                    break;
                }
                
                const cellLetter = gameState.grid[x][y];
                if (cellLetter !== "" && cellLetter !== word[i]) {
                    canPlace = false;
                    break;
                }
                
                cellsToCheck.push({ x, y, letter: word[i] });
            }
            
            if (canPlace) {
                // Place the word
                const wordInfo = {
                    word: word,
                    startX: startX,
                    startY: startY,
                    direction: direction,
                    found: false
                };
                
                for (const cell of cellsToCheck) {
                    gameState.grid[cell.x][cell.y] = cell.letter;
                }
                
                gameState.placedWords.push(wordInfo);
                placed = true;
            }
        }
        
        // If word couldn't be placed, try a shorter version
        if (!placed && word.length > 3) {
            // Try with a shorter version of the word
            const shorterWord = word.substring(0, word.length - 1);
            const wordIndex = gameState.words.indexOf(word);
            if (wordIndex > -1) {
                gameState.words[wordIndex] = shorterWord;
                // Try again with shorter word
                attempts = 0;
                while (!placed && attempts < maxAttempts) {
                    attempts++;
                    const direction = shuffledDirections[attempts % shuffledDirections.length];
                    
                    let maxStartX = gameState.gridSize - 1;
                    let maxStartY = gameState.gridSize - 1;
                    let minStartX = 0;
                    let minStartY = 0;
                    
                    if (direction.x > 0) {
                        maxStartX = gameState.gridSize - shorterWord.length;
                    } else if (direction.x < 0) {
                        minStartX = shorterWord.length - 1;
                    }
                    
                    if (direction.y > 0) {
                        maxStartY = gameState.gridSize - shorterWord.length;
                    } else if (direction.y < 0) {
                        minStartY = shorterWord.length - 1;
                    }
                    
                    if (maxStartX < minStartX || maxStartY < minStartY) {
                        continue;
                    }
                    
                    const startX = Math.floor(Math.random() * (maxStartX - minStartX + 1)) + minStartX;
                    const startY = Math.floor(Math.random() * (maxStartY - minStartY + 1)) + minStartY;
                    
                    let canPlace = true;
                    const cellsToCheck = [];
                    
                    for (let i = 0; i < shorterWord.length; i++) {
                        const x = startX + direction.x * i;
                        const y = startY + direction.y * i;
                        
                        if (!gameState.grid[x] || gameState.grid[x][y] === undefined) {
                            canPlace = false;
                            break;
                        }
                        
                        const cellLetter = gameState.grid[x][y];
                        if (cellLetter !== "" && cellLetter !== shorterWord[i]) {
                            canPlace = false;
                            break;
                        }
                        
                        cellsToCheck.push({ x, y, letter: shorterWord[i] });
                    }
                    
                    if (canPlace) {
                        const wordInfo = {
                            word: shorterWord,
                            startX: startX,
                            startY: startY,
                            direction: direction,
                            found: false
                        };
                        
                        for (const cell of cellsToCheck) {
                            gameState.grid[cell.x][cell.y] = cell.letter;
                        }
                        
                        gameState.placedWords.push(wordInfo);
                        placed = true;
                    }
                }
            }
        }
    }
}

// Fill empty cells with random letters
function fillEmptyCells() {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    for (let i = 0; i < gameState.gridSize; i++) {
        for (let j = 0; j < gameState.gridSize; j++) {
            if (!gameState.grid[i] || !gameState.grid[i][j] || gameState.grid[i][j] === "") {
                gameState.grid[i][j] = letters[Math.floor(Math.random() * letters.length)];
            }
        }
    }
}

// Render the grid
function renderGrid() {
    puzzleGridElement.innerHTML = "";
    
    // Update grid size in CSS
    puzzleGridElement.style.gridTemplateColumns = `repeat(${gameState.gridSize}, 1fr)`;
    
    // Create cells
    for (let i = 0; i < gameState.gridSize; i++) {
        for (let j = 0; j < gameState.gridSize; j++) {
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            cell.textContent = gameState.grid[i][j] || '?';
            cell.dataset.x = i;
            cell.dataset.y = j;
            cell.dataset.letter = gameState.grid[i][j];
            
            // Add click event listener
            cell.addEventListener('click', handleCellClick);
            
            // Add touch event for mobile
            cell.addEventListener('touchstart', (e) => {
                e.preventDefault();
                handleCellClick({ currentTarget: cell });
            }, { passive: false });
            
            puzzleGridElement.appendChild(cell);
        }
    }
    
    // Adjust grid size after rendering
    setTimeout(adjustGridSize, 50);
}

// Handle cell click
function handleCellClick(e) {
    if (!gameState.gameActive || gameState.gamePaused) return;
    
    const cellElement = e.currentTarget;
    
    // Get cell data
    const cell = {
        element: cellElement,
        x: parseInt(cellElement.dataset.x),
        y: parseInt(cellElement.dataset.y),
        letter: cellElement.dataset.letter
    };
    
    // Check if cell is already selected
    const isAlreadySelected = gameState.selectedCells.some(
        selectedCell => selectedCell.x === cell.x && selectedCell.y === cell.y
    );
    
    if (isAlreadySelected) {
        // Remove from selection
        const index = gameState.selectedCells.findIndex(
            selectedCell => selectedCell.x === cell.x && selectedCell.y === cell.y
        );
        if (index !== -1) {
            gameState.selectedCells.splice(index, 1);
            cellElement.classList.remove('selected');
            cellElement.removeAttribute('data-order');
        }
    } else {
        // Add to selection
        gameState.selectedCells.push(cell);
        cellElement.classList.add('selected');
        cellElement.setAttribute('data-order', gameState.selectedCells.length);
    }
    
    // Update all cell order indicators
    updateCellOrderIndicators();
    
    // Update selection counter
    updateSelectionCounter();
    
    // Update message
    updateSelectionMessage();
}

// Update cell order indicators
function updateCellOrderIndicators() {
    // First remove all order indicators
    const allCells = document.querySelectorAll('.grid-cell');
    allCells.forEach(cell => {
        cell.removeAttribute('data-order');
    });
    
    // Then add order indicators to selected cells
    gameState.selectedCells.forEach((cell, index) => {
        if (cell.element) {
            cell.element.setAttribute('data-order', index + 1);
        }
    });
}

// Update selection counter
function updateSelectionCounter() {
    if (selectedCountElement) {
        selectedCountElement.textContent = gameState.selectedCells.length;
    }
    
    if (currentWordElement) {
        const selectedWord = gameState.selectedCells.map(cell => cell.letter).join('');
        currentWordElement.textContent = selectedWord || '(none)';
        currentWordElement.style.color = selectedWord ? '#1a2980' : '#999';
        currentWordElement.style.fontWeight = selectedWord ? 'bold' : 'normal';
    }
}

// Update selection message
function updateSelectionMessage() {
    if (gameState.selectedCells.length === 0) {
        messageElement.textContent = "Click letters one by one to select them. Click 'Check' when ready.";
        messageElement.style.color = "#1a2980";
    } else {
        const selectedWord = gameState.selectedCells.map(cell => cell.letter).join('');
        messageElement.textContent = `Selected ${gameState.selectedCells.length} letters: "${selectedWord}". Click 'Check' to verify.`;
        messageElement.style.color = "#1a2980";
    }
}

// Render word list
function renderWordList() {
    wordListElement.innerHTML = "";
    
    // Display words in alphabetical order
    const sortedWords = [...gameState.words].sort();
    
    for (const word of sortedWords) {
        const wordItem = document.createElement('div');
        wordItem.className = 'word-item';
        wordItem.textContent = word;
        wordItem.dataset.word = word;
        
        // Check if word is already found
        const placedWord = gameState.placedWords.find(w => w.word === word);
        if (placedWord && placedWord.found) {
            wordItem.classList.add('found');
        }
        
        wordListElement.appendChild(wordItem);
    }
    
    // Update found words count
    updateFoundWords();
}

// Clear highlighted cells
function clearHighlight() {
    if (!gameState.gameActive || gameState.gamePaused) return;
    
    // Remove selection from all cells
    const selectedCells = document.querySelectorAll('.grid-cell.selected');
    selectedCells.forEach(cell => {
        cell.classList.remove('selected');
        cell.removeAttribute('data-order');
    });
    
    // Clear selection array
    gameState.selectedCells = [];
    
    // Update counter and message
    updateSelectionCounter();
    updateSelectionMessage();
}

// Check highlighted word
function checkHighlightedWord() {
    if (!gameState.gameActive || gameState.gamePaused) return;
    
    if (gameState.selectedCells.length < 2) {
        messageElement.textContent = "Please select at least 2 letters to form a word.";
        messageElement.style.color = "#ff5252";
        return;
    }
    
    // Get the word from selected cells
    const selectedWord = gameState.selectedCells.map(cell => cell.letter).join('');
    const reversedWord = selectedWord.split('').reverse().join('');
    
    // Check for exact matches
    let foundWord = null;
    let matchType = 'exact';
    
    for (const placedWord of gameState.placedWords) {
        if (!placedWord.found) {
            if (selectedWord === placedWord.word) {
                foundWord = placedWord;
                matchType = 'exact';
                break;
            } else if (reversedWord === placedWord.word) {
                foundWord = placedWord;
                matchType = 'reverse';
                break;
            }
        }
    }
    
    if (foundWord) {
        // Mark word as found
        foundWord.found = true;
        
        // Clear current selection
        clearHighlight();
        
        // Highlight the actual word cells
        const { word, startX, startY, direction } = foundWord;
        for (let i = 0; i < word.length; i++) {
            const x = startX + direction.x * i;
            const y = startY + direction.y * i;
            
            const cell = document.querySelector(`.grid-cell[data-x="${x}"][data-y="${y}"]`);
            if (cell) {
                cell.classList.add('found');
            }
        }
        
        // Update score
        let wordScore = foundWord.word.length * 10;
        gameState.score += wordScore;
        gameState.foundWords++;
        
        updateScore();
        updateFoundWords();
        
        // Update word list
        renderWordList();
        
        // Success message
        let message = `Correct! Found "${foundWord.word}". You earned ${wordScore} points!`;
        if (matchType === 'reverse') {
            message = `Correct! Found "${foundWord.word}" backwards. You earned ${wordScore} points!`;
        }
        
        messageElement.textContent = message;
        messageElement.style.color = "#4CAF50";
        
        // Check if all words are found
        if (gameState.foundWords === gameState.totalWords) {
            endGame(true);
        }
    } else {
        // Incorrect word
        messageElement.textContent = `"${selectedWord}" doesn't match any word. Try again!`;
        messageElement.style.color = "#ff5252";
        
        // Shake the selected cells
        for (const cell of gameState.selectedCells) {
            if (cell && cell.element) {
                cell.element.style.animation = "shake 0.5s";
                setTimeout(() => {
                    if (cell.element) {
                        cell.element.style.animation = "";
                    }
                }, 500);
            }
        }
        
        // Clear selection after a delay
        setTimeout(() => {
            clearHighlight();
        }, 1500);
    }
}

// Use hint
function useHint() {
    if (!gameState.gameActive || gameState.gamePaused) return;
    
    if (gameState.hintsUsed >= gameState.maxHints) {
        messageElement.textContent = "You've used all available hints!";
        messageElement.style.color = "#ff5252";
        return;
    }
    
    // Find a word that hasn't been found yet
    const unfoundWords = gameState.placedWords.filter(word => !word.found);
    if (unfoundWords.length === 0) {
        messageElement.textContent = "All words have been found!";
        return;
    }
    
    // Select a random unfound word
    const randomWord = unfoundWords[Math.floor(Math.random() * unfoundWords.length)];
    
    // Highlight the first letter of the word
    const firstX = randomWord.startX;
    const firstY = randomWord.startY;
    
    const cells = document.querySelectorAll('.grid-cell');
    for (const cell of cells) {
        if (parseInt(cell.dataset.x) === firstX && parseInt(cell.dataset.y) === firstY) {
            cell.classList.add('hint');
            
            // Remove hint class after 3 seconds
            setTimeout(() => {
                cell.classList.remove('hint');
            }, 3000);
            
            break;
        }
    }
    
    // Highlight the word in the word list
    const wordItems = document.querySelectorAll('.word-item');
    for (const item of wordItems) {
        if (item.dataset.word === randomWord.word) {
            item.classList.add('hint');
            
            // Remove hint class after 3 seconds
            setTimeout(() => {
                item.classList.remove('hint');
            }, 3000);
            
            break;
        }
    }
    
    // Update game state
    gameState.hintsUsed++;
    gameState.score = Math.max(0, gameState.score - 20);
    updateScore();
    updateHintsLeft();
    
    // Show hint message
    hintTextElement.textContent = `Hint: "${randomWord.word}" starts at row ${firstX + 1}, column ${firstY + 1}`;
    messageElement.textContent = `Hint used! 20 points deducted.`;
    messageElement.style.color = "#ffcc00";
}

// Toggle show all words
function toggleShowWords() {
    if (!gameState.gameActive || gameState.gamePaused) return;
    
    gameState.showAllWords = !gameState.showAllWords;
    
    if (gameState.showAllWords) {
        // Highlight all words
        for (const placedWord of gameState.placedWords) {
            const { word, startX, startY, direction } = placedWord;
            
            for (let i = 0; i < word.length; i++) {
                const x = startX + direction.x * i;
                const y = startY + direction.y * i;
                
                const cell = document.querySelector(`.grid-cell[data-x="${x}"][data-y="${y}"]`);
                if (cell) {
                    cell.classList.add('found');
                }
            }
        }
        
        showWordsBtn.innerHTML = '<i class="fas fa-eye-slash"></i> Hide';
        messageElement.textContent = "All words are now highlighted. This won't give you points!";
        messageElement.style.color = "#ffcc00";
    } else {
        // Remove highlighting from unfound words
        for (const placedWord of gameState.placedWords) {
            if (!placedWord.found) {
                const { word, startX, startY, direction } = placedWord;
                
                for (let i = 0; i < word.length; i++) {
                    const x = startX + direction.x * i;
                    const y = startY + direction.y * i;
                    
                    const cell = document.querySelector(`.grid-cell[data-x="${x}"][data-y="${y}"]`);
                    if (cell) {
                        cell.classList.remove('found');
                    }
                }
            }
        }
        
        showWordsBtn.innerHTML = '<i class="fas fa-eye"></i> Show';
        messageElement.textContent = "Words are now hidden. Find them yourself!";
        messageElement.style.color = "#1a2980";
    }
}

// Toggle pause
function togglePause() {
    if (!gameState.gameActive) return;
    
    gameState.gamePaused = !gameState.gamePaused;
    
    if (gameState.gamePaused) {
        clearInterval(gameState.timer);
        pauseBtn.innerHTML = '<i class="fas fa-play"></i> Resume';
        showPauseOverlay();
    } else {
        startTimer();
        pauseBtn.innerHTML = '<i class="fas fa-pause"></i> Pause';
        hidePauseOverlay();
    }
}

// Show pause overlay
function showPauseOverlay() {
    const overlay = document.createElement('div');
    overlay.className = 'pause-overlay';
    overlay.id = 'pause-overlay';
    
    const content = document.createElement('div');
    content.className = 'pause-content';
    
    content.innerHTML = `
        <h2><i class="fas fa-pause"></i> Game Paused</h2>
        <p>Your game is paused. Click Resume to continue or go back to menu.</p>
        
        <div class="pause-stats">
            <div class="pause-stat">
                <div class="pause-stat-label">Score</div>
                <div class="pause-stat-value">${gameState.score}</div>
            </div>
            <div class="pause-stat">
                <div class="pause-stat-label">Words Found</div>
                <div class="pause-stat-value">${gameState.foundWords}/${gameState.totalWords}</div>
            </div>
            <div class="pause-stat">
                <div class="pause-stat-label">Time Left</div>
                <div class="pause-stat-value">${Math.floor(gameState.timeLeft / 60)}:${(gameState.timeLeft % 60).toString().padStart(2, '0')}</div>
            </div>
            <div class="pause-stat">
                <div class="pause-stat-label">Hints Left</div>
                <div class="pause-stat-value">${gameState.maxHints - gameState.hintsUsed}/${gameState.maxHints}</div>
            </div>
        </div>
        
        <div class="pause-actions">
            <button id="resume-btn" class="btn" style="background-color: #4CAF50; color: white;">
                <i class="fas fa-play"></i> Resume Game
            </button>
            <button id="menu-from-pause-btn" class="btn" style="background-color: #9c27b0; color: white;">
                <i class="fas fa-home"></i> Back to Menu
            </button>
        </div>
    `;
    
    overlay.appendChild(content);
    document.body.appendChild(overlay);
    
    // Add event listeners to overlay buttons
    document.getElementById('resume-btn').addEventListener('click', togglePause);
    document.getElementById('menu-from-pause-btn').addEventListener('click', () => {
        hidePauseOverlay();
        goBackToMenu();
    });
}

// Hide pause overlay
function hidePauseOverlay() {
    const overlay = document.getElementById('pause-overlay');
    if (overlay) {
        overlay.remove();
    }
}

// Reset game (new puzzle with same settings)
function resetGame() {
    if (!gameState.gameActive || gameState.gamePaused) return;
    
    if (confirm("Are you sure you want to start a new puzzle? Your current progress will be lost.")) {
        // Reset game state but keep settings
        gameState.score = 0;
        gameState.foundWords = 0;
        gameState.hintsUsed = 0;
        gameState.showAllWords = false;
        gameState.selectedCells = [];
        
        // Update UI
        updateScore();
        updateFoundWords();
        updateHintsLeft();
        updateTimerDisplay();
        updateSelectionCounter();
        
        // Reset timer
        gameState.timeLeft = gameState.timeLimit;
        
        // Generate new puzzle
        generatePuzzle();
        
        // Reset show words button
        showWordsBtn.innerHTML = '<i class="fas fa-eye"></i> Show';
        
        // Message
        messageElement.textContent = "New puzzle generated! Click letters one by one to select them.";
        messageElement.style.color = "#1a2980";
        hintTextElement.textContent = "";
    }
}

// Restart game (go back to start screen)
function restartGame() {
    if (confirm("Are you sure you want to restart? Your current progress will be lost.")) {
        goBackToMenu();
    }
}

// Go back to menu
function goBackToMenu() {
    clearInterval(gameState.timer);
    gameState.gameActive = false;
    gameState.gamePaused = false;
    hidePauseOverlay();
    showStartScreen();
    loadHighScores();
}

// Update score display
function updateScore() {
    scoreElement.textContent = gameState.score;
}

// Update found words display
function updateFoundWords() {
    foundElement.textContent = `${gameState.foundWords}/${gameState.totalWords}`;
}

// Update hints left display
function updateHintsLeft() {
    hintsLeftElement.textContent = `${gameState.maxHints - gameState.hintsUsed}/${gameState.maxHints}`;
}

// Timer function
function startTimer() {
    clearInterval(gameState.timer);
    updateTimerDisplay();
    
    gameState.timer = setInterval(() => {
        if (!gameState.gamePaused && gameState.gameActive) {
            gameState.timeLeft--;
            updateTimerDisplay();
            
            if (gameState.timeLeft <= 0) {
                clearInterval(gameState.timer);
                endGame(false);
            } else if (gameState.timeLeft <= 30) {
                timerElement.style.color = "#ff5252";
            } else {
                timerElement.style.color = "#1a2980";
            }
        }
    }, 1000);
}

// Update timer display
function updateTimerDisplay() {
    const minutes = Math.floor(gameState.timeLeft / 60);
    const seconds = gameState.timeLeft % 60;
    timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// End game with score saving
function endGame(isWin) {
    gameState.gameActive = false;
    clearInterval(gameState.timer);
    
    // Disable game controls
    hintBtn.disabled = true;
    checkWordBtn.disabled = true;
    clearHighlightBtn.disabled = true;
    pauseBtn.disabled = true;
    
    if (isWin) {
        // Add time bonus
        const timeBonus = gameState.timeLeft * 2;
        gameState.score += timeBonus;
        updateScore();
        
        // Save high score
        saveHighScore(gameState.score, gameState.gameSettings);
        
        messageElement.textContent = `Congratulations! You found all ${gameState.totalWords} words! Final score: ${gameState.score} (including ${timeBonus} time bonus)`;
        messageElement.style.color = "#4CAF50";
        
        // Confetti effect
        createConfetti();
    } else {
        messageElement.textContent = `Time's up! You found ${gameState.foundWords} of ${gameState.totalWords} words. Final score: ${gameState.score}`;
        messageElement.style.color = "#ff5252";
    }
    
    // Show game over overlay after delay
    setTimeout(() => {
        showGameOverOverlay(isWin);
    }, 1500);
}

// Show game over overlay
function showGameOverOverlay(isWin) {
    const overlay = document.createElement('div');
    overlay.className = 'pause-overlay';
    overlay.id = 'game-over-overlay';
    
    const content = document.createElement('div');
    content.className = 'pause-content';
    
    const resultText = isWin ? 'You Win!' : 'Time\'s Up!';
    const resultIcon = isWin ? 'fa-trophy' : 'fa-clock';
    
    content.innerHTML = `
        <h2><i class="fas ${resultIcon}"></i> ${resultText}</h2>
        <p>${isWin ? 'Congratulations! You found all the words!' : 'Your time has run out!'}</p>
        
        <div class="pause-stats">
            <div class="pause-stat">
                <div class="pause-stat-label">Final Score</div>
                <div class="pause-stat-value">${gameState.score}</div>
            </div>
            <div class="pause-stat">
                <div class="pause-stat-label">Words Found</div>
                <div class="pause-stat-value">${gameState.foundWords}/${gameState.totalWords}</div>
            </div>
            <div class="pause-stat">
                <div class="pause-stat-label">Time Used</div>
                <div class="pause-stat-value">${Math.floor((gameState.timeLimit - gameState.timeLeft) / 60)}:${((gameState.timeLimit - gameState.timeLeft) % 60).toString().padStart(2, '0')}</div>
            </div>
            <div class="pause-stat">
                <div class="pause-stat-label">Hints Used</div>
                <div class="pause-stat-value">${gameState.hintsUsed}/${gameState.maxHints}</div>
            </div>
        </div>
        
        <div class="pause-actions">
            <button id="play-again-btn" class="btn" style="background-color: #2196f3; color: white;">
                <i class="fas fa-sync-alt"></i> Play Again
            </button>
            <button id="menu-from-gameover-btn" class="btn" style="background-color: #9c27b0; color: white;">
                <i class="fas fa-home"></i> Back to Menu
            </button>
        </div>
    `;
    
    overlay.appendChild(content);
    document.body.appendChild(overlay);
    
    // Add event listeners to overlay buttons
    document.getElementById('play-again-btn').addEventListener('click', () => {
        overlay.remove();
        startGame();
    });
    
    document.getElementById('menu-from-gameover-btn').addEventListener('click', () => {
        overlay.remove();
        goBackToMenu();
    });
}

// Create confetti effect for win
function createConfetti() {
    const confettiCount = 100;
    const container = document.querySelector('.container');
    
    for (let i = 0; i < confettiCount; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + 'vw';
        confetti.style.backgroundColor = `hsl(${Math.random() * 360}, 100%, 60%)`;
        confetti.style.width = Math.random() * 10 + 5 + 'px';
        confetti.style.height = Math.random() * 10 + 5 + 'px';
        confetti.style.position = 'fixed';
        confetti.style.top = '-20px';
        confetti.style.zIndex = '9999';
        confetti.style.borderRadius = '2px';
        confetti.style.opacity = '0.8';
        
        container.appendChild(confetti);
        
        // Animate confetti
        const animation = confetti.animate([
            { transform: 'translateY(0) rotate(0deg)', opacity: 0.8 },
            { transform: `translateY(${window.innerHeight}px) rotate(${Math.random() * 360}deg)`, opacity: 0 }
        ], {
            duration: Math.random() * 2000 + 1000,
            easing: 'cubic-bezier(0.215, 0.610, 0.355, 1)'
        });
        
        // Remove confetti after animation
        animation.onfinish = () => {
            confetti.remove();
        };
    }
}

// Add shake animation for incorrect answers
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
        20%, 40%, 60%, 80% { transform: translateX(5px); }
    }
`;
document.head.appendChild(style);

// Initialize the game when page loads
document.addEventListener('DOMContentLoaded', initGame);