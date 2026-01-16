# MVC Implementation Guide - Day 2

## Overview

This guide walks you through implementing the Model-View-Controller (MVC) architectural pattern in your task management application. You'll learn how to properly separate concerns, create maintainable code, and build a scalable architecture.

## MVC Architecture Recap

### The Three Components

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│    View     │◄──►│ Controller  │◄──►│    Model    │
│ (UI Layer)  │    │ (Logic)     │    │ (Data)      │
└─────────────┘    └─────────────┘    └─────────────┘
```

- **Model**: Manages data and business logic
- **View**: Handles presentation and user interface
- **Controller**: Coordinates between Model and View, handles user input

### Benefits

1. **Separation of Concerns**: Each component has a single responsibility
2. **Maintainability**: Changes in one layer don't affect others
3. **Testability**: Each component can be tested independently
4. **Reusability**: Models can be used with different views
5. **Team Development**: Different developers can work on different layers

## Controller Layer Implementation

### Base Controller

First, let's create a base controller that other controllers can extend:

```javascript
/**
 * Base Controller
 * Provides common functionality for all controllers
 */
class BaseController {
    constructor() {
        this.listeners = new Set();
    }
    
    /**
     * Add event listener
     * @param {function} listener - Callback function
     */
    addListener(listener) {
        this.listeners.add(listener);
    }
    
    /**
     * Remove event listener
     * @param {function} listener - Callback function to remove
     */
    removeListener(listener) {
        this.listeners.delete(listener);
    }
    
    /**
     * Notify all listeners of an event
     * @param {string} eventType - Type of event
     * @param {any} data - Event data
     */
    notifyListeners(eventType, data) {
        this.listeners.forEach(listener => {
            try {
                listener(eventType, data);
            } catch (error) {
                console.error('Error in controller listener:', error);
            }
        });
    }
    
    /**
     * Handle errors consistently
     * @param {Error} error - The error to handle
     * @param {string} operation - The operation that failed
     */
    handleError(error, operation) {
        console.error(`Error in ${operation}:`, error);
        this.notifyListeners('error', {
            operation,
            error: error.message,
            timestamp: new Date()
        });
        throw error;
    }
    
    /**
     * Validate required parameters
     * @param {object} params - Parameters to validate
     * @param {string[]} required - Required parameter names
     */
    validateParams(params, required) {
        const missing = required.filter(param => 
            params[param] === undefined || params[param] === null || params[param] === ''
        );
        
        if (missing.length > 0) {
            throw new Error(`Missing required parameters: ${missing.join(', ')}`);
        }
    }
}
```

### Task Controller

```javascript
/**
 * Task Controller
 * Handles all task-related operations and coordinates between TaskService and TaskView
 */
class TaskController extends BaseController {
    constructor(taskService, userService, taskView) {
        super();
        this.taskService = taskService;
        this.userService = userService;
        this.taskView = taskView;
        this.currentUser = null;
        this.currentFilter = 'all';
        
        // Set up service listeners
        this.taskService.addListener(this.handleTaskServiceEvent.bind(this));
        
        // Set up view listeners
        this.taskView.addListener(this.handleTaskViewEvent.bind(this));
    }
    
    /**
     * Initialize the controller
     * @param {string} userId - Current user ID
     */
    async initialize(userId) {
        try {
            // Load current user
            this.currentUser = await this.userService.getUserById(userId);
            if (!this.currentUser) {
                throw new Error('User not found');
            }
            
            // Initialize view
            await this.taskView.initialize(this.currentUser);
            
            // Load and display tasks
            await this.refreshTasks();
            
            this.notifyListeners('initialized', { userId });
        } catch (error) {
            this.handleError(error, 'initialize');
        }
    }
    
    /**
     * Create a new task
     * @param {object} taskData - Task creation data
     */
    async createTask(taskData) {
        try {
            this.validateParams(taskData, ['title']);
            
            // Ensure user is set
            taskData.userId = this.currentUser.id;
            taskData.assignedTo = taskData.assignedTo || this.currentUser.id;
            
            // Create task through service
            const task = await this.taskService.createTask(taskData);
            
            // Update view
            await this.taskView.addTask(task);
            await this.updateTaskStats();
            
            this.notifyListeners('taskCreated', task);
            return task;
        } catch (error) {
            this.handleError(error, 'createTask');
        }
    }
    
    /**
     * Update an existing task
     * @param {string} taskId - Task ID
     * @param {object} updates - Updates to apply
     */
    async updateTask(taskId, updates) {
        try {
            this.validateParams({ taskId }, ['taskId']);
            
            // Check permissions
            const task = await this.taskService.getTaskById(taskId);
            if (!this.canModifyTask(task)) {
                throw new Error('Permission denied: Cannot modify this task');
            }
            
            // Update task through service
            const updatedTask = await this.taskService.updateTask(taskId, updates);
            
            // Update view
            await this.taskView.updateTask(updatedTask);
            await this.updateTaskStats();
            
            this.notifyListeners('taskUpdated', updatedTask);
            return updatedTask;
        } catch (error) {
            this.handleError(error, 'updateTask');
        }
    }
    
