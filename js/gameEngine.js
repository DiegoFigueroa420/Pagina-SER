// Game engine for individual game logic and mechanics

class GameEngine {
    constructor() {
        this.currentGame = null;
        this.gameState = {};
        this.startTime = null;
        this.gameTimer = null;
        this.gameCompleted = false;
        this.init();
    }
    
    init() {
        // Get game ID from URL
        const urlParams = new URLSearchParams(window.location.search);
        const gameId = parseInt(urlParams.get('id'));
        
        if (!gameId) {
            window.location.href = 'games.html';
            return;
        }
        
        // Load game data
        this.loadGame(gameId);
        
        // Initialize game timer
        this.startGameTimer();
        
        // Initialize game controls
        this.initializeControls();
    }
    
    loadGame(gameId) {
        // Get game data from questions
        if (!window.moneyQuestions) {
            console.error('Questions not loaded');
            return;
        }
        
        this.currentGame = window.moneyQuestions.find(q => q.id === gameId);
        if (!this.currentGame) {
            console.error('Game not found');
            window.location.href = 'games.html';
            return;
        }
        
        // Update UI with game info
        this.updateGameHeader();
        
        // Initialize specific game
        this.initializeGameType();
    }
    
    updateGameHeader() {
        const gameTitle = document.getElementById('gameTitle');
        const gameCategory = document.getElementById('gameCategory');
        const gameDifficulty = document.getElementById('gameDifficulty');
        
        if (gameTitle) {
            const gameData = window.getGameById ? window.getGameById(this.currentGame.id) : null;
            gameTitle.textContent = gameData ? gameData.title : `Experiencia ${this.currentGame.id}`;
        }
        
        if (gameCategory) {
            const categoryNames = {
                energia: 'Energía',
                creencias: 'Creencias',
                recepcion: 'Recepción',
                accion: 'Acción'
            };
            gameCategory.textContent = categoryNames[this.currentGame.category] || 'General';
        }
        
        if (gameDifficulty) {
            const stars = [];
            for (let i = 1; i <= 3; i++) {
                const active = i <= this.currentGame.difficulty ? 'active' : '';
                stars.push(`<div class="difficulty-star ${active}"></div>`);
            }
            gameDifficulty.innerHTML = stars.join('');
        }
    }
    
    initializeGameType() {
        const gameArea = document.getElementById('gameArea');
        if (!gameArea) return;
        
        // Get game content
        const content = window.getRandomGameContent(this.currentGame.gameType, this.currentGame.category);
        
        // Initialize based on game type
        switch (this.currentGame.gameType) {
            case 'memory':
                this.initMemoryGame(gameArea, content);
                break;
            case 'word':
                this.initWordGame(gameArea, content);
                break;
            case 'matching':
                this.initMatchingGame(gameArea, content);
                break;
            case 'puzzle':
                this.initPuzzleGame(gameArea, content);
                break;
            case 'slider':
                this.initSliderGame(gameArea);
                break;
            case 'sequence':
                this.initSequenceGame(gameArea, content);
                break;
            case 'pattern':
                this.initPatternGame(gameArea, content);
                break;
            case 'selection':
                this.initSelectionGame(gameArea, content);
                break;
            default:
                this.initDefaultGame(gameArea);
        }
    }
    
    initMemoryGame(container, content) {
        const symbols = content.symbols.slice(0, 8);
        const cards = [...symbols, ...symbols]; // Duplicate for pairs
        const shuffledCards = window.shuffleArray(cards);
        
        this.gameState = {
            cards: shuffledCards,
            flippedCards: [],
            matchedPairs: 0,
            attempts: 0
        };
        
        container.innerHTML = `
            <div class="memory-game">
                ${shuffledCards.map((symbol, index) => `
                    <div class="memory-card" data-index="${index}" onclick="gameEngine.flipCard(${index})">
                        <div class="card-content">${symbol}</div>
                    </div>
                `).join('')}
            </div>
            <div class="game-stats">
                <p>Encuentra todas las parejas para continuar</p>
                <p>Intentos: <span id="attempts">0</span></p>
            </div>
        `;
    }
    
