// Games page functionality

class GamesManager {
    constructor() {
        this.games = [];
        this.currentFilter = 'all';
        this.completedGames = [];
        this.init();
    }
    
    init() {
        // Load user progress
        this.loadUserProgress();
        
        // Generate games from questions
        this.generateGames();
        
        // Update progress display
        this.updateProgressDisplay();
        
        // Initialize filter buttons
        this.initializeFilters();
        
        // Render games
        this.renderGames();
        
        // Update category counts
        this.updateCategoryCounts();
    }
    
    loadUserProgress() {
        this.completedGames = window.getCompletedGames ? window.getCompletedGames() : [];
    }
    
    generateGames() {
        if (!window.moneyQuestions) {
            console.error('Questions not loaded');
            return;
        }
        
        this.games = window.moneyQuestions.map((question, index) => ({
            id: index + 1,
            title: this.generateGameTitle(question.question, question.category),
            description: this.generateGameDescription(question.question, question.gameType),
            category: question.category,
            gameType: question.gameType,
            difficulty: question.difficulty,
            icon: this.getGameIcon(question.gameType),
            question: question.question,
            completed: this.completedGames.includes(index + 1)
        }));
    }
    
    generateGameTitle(question, category) {
        const titles = {
            energia: [
                'Vibración Abundante',
                'Energía Magnética',
                'Resonancia Dorada',
                'Campo de Prosperidad',
                'Frecuencia de Riqueza'
            ],
            creencias: [
                'Detector de Creencias',
                'Transformador Mental',
                'Limpieza de Patrones',
                'Reconfiguración Mental',
                'Liberación de Límites'
            ],
            recepcion: [
                'Portal de Recepción',
                'Expansor de Capacidad',
                'Apertura Abundante',
                'Flujo Receptivo',
                'Permitir Abundancia'
            ],
            accion: [
                'Manifestación Activa',
                'Creador de Abundancia',
                'Acción Magnética',
                'Generador de Riqueza',
                'Catalizador Próspero'
            ]
        };
        
        const categoryTitles = titles[category] || titles.energia;
        const randomIndex = Math.floor(Math.random() * categoryTitles.length);
        return categoryTitles[randomIndex];
    }
    
    generateGameDescription(question, gameType) {
        const descriptions = {
            memory: 'Fortalece tu memoria mientras integras conceptos de abundancia',
            word: 'Descifra palabras relacionadas con prosperidad y abundancia',
            matching: 'Conecta conceptos para expandir tu comprensión financiera',
            puzzle: 'Resuelve acertijos que revelan verdades sobre el dinero',
            slider: 'Organiza elementos para crear claridad en tu visión',
            sequence: 'Ordena los pasos hacia tu abundancia personal',
            pattern: 'Identifica patrones que bloquean tu prosperidad',
            selection: 'Elige sabiamente entre opciones de consciencia'
        };
        
        return descriptions[gameType] || 'Una experiencia transformadora de consciencia financiera';
    }
    
    getGameIcon(gameType) {
        const icons = {
            memory: 'fas fa-brain',
            word: 'fas fa-spell-check',
            matching: 'fas fa-link',
            puzzle: 'fas fa-puzzle-piece',
            slider: 'fas fa-sliders-h',
            sequence: 'fas fa-list-ol',
            pattern: 'fas fa-project-diagram',
            selection: 'fas fa-hand-pointer'
        };
        
        return icons[gameType] || 'fas fa-star';
    }
    
    updateProgressDisplay() {
        const progressFill = document.getElementById('progressFill');
        const completedGamesEl = document.getElementById('completedGames');
        
        if (progressFill && completedGamesEl) {
            const totalGames = 30;
            const completed = this.completedGames.length;
            const percentage = (completed / totalGames) * 100;
            
            progressFill.style.width = percentage + '%';
            completedGamesEl.textContent = completed;
        }
    }
    
    initializeFilters() {
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                // Remove active class from all buttons
                filterButtons.forEach(b => b.classList.remove('active'));
                
                // Add active class to clicked button
                btn.classList.add('active');
                
                // Update current filter
                this.currentFilter = btn.dataset.filter;
                
                // Re-render games
                this.renderGames();
            });
        });
    }
    
    renderGames() {
        const gamesContainer = document.getElementById('gamesContainer');
        if (!gamesContainer) return;
        
        // Filter games
        let filteredGames = this.games;
        if (this.currentFilter !== 'all') {
            filteredGames = this.games.filter(game => game.category === this.currentFilter);
        }
        
        // Generate HTML
        gamesContainer.innerHTML = filteredGames.map(game => `
            <div class="game-card ${game.completed ? 'completed' : ''}" 
                 onclick="playGame(${game.id})" 
                 data-category="${game.category}">
                <div class="game-header-img">
                    <i class="${game.icon}"></i>
                </div>
                <div class="game-content">
                    <h3 class="game-title">${game.title}</h3>
                    <p class="game-description">${game.description}</p>
                    <div class="game-meta">
                        <span class="game-category-tag">${this.getCategoryName(game.category)}</span>
                        <div class="game-difficulty">
                            ${this.renderDifficultyStars(game.difficulty)}
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }
    
    getCategoryName(category) {
        const names = {
            energia: 'Energía',
            creencias: 'Creencias',
            recepcion: 'Recepción',
            accion: 'Acción'
        };
        return names[category] || 'General';
    }
    
    renderDifficultyStars(difficulty) {
        const stars = [];
        for (let i = 1; i <= 3; i++) {
            const active = i <= difficulty ? 'active' : '';
            stars.push(`<div class="difficulty-star ${active}"></div>`);
        }
        return stars.join('');
    }
    
    updateCategoryCounts() {
        const categories = ['energia', 'creencias', 'recepcion', 'accion'];
        
        categories.forEach(category => {
            const categoryCard = document.querySelector(`[data-category="${category}"]`);
            const countEl = categoryCard?.querySelector('.category-count');
            
            if (countEl) {
                const categoryGames = this.games.filter(game => game.category === category);
                const completedInCategory = categoryGames.filter(game => game.completed).length;
                const totalInCategory = categoryGames.length;
                
                countEl.textContent = `${completedInCategory}/${totalInCategory} completados`;
            }
        });
    }
    
    getGameById(id) {
        return this.games.find(game => game.id === id);
    }
}

// Achievement Modal Functions
function showAchievementModal(achievement) {
    const modal = document.getElementById('achievementModal');
    const achievementText = document.getElementById('achievementText');
    
    if (modal && achievementText) {
        achievementText.innerHTML = `
            <h4>${achievement.title}</h4>
            <p>${achievement.description}</p>
        `;
        modal.classList.add('show');
    }
}

function closeAchievementModal() {
    const modal = document.getElementById('achievementModal');
    if (modal) {
        modal.classList.remove('show');
    }
}

// Global functions
function playGame(gameId) {
    window.location.href = `game.html?id=${gameId}`;
}

// Initialize games manager
let gamesManager;

document.addEventListener('DOMContentLoaded', function() {
    gamesManager = new GamesManager();
    
    // Make showAchievementModal available globally for auth.js
    window.showAchievementModal = showAchievementModal;
});

// Export for use in other files
window.getGameById = (id) => gamesManager ? gamesManager.getGameById(id) : null;