    /**
     * Delete a task
     * @param {string} taskId - Task ID
     */
    async deleteTask(taskId) {
        try {
            this.validateParams({ taskId }, ['taskId']);
            
            // Check permissions
            const task = await this.taskService.getTaskById(taskId);
            if (!this.canModifyTask(task)) {
                throw new Error('Permission denied: Cannot delete this task');
            }
            
            // Confirm deletion through view
            const confirmed = await this.taskView.confirmDeletion(task);
            if (!confirmed) {
                return false;
            }
            
            // Delete task through service
            const success = await this.taskService.deleteTask(taskId);
            
            if (success) {
                // Update view
                await this.taskView.removeTask(taskId);
                await this.updateTaskStats();
                
                this.notifyListeners('taskDeleted', { taskId, task });
            }
            
            return success;
        } catch (error) {
            this.handleError(error, 'deleteTask');
        }
    }
    
    /**
     * Toggle task completion status
     * @param {string} taskId - Task ID
     */
    async toggleTaskCompletion(taskId) {
        try {
            const task = await this.taskService.getTaskById(taskId);
            if (!task) {
                throw new Error('Task not found');
            }
            
            const updates = { completed: !task.completed };
            return await this.updateTask(taskId, updates);
        } catch (error) {
            this.handleError(error, 'toggleTaskCompletion');
        }
    }
    
    /**
     * Assign task to a user
     * @param {string} taskId - Task ID
     * @param {string} userId - User ID to assign to
     */
    async assignTask(taskId, userId) {
        try {
            this.validateParams({ taskId, userId }, ['taskId', 'userId']);
            
            // Validate assignee exists
            const assignee = await this.userService.getUserById(userId);
            if (!assignee) {
                throw new Error('Assignee not found');
            }
            
            return await this.updateTask(taskId, { assignedTo: userId });
        } catch (error) {
            this.handleError(error, 'assignTask');
        }
    }
    
    /**
     * Filter tasks
     * @param {string} filterType - Type of filter to apply
     * @param {any} filterValue - Filter value
     */
    async filterTasks(filterType, filterValue = null) {
        try {
            this.currentFilter = filterType;
            
            let tasks;
            switch (filterType) {
                case 'all':
                    tasks = await this.taskService.getTasksForUser(this.currentUser.id);
                    break;
                case 'pending':
                    tasks = await this.taskService.getPendingTasks(this.currentUser.id);
                    break;
                case 'completed':
                    tasks = await this.taskService.getCompletedTasks(this.currentUser.id);
                    break;
                case 'overdue':
                    tasks = await this.taskService.getOverdueTasks(this.currentUser.id);
                    break;
                case 'priority':
                    tasks = await this.taskService.getTasksByPriority(this.currentUser.id, filterValue);
                    break;
                case 'category':
                    tasks = await this.taskService.getTasksByCategory(this.currentUser.id, filterValue);
                    break;
                case 'assigned':
                    tasks = await this.taskService.getTasksAssignedToUser(this.currentUser.id);
                    break;
                default:
                    throw new Error(`Unknown filter type: ${filterType}`);
            }
            
            await this.taskView.displayTasks(tasks, filterType);
            this.notifyListeners('tasksFiltered', { filterType, filterValue, count: tasks.length });
        } catch (error) {
            this.handleError(error, 'filterTasks');
        }
    }
    
    /**
     * Search tasks
     * @param {string} query - Search query
     */
    async searchTasks(query) {
        try {
            if (!query || query.trim() === '') {
                return await this.filterTasks(this.currentFilter);
            }
            
            const tasks = await this.taskService.searchTasks(this.currentUser.id, query.trim());
            await this.taskView.displayTasks(tasks, 'search');
            
            this.notifyListeners('tasksSearched', { query, count: tasks.length });
        } catch (error) {
            this.handleError(error, 'searchTasks');
        }
    }
    
    /**
     * Refresh task list
     */
    async refreshTasks() {
        try {
            await this.filterTasks(this.currentFilter);
            await this.updateTaskStats();
        } catch (error) {
            this.handleError(error, 'refreshTasks');
        }
    }
    
    /**
     * Update task statistics display
     */
    async updateTaskStats() {
        try {
            const stats = await this.taskService.getTaskStats(this.currentUser.id);
            await this.taskView.displayStats(stats);
        } catch (error) {
            this.handleError(error, 'updateTaskStats');
        }
    }
    