    flipCard(index) {
        if (this.gameState.flippedCards.length >= 2) return;
        if (this.gameState.flippedCards.includes(index)) return;
        
        const card = document.querySelector(`[data-index="${index}"]`);
        
        // Add flip animation
        card.classList.add('flipped');
        this.createSparkEffect(card);
        this.gameState.flippedCards.push(index);
        
        if (this.gameState.flippedCards.length === 2) {
            this.gameState.attempts++;
            document.getElementById('attempts').textContent = this.gameState.attempts;
            
            setTimeout(() => this.checkMemoryMatch(), 1000);
        }
    }
    
    checkMemoryMatch() {
        const [index1, index2] = this.gameState.flippedCards;
        const card1 = document.querySelector(`[data-index="${index1}"]`);
        const card2 = document.querySelector(`[data-index="${index2}"]`);
        
        if (this.gameState.cards[index1] === this.gameState.cards[index2]) {
            // Match found
            card1.classList.add('matched');
            card2.classList.add('matched');
            this.gameState.matchedPairs++;
            
            // Create success effect
            this.createMatchEffect(card1);
            this.createMatchEffect(card2);
            this.showFloatingMessage('¡Excelente!', 'success');
            
            if (this.gameState.matchedPairs === 8) {
                this.createCelebrationEffect();
                setTimeout(() => this.completeGame(), 1000);
            }
        } else {
            // No match
            card1.classList.remove('flipped');
            card2.classList.remove('flipped');
            this.showFloatingMessage('Inténtalo de nuevo', 'info');
        }
        
        this.gameState.flippedCards = [];
    }
    
    initWordGame(container, content) {
        this.gameState = {
            targetWord: content.word,
            scrambledWord: content.scrambled,
            hint: content.hint,
            userInput: ''
        };
        
        container.innerHTML = `
            <div class="word-puzzle">
                <h3>Descifra la palabra</h3>
                <div class="puzzle-word">${content.scrambled}</div>
                <p class="word-hint"><strong>Pista:</strong> ${content.hint}</p>
                <input type="text" class="word-input" id="wordInput" placeholder="Escribe tu respuesta..." maxlength="${content.word.length}">
                <p class="word-progress">Progreso: <span id="wordProgress">0</span>/${content.word.length}</p>
            </div>
        `;
        
        const input = document.getElementById('wordInput');
        input.addEventListener('input', (e) => this.checkWordInput(e.target.value));
        input.focus();
    }
    
    checkWordInput(value) {
        this.gameState.userInput = value.toUpperCase();
        document.getElementById('wordProgress').textContent = value.length;
        
        if (this.gameState.userInput === this.gameState.targetWord) {
            this.completeGame();
        }
        
        // Enable submit button if word is complete
        const submitBtn = document.getElementById('submitBtn');
        if (submitBtn) {
            submitBtn.disabled = value.length < this.gameState.targetWord.length;
        }
    }
    
    initMatchingGame(container, content) {
        this.gameState = {
            pairs: content,
            selectedLeft: null,
            selectedRight: null,
            matches: 0
        };
        
        const leftItems = window.shuffleArray(content.map(pair => pair.left));
        const rightItems = window.shuffleArray(content.map(pair => pair.right));
        
        container.innerHTML = `
            <div class="matching-game">
                <div class="matching-column">
                    <h4>Conceptos</h4>
                    ${leftItems.map((item, index) => `
                        <div class="matching-item left-item" data-value="${item}" onclick="gameEngine.selectLeft('${item}')">
                            ${item}
                        </div>
                    `).join('')}
                </div>
                <div class="matching-column">
                    <h4>Significados</h4>
                    ${rightItems.map((item, index) => `
                        <div class="matching-item right-item" data-value="${item}" onclick="gameEngine.selectRight('${item}')">
                            ${item}
                        </div>
                    `).join('')}
                </div>
            </div>
            <p class="matching-instruction">Conecta cada concepto con su significado correcto</p>
        `;
    }
    
