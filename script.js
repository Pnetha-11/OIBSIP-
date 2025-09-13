// Task Management System
class TaskManager {
    constructor() {
        this.tasks = this.loadTasks();
        this.currentFilter = 'all';
        this.searchQuery = '';
        this.editingTaskId = null;
        
        this.initializeElements();
        this.bindEvents();
        this.render();
    }

    initializeElements() {
        // Input elements
        this.newTaskInput = document.getElementById('newTaskInput');
        this.searchInput = document.getElementById('searchInput');
        this.filterSelect = document.getElementById('filterSelect');
        this.editTaskInput = document.getElementById('editTaskInput');

        // Button elements
        this.addTaskBtn = document.getElementById('addTaskBtn');
        this.saveEditBtn = document.getElementById('saveEditBtn');
        this.cancelEditBtn = document.getElementById('cancelEditBtn');
        this.closeModalBtn = document.getElementById('closeModal');

        // Display elements
        this.tasksContainer = document.getElementById('tasksContainer');
        this.emptyState = document.getElementById('emptyState');
        this.totalCount = document.getElementById('totalCount');
        this.pendingCount = document.getElementById('pendingCount');
        this.completedCount = document.getElementById('completedCount');
        this.sectionTitle = document.getElementById('sectionTitle');
        this.taskCount = document.getElementById('taskCount');
        this.progressSection = document.getElementById('progressSection');
        this.progressFill = document.getElementById('progressFill');
        this.progressPercentage = document.getElementById('progressPercentage');

        // Modal elements
        this.editModal = document.getElementById('editModal');
    }