    /**
     * Handle events from task service
     * @param {string} eventType - Event type
     * @param {any} data - Event data
     */
    handleTaskServiceEvent(eventType, data) {
        switch (eventType) {
            case 'taskCreated':
            case 'taskUpdated':
            case 'taskDeleted':
                // Refresh view when tasks change
                this.refreshTasks();
                break;
            case 'error':
                this.taskView.showError(data.error);
                break;
        }
    }
    
    /**
     * Handle events from task view
     * @param {string} eventType - Event type
     * @param {any} data - Event data
     */
    async handleTaskViewEvent(eventType, data) {
        try {
            switch (eventType) {
                case 'createTaskRequested':
                    await this.createTask(data);
                    break;
                case 'updateTaskRequested':
                    await this.updateTask(data.taskId, data.updates);
                    break;
                case 'deleteTaskRequested':
                    await this.deleteTask(data.taskId);
                    break;
                case 'toggleCompletionRequested':
                    await this.toggleTaskCompletion(data.taskId);
                    break;
                case 'assignTaskRequested':
                    await this.assignTask(data.taskId, data.userId);
                    break;
                case 'filterRequested':
                    await this.filterTasks(data.filterType, data.filterValue);
                    break;
                case 'searchRequested':
                    await this.searchTasks(data.query);
                    break;
                case 'refreshRequested':
                    await this.refreshTasks();
                    break;
            }
        } catch (error) {
            this.handleError(error, `handleTaskViewEvent:${eventType}`);
        }
    }
    
    /**
     * Check if current user can modify a task
     * @param {Task} task - Task to check
     * @returns {boolean} - Whether user can modify the task
     */
    canModifyTask(task) {
        if (!task || !this.currentUser) {
            return false;
        }
        
        // User can modify if they own the task or are assigned to it
        if (task.userId === this.currentUser.id || task.assignedTo === this.currentUser.id) {
            return true;
        }
        
        // Admins can modify any task
        if (this.currentUser.isAdmin) {
            return true;
        }
        
        return false;
    }
    
    /**
     * Get current user
     * @returns {User} - Current user
     */
    getCurrentUser() {
        return this.currentUser;
    }
    
    /**
     * Set current user
     * @param {string} userId - User ID
     */
    async setCurrentUser(userId) {
        await this.initialize(userId);
    }
}
```

### User Controller

```javascript
/**
 * User Controller
 * Handles user-related operations and coordinates between UserService and UserView
 */
class UserController extends BaseController {
    constructor(userService, userView) {
        super();
        this.userService = userService;
        this.userView = userView;
        this.currentUser = null;
        
        // Set up service listeners
        this.userService.addListener(this.handleUserServiceEvent.bind(this));
        
        // Set up view listeners
        this.userView.addListener(this.handleUserViewEvent.bind(this));
    }
    
    /**
     * Initialize the controller
     * @param {string} userId - Current user ID
     */
    async initialize(userId) {
        try {
            this.currentUser = await this.userService.getUserById(userId);
            if (!this.currentUser) {
                throw new Error('User not found');
            }
            
            await this.userView.initialize(this.currentUser);
            this.notifyListeners('initialized', { userId });
        } catch (error) {
            this.handleError(error, 'initialize');
        }
    }
    
    /**
     * Create a new user
     * @param {object} userData - User creation data
     */
    async createUser(userData) {
        try {
            this.validateParams(userData, ['username', 'email']);
            
            const user = await this.userService.createUser(userData);
            await this.userView.showUserCreated(user);
            
            this.notifyListeners('userCreated', user);
            return user;
        } catch (error) {
            this.handleError(error, 'createUser');
        }
    }
    
    /**
     * Update user profile
     * @param {string} userId - User ID
     * @param {object} updates - Profile updates
     */
    async updateProfile(userId, updates) {
        try {
            this.validateParams({ userId }, ['userId']);
            
            // Check permissions
            if (!this.canModifyUser(userId)) {
                throw new Error('Permission denied: Cannot modify this user');
            }
            
            const updatedUser = await this.userService.updateUser(userId, updates);
            
            // Update current user if it's the same user
            if (userId === this.currentUser.id) {
                this.currentUser = updatedUser;
            }
            
            await this.userView.showProfileUpdated(updatedUser);
            this.notifyListeners('userUpdated', updatedUser);
            
            return updatedUser;
        } catch (error) {
            this.handleError(error, 'updateProfile');
        }
    }
    
    /**
     * Handle user login
     * @param {string} username - Username
     * @param {string} password - Password (in real app, this would be handled securely)
     */
    async login(username, password) {
        try {
            this.validateParams({ username, password }, ['username', 'password']);
            
            const user = await this.userService.authenticateUser(username, password);
            if (!user) {
                throw new Error('Invalid username or password');
            }
            
            this.currentUser = user;
            await this.userView.showLoginSuccess(user);
            
            this.notifyListeners('userLoggedIn', user);
            return user;
        } catch (error) {
            this.handleError(error, 'login');
        }
    }
    