    selectLeft(value) {
        // Remove previous selection
        document.querySelectorAll('.left-item').forEach(item => item.classList.remove('selected'));
        
        // Select new item
        document.querySelector(`[data-value="${value}"].left-item`).classList.add('selected');
        this.gameState.selectedLeft = value;
        
        this.checkMatch();
    }
    
    selectRight(value) {
        // Remove previous selection
        document.querySelectorAll('.right-item').forEach(item => item.classList.remove('selected'));
        
        // Select new item
        document.querySelector(`[data-value="${value}"].right-item`).classList.add('selected');
        this.gameState.selectedRight = value;
        
        this.checkMatch();
    }
    
    checkMatch() {
        if (!this.gameState.selectedLeft || !this.gameState.selectedRight) return;
        
        const isMatch = this.gameState.pairs.some(pair => 
            pair.left === this.gameState.selectedLeft && pair.right === this.gameState.selectedRight
        );
        
        if (isMatch) {
            // Mark as matched
            document.querySelector(`[data-value="${this.gameState.selectedLeft}"].left-item`).classList.add('matched');
            document.querySelector(`[data-value="${this.gameState.selectedRight}"].right-item`).classList.add('matched');
            
            this.gameState.matches++;
            
            if (this.gameState.matches === this.gameState.pairs.length) {
                this.completeGame();
            }
        }
        
        // Reset selections
        this.gameState.selectedLeft = null;
        this.gameState.selectedRight = null;
        
        setTimeout(() => {
            document.querySelectorAll('.matching-item:not(.matched)').forEach(item => {
                item.classList.remove('selected');
            });
        }, 1000);
    }
    
    initPuzzleGame(container, content) {
        this.gameState = {
            targetMessage: content.message,
            pieces: content.pieces,
            currentOrder: [],
            correctOrder: content.message.split(' ')
        };
        
        container.innerHTML = `
            <div class="puzzle-game">
                <h3>Ordena las palabras para formar el mensaje de abundancia</h3>
                <div class="puzzle-pieces">
                    ${content.pieces.map((piece, index) => `
                        <div class="puzzle-piece" data-word="${piece}" onclick="gameEngine.selectPiece('${piece}', ${index})">
                            ${piece}
                        </div>
                    `).join('')}
                </div>
                <div class="puzzle-result" id="puzzleResult">
                    <p>Tu mensaje:</p>
                    <div class="result-words" id="resultWords"></div>
                </div>
            </div>
        `;
    }
    
    selectPiece(word, index) {
        const piece = document.querySelector(`[data-word="${word}"]`);
        
        if (piece.classList.contains('used')) return;
        
        piece.classList.add('used');
        this.gameState.currentOrder.push(word);
        
        this.updatePuzzleResult();
        
        if (this.gameState.currentOrder.length === this.gameState.correctOrder.length) {
            this.checkPuzzleComplete();
        }
    }
    
    updatePuzzleResult() {
        const resultWords = document.getElementById('resultWords');
        resultWords.innerHTML = this.gameState.currentOrder.map(word => 
            `<span class="result-word">${word}</span>`
        ).join(' ');
    }
    
    checkPuzzleComplete() {
        const isCorrect = this.gameState.currentOrder.join(' ') === this.gameState.targetMessage;
        
        if (isCorrect) {
            document.getElementById('resultWords').classList.add('correct');
            this.completeGame();
        } else {
            // Reset and try again
            setTimeout(() => {
                this.resetPuzzle();
            }, 2000);
        }
    }
    
    resetPuzzle() {
        this.gameState.currentOrder = [];
        document.querySelectorAll('.puzzle-piece').forEach(piece => {
            piece.classList.remove('used');
        });
        document.getElementById('resultWords').innerHTML = '';
        document.getElementById('resultWords').classList.remove('correct');
    }
    
