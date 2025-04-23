// Motivational quotes
const quotes = [
    "Small steps lead to big changes. Keep going!",
    "Consistency is the key to success.",
    "Every day is a new opportunity to grow.",
    "You're stronger than you think.",
    "Progress, not perfection."
];

// State management
let habits = JSON.parse(localStorage.getItem('habits')) || [];
let currentDate = new Date();
let currentMonth = currentDate.getMonth();
let currentYear = currentDate.getFullYear();

// Additional state management
let historyChart = null;
let communityStats = {
    averageStreak: 0,
    topStreak: 0
};

// DOM Elements
const habitsContainer = document.getElementById('habits-container');
const calendarContainer = document.getElementById('calendar-container');
const currentMonthDisplay = document.getElementById('current-month');
const addHabitBtn = document.getElementById('add-habit-btn');
const habitNameInput = document.getElementById('habit-name');
const habitEmojiInput = document.getElementById('habit-emoji');
const themeToggle = document.querySelector('.theme-toggle');
const quoteText = document.getElementById('quote-text');

// Additional DOM Elements
const exportDataBtn = document.getElementById('export-data');
const goalsContainer = document.getElementById('goals-container');
const historyHabitSelect = document.getElementById('history-habit-select');
const historyPeriodSelect = document.getElementById('history-period-select');
const historyChartCanvas = document.getElementById('history-chart');
const shareProgressBtn = document.getElementById('share-progress');
const avgStreakDisplay = document.getElementById('avg-streak');
const topStreakDisplay = document.getElementById('top-streak');

// Initialize the app
function init() {
    renderHabits();
    renderCalendar();
    updateStats();
    setRandomQuote();
    setupEventListeners();
    checkTheme();
    renderGoals();
    setupHistoryChart();
    updateCommunityStats();
}

// Event Listeners
function setupEventListeners() {
    addHabitBtn.addEventListener('click', addHabit);
    document.getElementById('prev-month').addEventListener('click', () => navigateMonth(-1));
    document.getElementById('next-month').addEventListener('click', () => navigateMonth(1));
    themeToggle.addEventListener('click', toggleTheme);
    exportDataBtn.addEventListener('click', exportData);
    historyHabitSelect.addEventListener('change', updateHistoryChart);
    historyPeriodSelect.addEventListener('change', updateHistoryChart);
    shareProgressBtn.addEventListener('click', shareProgress);
}

// Habit Management
function addHabit() {
    const name = habitNameInput.value.trim();
    const emoji = habitEmojiInput.value.trim();
    const goal = parseInt(habitGoalInput.value) || 7;
    
    if (!name) return;
    
    const newHabit = {
        id: Date.now(),
        name,
        emoji,
        goal,
        completedDates: [],
        streak: 0,
        bestStreak: 0,
        weeklyProgress: []
    };
    
    habits.push(newHabit);
    saveHabits();
    renderHabits();
    renderGoals();
    updateHistoryChart();
    
    habitNameInput.value = '';
    habitEmojiInput.value = '';
    habitGoalInput.value = '';
}

function toggleHabitCompletion(habitId) {
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return;
    
    const today = new Date().toISOString().split('T')[0];
    const index = habit.completedDates.indexOf(today);
    
    if (index === -1) {
        habit.completedDates.push(today);
    } else {
        habit.completedDates.splice(index, 1);
    }
    
    updateStreak(habit);
    saveHabits();
    renderHabits();
    renderGoals();
    updateStats();
    updateHistoryChart();
    updateCommunityStats();
}

function updateStreak(habit) {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const todayStr = today.toISOString().split('T')[0];
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    if (habit.completedDates.includes(todayStr)) {
        if (habit.completedDates.includes(yesterdayStr)) {
            habit.streak++;
        } else {
            habit.streak = 1;
        }
    } else {
        habit.streak = 0;
    }
    
    if (habit.streak > habit.bestStreak) {
        habit.bestStreak = habit.streak;
    }
}

// Calendar Management
function renderCalendar() {
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    
    currentMonthDisplay.textContent = new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long', year: 'numeric' });
    
    calendarContainer.innerHTML = '';
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDay; i++) {
        const emptyCell = document.createElement('div');
        emptyCell.className = 'calendar-day empty';
        calendarContainer.appendChild(emptyCell);
    }
    
    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
        const dayCell = document.createElement('div');
        dayCell.className = 'calendar-day';
        dayCell.textContent = day;
        
        const dateStr = new Date(currentYear, currentMonth, day).toISOString().split('T')[0];
        const isCompleted = habits.some(habit => habit.completedDates.includes(dateStr));
        
        if (isCompleted) {
            dayCell.classList.add('completed');
        }
        
        calendarContainer.appendChild(dayCell);
    }
}

function navigateMonth(direction) {
    currentMonth += direction;
    if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    } else if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    }
    renderCalendar();
}

// UI Rendering
function renderHabits() {
    habitsContainer.innerHTML = '';
    
    habits.forEach(habit => {
        const habitCard = document.createElement('div');
        habitCard.className = 'habit-card';
        
        const today = new Date().toISOString().split('T')[0];
        const isCompleted = habit.completedDates.includes(today);
        
        if (isCompleted) {
            habitCard.classList.add('completed');
        }
        
        habitCard.innerHTML = `
            <span class="habit-emoji">${habit.emoji}</span>
            <span class="habit-name">${habit.name}</span>
            <span class="habit-streak">${habit.streak} 🔥</span>
        `;
        
        habitCard.addEventListener('click', () => toggleHabitCompletion(habit.id));
        habitsContainer.appendChild(habitCard);
    });
}