    /**
     * Handle user logout
     */
    async logout() {
        try {
            if (this.currentUser) {
                await this.userService.logoutUser(this.currentUser.id);
                await this.userView.showLogoutSuccess();
                
                const loggedOutUser = this.currentUser;
                this.currentUser = null;
                
                this.notifyListeners('userLoggedOut', loggedOutUser);
            }
        } catch (error) {
            this.handleError(error, 'logout');
        }
    }
    
    /**
     * Get user list (for admin functions)
     */
    async getUserList() {
        try {
            if (!this.currentUser || !this.currentUser.canManageUsers) {
                throw new Error('Permission denied: Cannot access user list');
            }
            
            const users = await this.userService.getAllUsers();
            await this.userView.displayUserList(users);
            
            return users;
        } catch (error) {
            this.handleError(error, 'getUserList');
        }
    }
    
    /**
     * Handle events from user service
     * @param {string} eventType - Event type
     * @param {any} data - Event data
     */
    handleUserServiceEvent(eventType, data) {
        switch (eventType) {
            case 'userCreated':
            case 'userUpdated':
                // Refresh user display if needed
                break;
            case 'error':
                this.userView.showError(data.error);
                break;
        }
    }
    
    /**
     * Handle events from user view
     * @param {string} eventType - Event type
     * @param {any} data - Event data
     */
    async handleUserViewEvent(eventType, data) {
        try {
            switch (eventType) {
                case 'createUserRequested':
                    await this.createUser(data);
                    break;
                case 'updateProfileRequested':
                    await this.updateProfile(data.userId, data.updates);
                    break;
                case 'loginRequested':
                    await this.login(data.username, data.password);
                    break;
                case 'logoutRequested':
                    await this.logout();
                    break;
                case 'userListRequested':
                    await this.getUserList();
                    break;
            }
        } catch (error) {
            this.handleError(error, `handleUserViewEvent:${eventType}`);
        }
    }
    
    /**
     * Check if current user can modify another user
     * @param {string} userId - User ID to check
     * @returns {boolean} - Whether current user can modify the user
     */
    canModifyUser(userId) {
        if (!this.currentUser) {
            return false;
        }
        
        // Users can modify their own profile
        if (userId === this.currentUser.id) {
            return true;
        }
        
        // Admins can modify any user
        if (this.currentUser.canManageUsers) {
            return true;
        }
        
        return false;
    }
    
    /**
     * Get current user
     * @returns {User} - Current user
     */
    getCurrentUser() {
        return this.currentUser;
    }
}
```

## View Layer Implementation

### Base View

```javascript
/**
 * Base View
 * Provides common functionality for all views
 */
class BaseView {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            throw new Error(`Container element with ID '${containerId}' not found`);
        }
        
        this.listeners = new Set();
        this.isInitialized = false;
    }
    
    /**
     * Add event listener
     * @param {function} listener - Callback function
     */
    addListener(listener) {
        this.listeners.add(listener);
    }
    
    /**
     * Remove event listener
     * @param {function} listener - Callback function to remove
     */
    removeListener(listener) {
        this.listeners.delete(listener);
    }
    
    /**
     * Notify all listeners of an event
     * @param {string} eventType - Type of event
     * @param {any} data - Event data
     */
    notifyListeners(eventType, data) {
        this.listeners.forEach(listener => {
            try {
                listener(eventType, data);
            } catch (error) {
                console.error('Error in view listener:', error);
            }
        });
    }
    
    /**
     * Create DOM element with attributes and content
     * @param {string} tag - HTML tag name
     * @param {object} attributes - Element attributes
     * @param {string|Node} content - Element content
     * @returns {HTMLElement} - Created element
     */
    createElement(tag, attributes = {}, content = '') {
        const element = document.createElement(tag);
        
        Object.keys(attributes).forEach(key => {
            if (key === 'className') {
                element.className = attributes[key];
            } else if (key === 'dataset') {
                Object.keys(attributes[key]).forEach(dataKey => {
                    element.dataset[dataKey] = attributes[key][dataKey];
                });
            } else {
                element.setAttribute(key, attributes[key]);
            }
        });
        
        if (typeof content === 'string') {
            element.innerHTML = content;
        } else if (content instanceof Node) {
            element.appendChild(content);
        }
        
        return element;
    }
    
    /**
     * Show error message
     * @param {string} message - Error message
     */
    showError(message) {
        this.showMessage(message, 'error');
    }
    
    /**
     * Show success message
     * @param {string} message - Success message
     */
    showSuccess(message) {
        this.showMessage(message, 'success');
    }
    
    /**
     * Show info message
     * @param {string} message - Info message
     */
    showInfo(message) {
        this.showMessage(message, 'info');
    }
    
    /**
     * Show message with specified type
     * @param {string} message - Message text
     * @param {string} type - Message type (error, success, info, warning)
     */
    showMessage(message, type = 'info') {
        // Create message element
        const messageElement = this.createElement('div', {
            className: `message message-${type}`,
            role: 'alert'
        }, message);
        
        // Find or create message container
        let messageContainer = document.getElementById('messages');
        if (!messageContainer) {
            messageContainer = this.createElement('div', { id: 'messages' });
            document.body.insertBefore(messageContainer, document.body.firstChild);
        }
        
        // Add message
        messageContainer.appendChild(messageElement);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (messageElement.parentNode) {
                messageElement.parentNode.removeChild(messageElement);
            }
        }, 5000);
        
        // Add click to dismiss
        messageElement.addEventListener('click', () => {
            if (messageElement.parentNode) {
                messageElement.parentNode.removeChild(messageElement);
            }
        });
    }
    
    /**
     * Clear container content
     */
    clear() {
        this.container.innerHTML = '';
    }
    
    /**
     * Show loading state
     * @param {string} message - Loading message
     */
    showLoading(message = 'Loading...') {
        this.container.innerHTML = `
            <div class="loading">
                <div class="loading-spinner"></div>
                <div class="loading-message">${message}</div>
            </div>
        `;
    }
    
    /**
     * Hide loading state
     */
    hideLoading() {
        const loading = this.container.querySelector('.loading');
        if (loading) {
            loading.remove();
        }
    }
    
    /**
     * Escape HTML to prevent XSS
     * @param {string} text - Text to escape
     * @returns {string} - Escaped text
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    /**
     * Format date for display
     * @param {Date} date - Date to format
     * @returns {string} - Formatted date
     */
    formatDate(date) {
        if (!date) return '';
        return new Date(date).toLocaleDateString();
    }
    
    /**
     * Format datetime for display
     * @param {Date} date - Date to format
     * @returns {string} - Formatted datetime
     */
    formatDateTime(date) {
        if (!date) return '';
        return new Date(date).toLocaleString();
    }
}
```

### Task View

```javascript
/**
 * Task View
 * Handles task-related UI components and user interactions
 */