    initSliderGame(container) {
        const numbers = [1, 2, 3, 4, 5, 6, 7, 8, ''];
        const shuffledNumbers = window.shuffleArray([...numbers]);
        
        this.gameState = {
            tiles: shuffledNumbers,
            emptyIndex: shuffledNumbers.indexOf(''),
            moves: 0
        };
        
        container.innerHTML = `
            <div class="slider-puzzle">
                <h3>Ordena los números del 1 al 8</h3>
                <div class="slider-container" id="sliderContainer">
                    ${shuffledNumbers.map((num, index) => `
                        <div class="slider-tile ${num === '' ? 'empty' : ''}" 
                             data-index="${index}" 
                             onclick="gameEngine.moveTile(${index})">
                            ${num}
                        </div>
                    `).join('')}
                </div>
                <p>Movimientos: <span id="moveCount">0</span></p>
            </div>
        `;
    }
    
    moveTile(index) {
        const emptyIndex = this.gameState.emptyIndex;
        
        // Check if tile is adjacent to empty space
        const canMove = this.isAdjacent(index, emptyIndex);
        
        if (canMove) {
            // Swap tiles
            [this.gameState.tiles[index], this.gameState.tiles[emptyIndex]] = 
            [this.gameState.tiles[emptyIndex], this.gameState.tiles[index]];
            
            this.gameState.emptyIndex = index;
            this.gameState.moves++;
            
            this.updateSliderDisplay();
            
            if (this.isSliderSolved()) {
                this.completeGame();
            }
        }
    }
    
    isAdjacent(index1, index2) {
        const row1 = Math.floor(index1 / 3);
        const col1 = index1 % 3;
        const row2 = Math.floor(index2 / 3);
        const col2 = index2 % 3;
        
        return (Math.abs(row1 - row2) === 1 && col1 === col2) ||
               (Math.abs(col1 - col2) === 1 && row1 === row2);
    }
    
    updateSliderDisplay() {
        const container = document.getElementById('sliderContainer');
        container.innerHTML = this.gameState.tiles.map((num, index) => `
            <div class="slider-tile ${num === '' ? 'empty' : ''}" 
                 data-index="${index}" 
                 onclick="gameEngine.moveTile(${index})">
                ${num}
            </div>
        `).join('');
        
        document.getElementById('moveCount').textContent = this.gameState.moves;
    }
    
    isSliderSolved() {
        const correct = [1, 2, 3, 4, 5, 6, 7, 8, ''];
        return this.gameState.tiles.every((tile, index) => tile === correct[index]);
    }
    
    initSelectionGame(container, content) {
        this.gameState = {
            question: content,
            selectedOption: null
        };
        
        container.innerHTML = `
            <div class="selection-game">
                <h3>${content.question}</h3>
                <div class="selection-options">
                    ${content.options.map((option, index) => `
                        <div class="selection-option" data-index="${index}" onclick="gameEngine.selectOption(${index})">
                            ${option.text}
                        </div>
                    `).join('')}
                </div>
                <div class="selection-feedback" id="selectionFeedback"></div>
            </div>
        `;
    }
    
    selectOption(index) {
        document.querySelectorAll('.selection-option').forEach(option => {
            option.classList.remove('selected');
        });
        
        document.querySelector(`[data-index="${index}"]`).classList.add('selected');
        this.gameState.selectedOption = index;
        
        const option = this.gameState.question.options[index];
        const feedback = document.getElementById('selectionFeedback');
        
        feedback.innerHTML = `
            <p class="${option.correct ? 'correct' : 'incorrect'}">
                ${option.correct ? '¡Correcto!' : 'Intenta de nuevo'}
            </p>
            <p>${option.explanation}</p>
        `;
        
        if (option.correct) {
            setTimeout(() => this.completeGame(), 2000);
        }
    }
    
    initSequenceGame(container, content) {
        this.gameState = {
            steps: window.shuffleArray([...content.steps]),
            correctOrder: content.correct,
            currentOrder: [],
            title: content.title
        };
        
        container.innerHTML = `
            <div class="sequence-game">
                <h3>${content.title}</h3>
                <p>Ordena los pasos en la secuencia correcta:</p>
                <div class="sequence-steps">
                    ${this.gameState.steps.map((step, index) => `
                        <div class="sequence-step" data-step="${step}" onclick="gameEngine.selectStep('${step}')">
                            ${step}
                        </div>
                    `).join('')}
                </div>
                <div class="sequence-result" id="sequenceResult">
                    <h4>Tu secuencia:</h4>
                    <ol id="sequenceOrder"></ol>
                </div>
            </div>
        `;
    }
    
