// Authentication and user management

class AuthManager {
    constructor() {
        this.currentUser = null;
        this.init();
    }
    
    init() {
        // Check if user is already logged in
        const savedUser = localStorage.getItem('abundanceUser');
        if (savedUser) {
            this.currentUser = JSON.parse(savedUser);
        }
        
        // Redirect logic
        this.handlePageAccess();
        
        // Initialize login form if on login page
        this.initializeLoginForm();
        
        // Update UI if user is logged in
        this.updateUserInterface();
    }
    
    handlePageAccess() {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        
        // Pages that require authentication
        const protectedPages = ['games.html', 'game.html'];
        
        // If on protected page and not logged in, redirect to login
        if (protectedPages.includes(currentPage) && !this.currentUser) {
            window.location.href = 'login.html';
            return;
        }
        
        // If on login page and already logged in, redirect to games
        if (currentPage === 'login.html' && this.currentUser) {
            window.location.href = 'games.html';
            return;
        }
    }
    
    initializeLoginForm() {
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }
    }
    
    handleLogin(event) {
        event.preventDefault();
        
        const formData = new FormData(event.target);
        const username = formData.get('username').trim();
        const email = formData.get('email').trim();
        
        // Basic validation
        if (!username || !email) {
            this.showMessage('Por favor, completa todos los campos.', 'error');
            return;
        }
        
        if (!this.isValidEmail(email)) {
            this.showMessage('Por favor, ingresa un email válido.', 'error');
            return;
        }
        
        // Create user object
        const user = {
            username: username,
            email: email,
            loginDate: new Date().toISOString(),
            progress: {
                completedGames: [],
                totalCompleted: 0,
                reflections: {},
                achievements: [],
                startDate: new Date().toISOString()
            }
        };
        
        // Check if user exists
        const existingUser = this.getExistingUser(email);
        if (existingUser) {
            // User exists, log them in
            this.currentUser = existingUser;
            this.currentUser.lastLogin = new Date().toISOString();
        } else {
            // New user
            this.currentUser = user;
        }
        
        // Save user data
        this.saveUserData();
        
        // Show success message
        this.showMessage('¡Bienvenido al universo de abundancia!', 'success');
        
        // Redirect after short delay
        setTimeout(() => {
            window.location.href = 'games.html';
        }, 1500);
    }
    
    getExistingUser(email) {
        // In a real app, this would check a database
        // For now, we'll check localStorage for existing users
        const allUsers = this.getAllUsers();
        return allUsers.find(user => user.email === email);
    }
    
    getAllUsers() {
        const users = localStorage.getItem('allAbundanceUsers');
        return users ? JSON.parse(users) : [];
    }
    
    saveUserData() {
        // Save current user
        localStorage.setItem('abundanceUser', JSON.stringify(this.currentUser));
        
        // Update all users list
        const allUsers = this.getAllUsers();
        const existingIndex = allUsers.findIndex(user => user.email === this.currentUser.email);
        
        if (existingIndex !== -1) {
            allUsers[existingIndex] = this.currentUser;
        } else {
            allUsers.push(this.currentUser);
        }
        
        localStorage.setItem('allAbundanceUsers', JSON.stringify(allUsers));
    }
    
    updateUserInterface() {
        const userWelcome = document.getElementById('userWelcome');
        if (userWelcome && this.currentUser) {
            userWelcome.textContent = `¡Hola, ${this.currentUser.username}!`;
        }
    }
    
    logout() {
        this.currentUser = null;
        localStorage.removeItem('abundanceUser');
        window.location.href = 'index.html';
    }
    
    getCurrentUser() {
        return this.currentUser;
    }
    
    updateProgress(gameId, reflection = null) {
        if (!this.currentUser) return;
        
        const progress = this.currentUser.progress;
        
        // Add game to completed if not already there
        if (!progress.completedGames.includes(gameId)) {
            progress.completedGames.push(gameId);
            progress.totalCompleted = progress.completedGames.length;
        }
        
        // Save reflection if provided
        if (reflection) {
            progress.reflections[gameId] = {
                text: reflection,
                date: new Date().toISOString()
            };
        }
        
        // Check for achievements
        this.checkAchievements();
        
        // Save updated data
        this.saveUserData();
    }
    
    checkAchievements() {
        const progress = this.currentUser.progress;
        const completed = progress.totalCompleted;
        const achievements = progress.achievements;
        
        // Define achievements
        const achievementMilestones = [
            { id: 'first_step', threshold: 1, title: 'Primer Paso', description: 'Completaste tu primera experiencia de consciencia' },
            { id: 'awakening', threshold: 5, title: 'Despertar', description: 'Has completado 5 experiencias. Tu consciencia se expande' },
            { id: 'transformation', threshold: 10, title: 'Transformación', description: '10 experiencias completadas. La abundancia fluye hacia ti' },
            { id: 'mastery', threshold: 20, title: 'Maestría', description: '20 experiencias completadas. Eres un maestro de la abundancia' },
            { id: 'enlightenment', threshold: 30, title: 'Iluminación', description: '¡Todas las experiencias completadas! Eres abundancia pura' }
        ];
        
        // Check for new achievements
        achievementMilestones.forEach(achievement => {
            if (completed >= achievement.threshold && !achievements.some(a => a.id === achievement.id)) {
                achievements.push({
                    ...achievement,
                    unlockedDate: new Date().toISOString()
                });
                
                // Show achievement notification
                this.showAchievement(achievement);
            }
        });
    }
    
    showAchievement(achievement) {
        // This will be handled by the games page
        if (window.showAchievementModal) {
            window.showAchievementModal(achievement);
        }
    }
    
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    showMessage(message, type) {
        // Remove existing messages
        const existingMessage = document.querySelector('.auth-message');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        // Create message element
        const messageEl = document.createElement('div');
        messageEl.className = `auth-message ${type}`;
        messageEl.textContent = message;
        
        // Style the message
        messageEl.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            border-radius: 0.5rem;
            color: white;
            font-weight: 500;
            z-index: 3000;
            animation: slideInRight 0.3s ease;
            max-width: 300px;
            ${type === 'success' 
                ? 'background: linear-gradient(135deg, #32CD32 0%, #228B22 100%);' 
                : 'background: linear-gradient(135deg, #ff6b6b 0%, #ee5a5a 100%);'
            }
        `;
        
        document.body.appendChild(messageEl);
        
        // Remove message after 3 seconds
        setTimeout(() => {
            messageEl.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (messageEl.parentNode) {
                    messageEl.parentNode.removeChild(messageEl);
                }
            }, 300);
        }, 3000);
    }
    
    getCompletedGames() {
        return this.currentUser ? this.currentUser.progress.completedGames : [];
    }
    
    getReflections() {
        return this.currentUser ? this.currentUser.progress.reflections : {};
    }
    
    getAchievements() {
        return this.currentUser ? this.currentUser.progress.achievements : [];
    }
}

// Initialize auth manager
const authManager = new AuthManager();

// Global functions for use in other scripts
window.logout = () => authManager.logout();
window.getCurrentUser = () => authManager.getCurrentUser();
window.updateProgress = (gameId, reflection) => authManager.updateProgress(gameId, reflection);
window.getCompletedGames = () => authManager.getCompletedGames();
window.getReflections = () => authManager.getReflections();
window.getAchievements = () => authManager.getAchievements();

// Add CSS for message animations
const messageStyles = `
@keyframes slideInRight {
    from {
        transform: translateX(100%);
        opacity: 0;
    }
    to {
        transform: translateX(0);
        opacity: 1;
    }
}

@keyframes slideOutRight {
    from {
        transform: translateX(0);
        opacity: 1;
    }
    to {
        transform: translateX(100%);
        opacity: 0;
    }
}
`;

const styleSheet = document.createElement('style');
styleSheet.textContent = messageStyles;
document.head.appendChild(styleSheet);