class TaskView extends BaseView {
    constructor(containerId) {
        super(containerId);
        this.currentUser = null;
        this.currentTasks = [];
    }
    
    /**
     * Initialize the view
     * @param {User} user - Current user
     */
    async initialize(user) {
        this.currentUser = user;
        this.render();
        this.setupEventListeners();
        this.isInitialized = true;
    }
    
    /**
     * Render the main task interface
     */
    render() {
        this.container.innerHTML = `
            <div class="task-management">
                <header class="task-header">
                    <h1>Task Management</h1>
                    <div class="user-info">
                        Welcome, ${this.escapeHtml(this.currentUser.displayName)}
                    </div>
                </header>
                
                <div class="task-controls">
                    <div class="task-form-container">
                        <form id="taskForm" class="task-form">
                            <div class="form-row">
                                <input type="text" id="taskTitle" name="title" placeholder="Task title" required>
                                <select id="taskPriority" name="priority">
                                    <option value="low">Low Priority</option>
                                    <option value="medium" selected>Medium Priority</option>
                                    <option value="high">High Priority</option>
                                    <option value="urgent">Urgent</option>
                                </select>
                            </div>
                            <div class="form-row">
                                <textarea id="taskDescription" name="description" placeholder="Task description (optional)"></textarea>
                            </div>
                            <div class="form-row">
                                <input type="text" id="taskCategory" name="category" placeholder="Category">
                                <input type="date" id="taskDueDate" name="dueDate">
                                <input type="number" id="taskEstimatedHours" name="estimatedHours" placeholder="Est. hours" min="0" step="0.5">
                            </div>
                            <div class="form-row">
                                <input type="text" id="taskTags" name="tags" placeholder="Tags (comma-separated)">
                                <button type="submit" class="btn btn-primary">Add Task</button>
                            </div>
                        </form>
                    </div>
                    
                    <div class="task-filters">
                        <div class="filter-group">
                            <button class="filter-btn active" data-filter="all">All Tasks</button>
                            <button class="filter-btn" data-filter="pending">Pending</button>
                            <button class="filter-btn" data-filter="completed">Completed</button>
                            <button class="filter-btn" data-filter="overdue">Overdue</button>
                        </div>
                        <div class="search-group">
                            <input type="text" id="taskSearch" placeholder="Search tasks...">
                            <button id="clearSearch" class="btn btn-secondary">Clear</button>
                        </div>
                    </div>
                </div>
                
                <div class="task-stats" id="taskStats">
                    <!-- Stats will be populated here -->
                </div>
                
                <div class="task-list-container">
                    <div id="taskList" class="task-list">
                        <!-- Tasks will be populated here -->
                    </div>
                </div>
            </div>
        `;
    }
    
    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Task form submission
        const taskForm = document.getElementById('taskForm');
        taskForm.addEventListener('submit', this.handleTaskFormSubmit.bind(this));
        