    selectStep(step) {
        const stepElement = document.querySelector(`[data-step="${step}"]`);
        
        if (stepElement.classList.contains('used')) return;
        
        stepElement.classList.add('used');
        this.gameState.currentOrder.push(step);
        
        this.updateSequenceResult();
        
        if (this.gameState.currentOrder.length === this.gameState.steps.length) {
            this.checkSequenceComplete();
        }
    }
    
    updateSequenceResult() {
        const orderList = document.getElementById('sequenceOrder');
        orderList.innerHTML = this.gameState.currentOrder.map(step => 
            `<li>${step}</li>`
        ).join('');
    }
    
    checkSequenceComplete() {
        // For simplicity, any complete sequence is considered correct in this context
        // as the focus is on reflection rather than exact order
        document.getElementById('sequenceResult').classList.add('complete');
        setTimeout(() => this.completeGame(), 1000);
    }
    
    initPatternGame(container, content) {
        this.gameState = {
            patterns: content.patterns || content.solutions,
            title: content.title,
            identified: []
        };
        
        container.innerHTML = `
            <div class="pattern-game">
                <h3>Identifica los patrones: ${content.title}</h3>
                <div class="pattern-items">
                    ${this.gameState.patterns.map((pattern, index) => `
                        <div class="pattern-item" data-index="${index}" onclick="gameEngine.identifyPattern(${index})">
                            ${pattern}
                        </div>
                    `).join('')}
                </div>
                <p class="pattern-instruction">Haz clic en cada patrón que reconozcas en tu vida</p>
                <p>Identificados: <span id="patternCount">0</span>/${this.gameState.patterns.length}</p>
            </div>
        `;
    }
    
    identifyPattern(index) {
        if (this.gameState.identified.includes(index)) return;
        
        const item = document.querySelector(`[data-index="${index}"]`);
        item.classList.add('identified');
        
        this.gameState.identified.push(index);
        document.getElementById('patternCount').textContent = this.gameState.identified.length;
        
        if (this.gameState.identified.length === this.gameState.patterns.length) {
            setTimeout(() => this.completeGame(), 1000);
        }
    }
    
    initDefaultGame(container) {
        container.innerHTML = `
            <div class="default-game">
                <h3>Reflexión de Consciencia</h3>
                <p>Tómate un momento para reflexionar sobre esta pregunta de abundancia.</p>
                <div class="reflection-timer">
                    <div class="timer-circle"></div>
                    <p>Tiempo de reflexión: <span id="reflectionTime">30</span> segundos</p>
                </div>
            </div>
        `;
        
        this.startReflectionTimer();
    }
    
    startReflectionTimer() {
        let timeLeft = 30;
        const timer = setInterval(() => {
            timeLeft--;
            const timeElement = document.getElementById('reflectionTime');
            if (timeElement) {
                timeElement.textContent = timeLeft;
            }
            
            if (timeLeft <= 0) {
                clearInterval(timer);
                this.completeGame();
            }
        }, 1000);
    }
    
    startGameTimer() {
        this.startTime = Date.now();
        this.gameTimer = setInterval(() => {
            this.updateTimerDisplay();
        }, 1000);
    }
    
    updateTimerDisplay() {
        const elapsed = Date.now() - this.startTime;
        const minutes = Math.floor(elapsed / 60000);
        const seconds = Math.floor((elapsed % 60000) / 1000);
        
        const timerElement = document.getElementById('gameTimer');
        if (timerElement) {
            timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
    }
    
    initializeControls() {
        const submitBtn = document.getElementById('submitBtn');
        if (submitBtn) {
            submitBtn.addEventListener('click', () => this.submitGame());
        }
    }
    
    submitGame() {
        if (!this.gameCompleted) {
            this.completeGame();
        }
    }
    
    resetGame() {
        // Reset game state and reinitialize
        this.gameCompleted = false;
        this.gameState = {};
        this.initializeGameType();
        
        const submitBtn = document.getElementById('submitBtn');
        if (submitBtn) {
            submitBtn.disabled = true;
        }
    }
    
    completeGame() {
        if (this.gameCompleted) return;
        
        this.gameCompleted = true;
        clearInterval(this.gameTimer);
        
        // Enable submit button
        const submitBtn = document.getElementById('submitBtn');
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-check"></i> ¡Completado!';
        }
        
        // Show question after a brief delay
        setTimeout(() => {
            this.showQuestion();
        }, 1000);
    }
    