    bindEvents() {
        // Add task events
        this.addTaskBtn.addEventListener('click', () => this.addTask());
        this.newTaskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTask();
        });

        // Search and filter events
        this.searchInput.addEventListener('input', (e) => {
            this.searchQuery = e.target.value.toLowerCase();
            this.render();
        });

        this.filterSelect.addEventListener('change', (e) => {
            this.currentFilter = e.target.value;
            this.render();
        });

        // Modal events
        this.saveEditBtn.addEventListener('click', () => this.saveEdit());
        this.cancelEditBtn.addEventListener('click', () => this.closeEditModal());
        this.closeModalBtn.addEventListener('click', () => this.closeEditModal());
        
        this.editModal.addEventListener('click', (e) => {
            if (e.target === this.editModal) this.closeEditModal();
        });

        this.editTaskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.saveEdit();
            if (e.key === 'Escape') this.closeEditModal();
        });

        // Prevent modal close when clicking inside modal content
        document.querySelector('.modal').addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }

    loadTasks() {
        const saved = localStorage.getItem('todoTasks');
        if (saved) {
            return JSON.parse(saved).map(task => ({
                ...task,
                createdAt: new Date(task.createdAt),
                completedAt: task.completedAt ? new Date(task.completedAt) : null,
                updatedAt: task.updatedAt ? new Date(task.updatedAt) : null
            }));
        }
        return [];
    }

    saveTasks() {
        localStorage.setItem('todoTasks', JSON.stringify(this.tasks));
    }

    generateId() {
        return Date.now().toString() + Math.random().toString(36).substr(2, 9);
    }

    addTask() {
        const text = this.newTaskInput.value.trim();
        if (!text) return;

        const task = {
            id: this.generateId(),
            text: text,
            completed: false,
            createdAt: new Date(),
            completedAt: null,
            updatedAt: null
        };

        this.tasks.unshift(task);
        this.newTaskInput.value = '';
        this.saveTasks();
        this.render();

        // Add animation effect
        setTimeout(() => {
            const taskElement = document.querySelector(`[data-task-id="${task.id}"]`);
            if (taskElement) {
                taskElement.style.animation = 'slideInUp 0.5s ease';
            }
        }, 100);
    }

    toggleTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            task.completedAt = task.completed ? new Date() : null;
            this.saveTasks();
            this.render();
        }
    }

    deleteTask(id) {
        const taskElement = document.querySelector(`[data-task-id="${id}"]`);
        if (taskElement) {
            taskElement.classList.add('removing');
            setTimeout(() => {
                this.tasks = this.tasks.filter(t => t.id !== id);
                this.saveTasks();
                this.render();
            }, 300);
        }
    }

    editTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (task && !task.completed) {
            this.editingTaskId = id;
            this.editTaskInput.value = task.text;
            this.openEditModal();
        }
    }

    saveEdit() {
        const newText = this.editTaskInput.value.trim();
        if (!newText || !this.editingTaskId) return;

        const task = this.tasks.find(t => t.id === this.editingTaskId);
        if (task) {
            task.text = newText;
            task.updatedAt = new Date();
            this.saveTasks();
            this.render();
        }

        this.closeEditModal();
    }

    openEditModal() {
        this.editModal.classList.add('active');
        setTimeout(() => {
            this.editTaskInput.focus();
            this.editTaskInput.select();
        }, 100);
    }

    closeEditModal() {
        this.editModal.classList.remove('active');
        this.editingTaskId = null;
        this.editTaskInput.value = '';
    }

    formatDateTime(date) {
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        }).format(date);
    }

    getFilteredTasks() {
        let filtered = this.tasks;

        // Apply filter
        if (this.currentFilter === 'pending') {
            filtered = filtered.filter(task => !task.completed);
        } else if (this.currentFilter === 'completed') {
            filtered = filtered.filter(task => task.completed);
        }

        // Apply search
        if (this.searchQuery) {
            filtered = filtered.filter(task =>
                task.text.toLowerCase().includes(this.searchQuery)
            );
        }

        return filtered;
    }

    updateStats() {
        const total = this.tasks.length;
        const pending = this.tasks.filter(t => !t.completed).length;
        const completed = this.tasks.filter(t => t.completed).length;

        this.totalCount.textContent = total;
        this.pendingCount.textContent = pending;
        this.completedCount.textContent = completed;

        // Update progress
        if (total > 0) {
            const percentage = Math.round((completed / total) * 100);
            this.progressFill.style.width = `${percentage}%`;
            this.progressPercentage.textContent = `${percentage}%`;
            this.progressSection.style.display = 'block';
        } else {
            this.progressSection.style.display = 'none';
        }
    }

    updateSectionTitle() {
        const filteredTasks = this.getFilteredTasks();
        let title = 'All Tasks';
        
        if (this.currentFilter === 'pending') {
            title = 'Pending Tasks';
        } else if (this.currentFilter === 'completed') {
            title = 'Completed Tasks';
        }

        this.sectionTitle.textContent = title;
        this.taskCount.textContent = `(${filteredTasks.length})`;
    }

    createTaskElement(task) {
        const taskDiv = document.createElement('div');
        taskDiv.className = `task-item ${task.completed ? 'completed' : ''}`;
        taskDiv.setAttribute('data-task-id', task.id);

        const metaItems = [];
        
        // Created date
        metaItems.push(`
            <div class="task-meta-item">
                <i class="fas fa-clock"></i>
                <span>Created: ${this.formatDateTime(task.createdAt)}</span>
            </div>
        `);

        // Completed date
        if (task.completedAt) {
            metaItems.push(`
                <div class="task-meta-item">
                    <i class="fas fa-check" style="color: #10b981;"></i>
                    <span>Completed: ${this.formatDateTime(task.completedAt)}</span>
                </div>
            `);
        }

        // Updated date
        if (task.updatedAt) {
            metaItems.push(`
                <div class="task-meta-item">
                    <i class="fas fa-edit" style="color: #f59e0b;"></i>
                    <span>Updated: ${this.formatDateTime(task.updatedAt)}</span>
                </div>
            `);
        }

        taskDiv.innerHTML = `
            <div class="task-checkbox ${task.completed ? 'completed' : ''}" onclick="taskManager.toggleTask('${task.id}')">
                ${task.completed ? '<i class="fas fa-check"></i>' : ''}
            </div>
            <div class="task-content">
                <div class="task-text ${task.completed ? 'completed' : ''}" onclick="taskManager.editTask('${task.id}')" title="Click to edit">
                    ${this.escapeHtml(task.text)}
                </div>
                <div class="task-meta">
                    ${metaItems.join('')}
                </div>
            </div>
            <div class="task-actions">
                ${!task.completed ? `
                    <button class="task-action-btn edit-btn" onclick="taskManager.editTask('${task.id}')" title="Edit task">
                        <i class="fas fa-edit"></i>
                    </button>
                ` : ''}
                <button class="task-action-btn delete-btn" onclick="taskManager.deleteTask('${task.id}')" title="Delete task">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;

        return taskDiv;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    render() {
        const filteredTasks = this.getFilteredTasks();
        
        // Clear container
        this.tasksContainer.innerHTML = '';

        if (filteredTasks.length === 0) {
            const emptyMessage = this.searchQuery 
                ? 'No tasks match your search.' 
                : 'No tasks yet. Add one above!';
            
            this.tasksContainer.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">
                        <i class="fas fa-calendar-alt"></i>
                    </div>
                    <p class="empty-message">${emptyMessage}</p>
                </div>
            `;
        } else {
            filteredTasks.forEach(task => {
                const taskElement = this.createTaskElement(task);
                this.tasksContainer.appendChild(taskElement);
            });
        }

        this.updateStats();
        this.updateSectionTitle();
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.taskManager = new TaskManager();
});

// Add some sample tasks for demonstration (only if no tasks exist)
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        if (window.taskManager && window.taskManager.tasks.length === 0) {
            // Add sample tasks
            const sampleTasks = [
                'Complete the project documentation',
                'Review code changes',
                'Prepare presentation for Monday meeting',
                'Update website design',
                'Call client about requirements'
            ];

            sampleTasks.forEach((taskText, index) => {
                const task = {
                    id: `sample-${index}`,
                    text: taskText,
                    completed: index < 2, // Mark first 2 as completed
                    createdAt: new Date(Date.now() - (index * 24 * 60 * 60 * 1000)), // Spread over days
                    completedAt: index < 2 ? new Date(Date.now() - ((index + 1) * 12 * 60 * 60 * 1000)) : null,
                    updatedAt: null
                };
                window.taskManager.tasks.push(task);
            });

            window.taskManager.saveTasks();
            window.taskManager.render();
        }
    }, 500);
});