        // Filter buttons
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(btn => {
            btn.addEventListener('click', this.handleFilterClick.bind(this));
        });
        
        // Search functionality
        const searchInput = document.getElementById('taskSearch');
        searchInput.addEventListener('input', this.handleSearchInput.bind(this));
        
        const clearSearchBtn = document.getElementById('clearSearch');
        clearSearchBtn.addEventListener('click', this.handleClearSearch.bind(this));
        
        // Task list event delegation
        const taskList = document.getElementById('taskList');
        taskList.addEventListener('click', this.handleTaskListClick.bind(this));
    }
    
    /**
     * Handle task form submission
     * @param {Event} event - Form submit event
     */
    handleTaskFormSubmit(event) {
        event.preventDefault();
        
        const formData = new FormData(event.target);
        const taskData = {
            title: formData.get('title').trim(),
            description: formData.get('description').trim(),
            priority: formData.get('priority'),
            category: formData.get('category').trim() || 'general',
            dueDate: formData.get('dueDate') || null,
            estimatedHours: formData.get('estimatedHours') ? parseFloat(formData.get('estimatedHours')) : null,
            tags: formData.get('tags').split(',').map(tag => tag.trim()).filter(tag => tag)
        };
        
        if (!taskData.title) {
            this.showError('Task title is required');
            return;
        }
        
        this.notifyListeners('createTaskRequested', taskData);
        
        // Reset form
        event.target.reset();
        document.getElementById('taskTitle').focus();
    }
    
    /**
     * Handle filter button clicks
     * @param {Event} event - Click event
     */
    handleFilterClick(event) {
        const filterType = event.target.dataset.filter;
        
        // Update active filter button
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        event.target.classList.add('active');
        
        this.notifyListeners('filterRequested', { filterType });
    }
    
    /**
     * Handle search input
     * @param {Event} event - Input event
     */
    handleSearchInput(event) {
        const query = event.target.value;
        this.notifyListeners('searchRequested', { query });
    }
    
    /**
     * Handle clear search
     */
    handleClearSearch() {
        document.getElementById('taskSearch').value = '';
        this.notifyListeners('searchRequested', { query: '' });
    }
    
    /**
     * Handle task list clicks (event delegation)
     * @param {Event} event - Click event
     */
    handleTaskListClick(event) {
        const taskElement = event.target.closest('.task-item');
        if (!taskElement) return;
        
        const taskId = taskElement.dataset.taskId;
        
        if (event.target.classList.contains('task-toggle')) {
            this.notifyListeners('toggleCompletionRequested', { taskId });
        } else if (event.target.classList.contains('task-delete')) {
            this.notifyListeners('deleteTaskRequested', { taskId });
        } else if (event.target.classList.contains('task-edit')) {
            this.showEditTaskModal(taskId);
        }
    }
    
    /**
     * Display tasks in the list
     * @param {Task[]} tasks - Tasks to display
     * @param {string} filterType - Current filter type
     */
    async displayTasks(tasks, filterType = 'all') {
        this.currentTasks = tasks;
        const taskList = document.getElementById('taskList');
        
        if (tasks.length === 0) {
            taskList.innerHTML = `
                <div class="empty-state">
                    <p>No tasks found</p>
                    <small>Create your first task using the form above</small>
                </div>
            `;
            return;
        }
        
        // Sort tasks by priority and due date
        const sortedTasks = this.sortTasks(tasks);
        
        const taskHTML = sortedTasks.map(task => this.createTaskHTML(task)).join('');
        taskList.innerHTML = taskHTML;
    }
    
    /**
     * Create HTML for a single task
     * @param {Task} task - Task to render
     * @returns {string} - HTML string
     */
    createTaskHTML(task) {
        const priorityClass = `priority-${task.priority}`;
        const completedClass = task.completed ? 'completed' : '';
        const overdueClass = task.isOverdue ? 'overdue' : '';
        
        const dueDate = task.dueDate ? this.formatDate(task.dueDate) : '';
        const tags = task.tags.map(tag => `<span class="task-tag">${this.escapeHtml(tag)}</span>`).join('');
        
        return `
            <div class="task-item ${priorityClass} ${completedClass} ${overdueClass}" data-task-id="${task.id}">
                <div class="task-content">
                    <div class="task-header">
                        <h3 class="task-title">${this.escapeHtml(task.title)}</h3>
                        <div class="task-meta">
                            <span class="task-priority">${task.priority}</span>
                            <span class="task-category">${this.escapeHtml(task.category)}</span>
                            ${dueDate ? `<span class="task-due-date">Due: ${dueDate}</span>` : ''}
                        </div>
                    </div>
                    
                    ${task.description ? `<p class="task-description">${this.escapeHtml(task.description)}</p>` : ''}
                    
                    ${tags ? `<div class="task-tags">${tags}</div>` : ''}
                    
                    <div class="task-footer">
                        <small class="task-created">Created: ${this.formatDate(task.createdAt)}</small>
                        ${task.estimatedHours ? `<small class="task-estimated">Est: ${task.estimatedHours}h</small>` : ''}
                        ${task.actualHours ? `<small class="task-actual">Actual: ${task.actualHours}h</small>` : ''}
                    </div>
                </div>
                
                <div class="task-actions">
                    <button class="btn btn-sm task-toggle" title="${task.completed ? 'Mark incomplete' : 'Mark complete'}">
                        ${task.completed ? '↶' : '✓'}
                    </button>
                    <button class="btn btn-sm task-edit" title="Edit task">
                        ✏️
                    </button>
                    <button class="btn btn-sm task-delete" title="Delete task">
                        🗑️
                    </button>
                </div>
            </div>
        `;
    }
    
    /**
     * Display task statistics
     * @param {object} stats - Task statistics
     */
    async displayStats(stats) {
        const statsContainer = document.getElementById('taskStats');
        
        statsContainer.innerHTML = `
            <div class="stats-grid">
                <div class="stat-item">
                    <span class="stat-number">${stats.total}</span>
                    <span class="stat-label">Total Tasks</span>
                </div>
                <div class="stat-item">
                    <span class="stat-number">${stats.pending}</span>
                    <span class="stat-label">Pending</span>
                </div>
                <div class="stat-item">
                    <span class="stat-number">${stats.completed}</span>
                    <span class="stat-label">Completed</span>
                </div>
                <div class="stat-item ${stats.overdue > 0 ? 'stat-warning' : ''}">
                    <span class="stat-number">${stats.overdue || 0}</span>
                    <span class="stat-label">Overdue</span>
                </div>
            </div>
        `;
    }
    
    /**
     * Add a task to the display
     * @param {Task} task - Task to add
     */
    async addTask(task) {
        this.currentTasks.push(task);
        // Re-render the task list
        await this.displayTasks(this.currentTasks);
        this.showSuccess(`Task "${task.title}" created successfully!`);
    }
    
    /**
     * Update a task in the display
     * @param {Task} task - Updated task
     */
    async updateTask(task) {
        const index = this.currentTasks.findIndex(t => t.id === task.id);
        if (index !== -1) {
            this.currentTasks[index] = task;
            // Re-render the task list
            await this.displayTasks(this.currentTasks);
        }
    }
    
    /**
     * Remove a task from the display
     * @param {string} taskId - Task ID to remove
     */
    async removeTask(taskId) {
        this.currentTasks = this.currentTasks.filter(t => t.id !== taskId);
        // Re-render the task list
        await this.displayTasks(this.currentTasks);
        this.showSuccess('Task deleted successfully');
    }
    
    /**
     * Show confirmation dialog for task deletion
     * @param {Task} task - Task to delete
     * @returns {Promise<boolean>} - Whether deletion was confirmed
     */
    async confirmDeletion(task) {
        return confirm(`Are you sure you want to delete "${task.title}"?`);
    }
    
    /**
     * Sort tasks by priority and due date
     * @param {Task[]} tasks - Tasks to sort
     * @returns {Task[]} - Sorted tasks
     */
    sortTasks(tasks) {
        const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
        
        return tasks.sort((a, b) => {
            // First, sort by completion status (incomplete first)
            if (a.completed !== b.completed) {
                return a.completed ? 1 : -1;
            }
            
            // Then by overdue status (overdue first)
            if (a.isOverdue !== b.isOverdue) {
                return a.isOverdue ? -1 : 1;
            }
            
            // Then by priority (higher priority first)
            const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
            if (priorityDiff !== 0) {
                return priorityDiff;
            }
            
            // Finally by due date (earlier due date first)
            if (a.dueDate && b.dueDate) {
                return new Date(a.dueDate) - new Date(b.dueDate);
            } else if (a.dueDate) {
                return -1;
            } else if (b.dueDate) {
                return 1;
            }
            
            // If all else is equal, sort by creation date (newer first)
            return new Date(b.createdAt) - new Date(a.createdAt);
        });
    }
    
    /**
     * Show edit task modal (placeholder - would be implemented based on UI framework)
     * @param {string} taskId - Task ID to edit
     */
    showEditTaskModal(taskId) {
        // This would show a modal or inline edit form
        // For now, just notify the controller
        this.notifyListeners('editTaskRequested', { taskId });
    }
}
```

## Wiring It All Together

### Application Orchestrator

```javascript
/**
 * Application Class
 * Orchestrates all MVC components and manages application lifecycle
 */