    showQuestion() {
        const modal = document.getElementById('questionModal');
        const questionText = document.getElementById('questionText');
        
        if (modal && questionText) {
            questionText.textContent = this.currentGame.question;
            modal.classList.add('show');
        }
    }
    
    getCompletionTime() {
        const elapsed = Date.now() - this.startTime;
        const minutes = Math.floor(elapsed / 60000);
        const seconds = Math.floor((elapsed % 60000) / 1000);
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
}

// Global functions for modal interactions
function skipReflection() {
    const modal = document.getElementById('questionModal');
    if (modal) {
        modal.classList.remove('show');
    }
    
    // Update progress and show success
    if (window.updateProgress) {
        window.updateProgress(gameEngine.currentGame.id);
    }
    
    showSuccessModal();
}

function saveReflection() {
    const reflectionText = document.getElementById('reflectionText');
    const reflection = reflectionText ? reflectionText.value.trim() : '';
    
    const modal = document.getElementById('questionModal');
    if (modal) {
        modal.classList.remove('show');
    }
    
    // Update progress with reflection
    if (window.updateProgress) {
        window.updateProgress(gameEngine.currentGame.id, reflection);
    }
    
    showSuccessModal();
}

function showSuccessModal() {
    const modal = document.getElementById('successModal');
    const completionTime = document.getElementById('completionTime');
    const totalCompleted = document.getElementById('totalCompleted');
    
    if (modal && completionTime && totalCompleted) {
        completionTime.textContent = gameEngine.getCompletionTime();
        
        const completed = window.getCompletedGames ? window.getCompletedGames().length : 1;
        totalCompleted.textContent = completed;
        
        modal.classList.add('show');
    }
}

function goToGames() {
    window.location.href = 'games.html';
}

function nextGame() {
    const currentId = gameEngine.currentGame.id;
    const nextId = currentId < 30 ? currentId + 1 : 1;
    
    // Check if next game is completed
    const completedGames = window.getCompletedGames ? window.getCompletedGames() : [];
    
    // Find next uncompleted game
    let targetId = nextId;
    for (let i = 0; i < 30; i++) {
        const checkId = (nextId + i - 1) % 30 + 1;
        if (!completedGames.includes(checkId)) {
            targetId = checkId;
            break;
        }
    }
    
    window.location.href = `game.html?id=${targetId}`;
}

// Initialize game engine
const gameEngine = new GameEngine();

// Visual Effects Functions
GameEngine.prototype.createSparkEffect = function(element) {
    const rect = element.getBoundingClientRect();
    const container = document.body;
    
    for (let i = 0; i < 8; i++) {
        const spark = document.createElement('div');
        spark.className = 'spark-particle';
        spark.style.cssText = `
            position: fixed;
            left: ${rect.left + rect.width / 2}px;
            top: ${rect.top + rect.height / 2}px;
            width: 4px;
            height: 4px;
            background: var(--gold-primary);
            border-radius: 50%;
            pointer-events: none;
            z-index: 1000;
        `;
        
        const angle = (i / 8) * Math.PI * 2;
        const distance = 50 + Math.random() * 50;
        const duration = 0.6 + Math.random() * 0.4;
        
        spark.animate([
            { 
                transform: 'translate(0, 0) scale(1)',
                opacity: 1
            },
            { 
                transform: `translate(${Math.cos(angle) * distance}px, ${Math.sin(angle) * distance}px) scale(0)`,
                opacity: 0
            }
        ], {
            duration: duration * 1000,
            easing: 'ease-out'
        }).addEventListener('finish', () => {
            spark.remove();
        });
        
        container.appendChild(spark);
    }
};

GameEngine.prototype.createMatchEffect = function(element) {
    const rect = element.getBoundingClientRect();
    const container = document.body;
    
    // Create golden ring effect
    const ring = document.createElement('div');
    ring.style.cssText = `
        position: fixed;
        left: ${rect.left + rect.width / 2 - 30}px;
        top: ${rect.top + rect.height / 2 - 30}px;
        width: 60px;
        height: 60px;
        border: 3px solid var(--gold-primary);
        border-radius: 50%;
        pointer-events: none;
        z-index: 1000;
    `;
    
    ring.animate([
        { 
            transform: 'scale(0) rotate(0deg)',
            opacity: 1
        },
        { 
            transform: 'scale(2) rotate(360deg)',
            opacity: 0
        }
    ], {
        duration: 800,
        easing: 'ease-out'
    }).addEventListener('finish', () => {
        ring.remove();
    });
    
    container.appendChild(ring);
};

GameEngine.prototype.createCelebrationEffect = function() {
    const container = document.body;
    
    // Create multiple confetti particles
    for (let i = 0; i < 30; i++) {
        const confetti = document.createElement('div');
        const colors = ['var(--gold-primary)', 'var(--green-primary)', 'var(--purple-primary)'];
        
        confetti.style.cssText = `
            position: fixed;
            left: ${Math.random() * window.innerWidth}px;
            top: -10px;
            width: ${Math.random() * 8 + 4}px;
            height: ${Math.random() * 8 + 4}px;
            background: ${colors[Math.floor(Math.random() * colors.length)]};
            border-radius: ${Math.random() > 0.5 ? '50%' : '0'};
            pointer-events: none;
            z-index: 1000;
        `;
        
        const fallDistance = window.innerHeight + 100;
        const duration = 2000 + Math.random() * 1000;
        const rotation = Math.random() * 720;
        
        confetti.animate([
            { 
                transform: `translateY(0) rotate(0deg)`,
                opacity: 1
            },
            { 
                transform: `translateY(${fallDistance}px) rotate(${rotation}deg)`,
                opacity: 0
            }
        ], {
            duration: duration,
            easing: 'linear'
        }).addEventListener('finish', () => {
            confetti.remove();
        });
        
        container.appendChild(confetti);
    }
};

GameEngine.prototype.showFloatingMessage = function(message, type = 'info') {
    const messageEl = document.createElement('div');
    const colors = {
        success: 'var(--green-primary)',
        info: 'var(--gold-primary)',
        error: '#ff6b6b'
    };
    
    messageEl.style.cssText = `
        position: fixed;
        top: 20%;
        left: 50%;
        transform: translateX(-50%);
        background: ${colors[type] || colors.info};
        color: var(--bg-primary);
        padding: 1rem 2rem;
        border-radius: var(--radius-lg);
        font-weight: bold;
        font-size: 1.2rem;
        z-index: 2000;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        pointer-events: none;
    `;
    
    messageEl.textContent = message;
    
    messageEl.animate([
        { 
            opacity: 0,
            transform: 'translateX(-50%) translateY(-20px) scale(0.8)'
        },
        { 
            opacity: 1,
            transform: 'translateX(-50%) translateY(0) scale(1)'
        },
        { 
            opacity: 1,
            transform: 'translateX(-50%) translateY(0) scale(1)'
        },
        { 
            opacity: 0,
            transform: 'translateX(-50%) translateY(-20px) scale(0.8)'
        }
    ], {
        duration: 2000,
        easing: 'ease-in-out'
    }).addEventListener('finish', () => {
        messageEl.remove();
    });
    
    document.body.appendChild(messageEl);
};

// Make functions globally available
window.gameEngine = gameEngine;
window.skipReflection = skipReflection;
window.saveReflection = saveReflection;
window.showSuccessModal = showSuccessModal;
window.goToGames = goToGames;
window.nextGame = nextGame;