function updateStats() {
    const currentStreak = Math.max(...habits.map(h => h.streak));
    const bestStreak = Math.max(...habits.map(h => h.bestStreak));
    const completionRate = calculateCompletionRate();
    
    document.getElementById('current-streak').textContent = `${currentStreak} 🔥`;
    document.getElementById('best-streak').textContent = `${bestStreak} 🔥`;
    document.getElementById('completion-rate').textContent = `${completionRate}%`;
}

function calculateCompletionRate() {
    if (habits.length === 0) return 0;
    
    const today = new Date().toISOString().split('T')[0];
    const completedToday = habits.filter(h => h.completedDates.includes(today)).length;
    return Math.round((completedToday / habits.length) * 100);
}

// Theme Management
function checkTheme() {
    const isDark = localStorage.getItem('theme') === 'dark';
    document.body.setAttribute('data-theme', isDark ? 'dark' : 'light');
    themeToggle.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
}

function toggleTheme() {
    const isDark = document.body.getAttribute('data-theme') === 'dark';
    document.body.setAttribute('data-theme', isDark ? 'light' : 'dark');
    localStorage.setItem('theme', isDark ? 'light' : 'dark');
    themeToggle.innerHTML = isDark ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';
}

// Utility Functions
function saveHabits() {
    localStorage.setItem('habits', JSON.stringify(habits));
}

function setRandomQuote() {
    const randomIndex = Math.floor(Math.random() * quotes.length);
    quoteText.textContent = quotes[randomIndex];
}

// Goals Management
function renderGoals() {
    goalsContainer.innerHTML = '';
    
    habits.forEach(habit => {
        const goalCard = document.createElement('div');
        goalCard.className = 'goal-card';
        
        const progress = calculateWeeklyProgress(habit);
        const progressPercent = (progress / habit.goal) * 100;
        
        goalCard.innerHTML = `
            <h3>${habit.emoji} ${habit.name}</h3>
            <div class="goal-progress">
                <div class="goal-progress-bar" style="width: ${progressPercent}%"></div>
            </div>
            <p>${progress} of ${habit.goal} days completed this week</p>
        `;
        
        goalsContainer.appendChild(goalCard);
    });
}

function calculateWeeklyProgress(habit) {
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    
    return habit.completedDates.filter(date => {
        const habitDate = new Date(date);
        return habitDate >= weekStart && habitDate <= today;
    }).length;
}

// History Management
function setupHistoryChart() {
    const ctx = historyChartCanvas.getContext('2d');
    historyChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Completion Rate',
                data: [],
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100
                }
            }
        }
    });
    
    updateHistoryChart();
}

function updateHistoryChart() {
    const selectedHabit = historyHabitSelect.value;
    const period = historyPeriodSelect.value;
    
    let data = [];
    let labels = [];
    
    const today = new Date();
    const startDate = new Date(today);
    
    switch (period) {
        case 'week':
            startDate.setDate(today.getDate() - 7);
            break;
        case 'month':
            startDate.setMonth(today.getMonth() - 1);
            break;
        case 'year':
            startDate.setFullYear(today.getFullYear() - 1);
            break;
    }
    
    const habitsToShow = selectedHabit === 'all' ? habits : habits.filter(h => h.id === parseInt(selectedHabit));
    
    for (let d = new Date(startDate); d <= today; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        const completed = habitsToShow.filter(h => h.completedDates.includes(dateStr)).length;
        const total = habitsToShow.length;
        const rate = total ? (completed / total) * 100 : 0;
        
        data.push(rate);
        labels.push(d.toLocaleDateString('default', { month: 'short', day: 'numeric' }));
    }
    
    historyChart.data.labels = labels;
    historyChart.data.datasets[0].data = data;
    historyChart.update();
}

// Social Features
function updateCommunityStats() {
    // In a real app, this would fetch from a backend
    // For now, we'll simulate with local data
    const streaks = habits.map(h => h.streak);
    communityStats.averageStreak = Math.round(streaks.reduce((a, b) => a + b, 0) / streaks.length) || 0;
    communityStats.topStreak = Math.max(...streaks) || 0;
    
    avgStreakDisplay.textContent = communityStats.averageStreak;
    topStreakDisplay.textContent = communityStats.topStreak;
}

function shareProgress() {
    const progress = {
        habits: habits.map(h => ({
            name: h.name,
            streak: h.streak,
            bestStreak: h.bestStreak
        })),
        stats: {
            currentStreak: Math.max(...habits.map(h => h.streak)),
            bestStreak: Math.max(...habits.map(h => h.bestStreak)),
            completionRate: calculateCompletionRate()
        }
    };
    
    const shareText = `Check out my habit tracking progress! 🚀\n\n` +
        `Current Streak: ${progress.stats.currentStreak} 🔥\n` +
        `Best Streak: ${progress.stats.bestStreak} 🔥\n` +
        `Completion Rate: ${progress.stats.completionRate}%\n\n` +
        `Tracked with Micro-Habit Tracker`;
    
    if (navigator.share) {
        navigator.share({
            title: 'My Habit Progress',
            text: shareText
        });
    } else {
        // Fallback for browsers that don't support Web Share API
        navigator.clipboard.writeText(shareText).then(() => {
            alert('Progress copied to clipboard!');
        });
    }
}

// Data Export
function exportData() {
    const data = {
        habits,
        lastUpdated: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `habit-tracker-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Initialize the app
init(); 