class TaskManagementApp {
    constructor() {
        this.storageManager = null;
        this.taskRepository = null;
        this.userRepository = null;
        this.taskService = null;
        this.userService = null;
        this.taskController = null;
        this.userController = null;
        this.taskView = null;
        this.userView = null;
        this.currentUser = null;
    }
    
    /**
     * Initialize the application
     */
    async initialize() {
        try {
            console.log('🚀 Initializing Task Management Application...');
            
            // Initialize storage layer
            this.storageManager = new StorageManager('taskManagementApp_v2');
            
            // Initialize repositories
            this.taskRepository = new TaskRepository(this.storageManager);
            this.userRepository = new UserRepository(this.storageManager);
            
            // Initialize services
            this.taskService = new TaskService(this.taskRepository, this.userRepository);
            this.userService = new UserService(this.userRepository);
            
            // Initialize views
            this.taskView = new TaskView('taskContainer');
            this.userView = new UserView('userContainer');
            
            // Initialize controllers
            this.taskController = new TaskController(this.taskService, this.userService, this.taskView);
            this.userController = new UserController(this.userService, this.userView);
            
            // Set up cross-controller communication
            this.setupControllerCommunication();
            
            // Load or create default user
            await this.initializeUser();
            
            console.log('✅ Application initialized successfully!');
        } catch (error) {
            console.error('❌ Failed to initialize application:', error);
            throw error;
        }
    }
    
    /**
     * Set up communication between controllers
     */
    setupControllerCommunication() {
        // Listen for user changes to update task controller
        this.userController.addListener((eventType, data) => {
            if (eventType === 'userLoggedIn') {
                this.taskController.setCurrentUser(data.id);
            } else if (eventType === 'userLoggedOut') {
                // Handle logout - could redirect to login page
                console.log('User logged out');
            }
        });
        
        // Listen for task events that might affect user data
        this.taskController.addListener((eventType, data) => {
            if (eventType === 'taskCreated') {
                console.log('Task created:', data.title);
            }
        });
    }
    
    /**
     * Initialize user (create default user if none exists)
     */
    async initializeUser() {
        try {
            // Try to load existing users
            const users = await this.userService.getAllUsers();
            
            if (users.length === 0) {
                // Create default user
                console.log('Creating default user...');
                this.currentUser = await this.userService.createUser({
                    username: 'demo_user',
                    email: 'demo@example.com',
                    displayName: 'Demo User',
                    firstName: 'Demo',
                    lastName: 'User'
                });
            } else {
                // Use first user as current user
                this.currentUser = users[0];
            }
            
            // Initialize controllers with current user
            await this.taskController.initialize(this.currentUser.id);
            await this.userController.initialize(this.currentUser.id);
            
        } catch (error) {
            console.error('Failed to initialize user:', error);
            throw error;
        }
    }
    
    /**
     * Get current user
     * @returns {User} - Current user
     */
    getCurrentUser() {
        return this.currentUser;
    }
    
    /**
     * Switch to a different user
     * @param {string} userId - User ID to switch to
     */
    async switchUser(userId) {
        try {
            const user = await this.userService.getUserById(userId);
            if (!user) {
                throw new Error('User not found');
            }
            
            this.currentUser = user;
            await this.taskController.setCurrentUser(userId);
            await this.userController.setCurrentUser(userId);
            
            console.log(`Switched to user: ${user.displayName}`);
        } catch (error) {
            console.error('Failed to switch user:', error);
            throw error;
        }
    }
}

// Initialize application when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const app = new TaskManagementApp();
        await app.initialize();
        
        // Make app globally available for debugging
        window.taskApp = app;
        
    } catch (error) {
        console.error('Failed to start application:', error);
        document.body.innerHTML = `
            <div class="error-container">
                <h1>Application Error</h1>
                <p>Failed to initialize the application. Please refresh the page and try again.</p>
                <details>
                    <summary>Error Details</summary>
                    <pre>${error.message}</pre>
                </details>
            </div>
        `;
    }
});
```

## Best Practices for MVC Implementation

### 1. Clear Separation of Concerns
- **Models**: Only handle data and business logic
- **Views**: Only handle presentation and user interface
- **Controllers**: Only handle coordination and user input

### 2. Communication Patterns
- **Models → Controllers**: Through events or return values
- **Controllers → Views**: Through method calls
- **Views → Controllers**: Through events
- **Never**: Direct communication between Models and Views

### 3. Error Handling
- Handle errors at the appropriate layer
- Provide meaningful error messages to users
- Log detailed errors for debugging

### 4. Testing Strategy
- **Unit test models** independently
- **Unit test controllers** with mocked dependencies
- **Integration test** the complete MVC flow
- **UI test** the view components

### 5. Performance Considerations
- Use event delegation for dynamic content
- Implement efficient rendering strategies
- Cache frequently accessed data
- Minimize DOM manipulations

This MVC implementation provides a solid foundation for your Day 2 refactoring, creating a maintainable, testable, and scalable architecture that properly separates concerns while enabling rich functionality.