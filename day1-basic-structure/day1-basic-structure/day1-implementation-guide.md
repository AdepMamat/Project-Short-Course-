# Day 1 Implementation Guide: Software Engineering Fundamentals

## Learning Objectives

By the end of Day 1, you will:
- Understand fundamental software engineering principles (modularity, separation of concerns)
- Implement a basic Model-View-Controller (MVC) structure
- Create a working task management system with local storage
- Apply proper code organization and encapsulation

## Software Engineering Principles

### 1. Modularity
**Definition**: Breaking down complex systems into smaller, manageable, and independent modules.

**Why it matters**: 
- Easier to understand, test, and maintain
- Enables code reuse
- Allows multiple developers to work on different parts simultaneously

### 2. Separation of Concerns
**Definition**: Each module should have a single, well-defined responsibility.

**Why it matters**:
- Reduces complexity
- Makes code more maintainable
- Easier to debug and modify

### 3. Encapsulation
**Definition**: Bundling data and methods that operate on that data within a single unit.

**Why it matters**:
- Protects data integrity
- Provides clear interfaces
- Reduces coupling between components

## MVC Architecture Overview

The Model-View-Controller pattern separates application logic into three interconnected components:

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│    Model    │    │    View     │    │ Controller  │
│             │    │             │    │             │
│ Data &      │◄──►│ User        │◄──►│ Business    │
│ Business    │    │ Interface   │    │ Logic       │
│ Logic       │    │             │    │             │
└─────────────┘    └─────────────┘    └─────────────┘
```

- **Model**: Manages data and business rules
- **View**: Handles the user interface and presentation
- **Controller**: Manages user input and coordinates between Model and View

## Step-by-Step Implementation

### Step 1: Update the HTML Structure

First, we need to update our HTML to include the user interface for our task management system.

**File**: `public/index.html`

Replace the existing content with:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Task Management System - Day 1</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <div class="container">
        <header>
            <h1>Task Management System</h1>
            <p>Day 1: Software Engineering Fundamentals</p>
        </header>

        <main>
            <!-- Messages container -->
            <div id="messages" class="messages-container"></div>

            <!-- Task Statistics -->
            <section class="stats-section">
                <h2>Task Overview</h2>
                <div id="taskStats" class="stats-container">
                    <!-- Stats will be rendered here -->
                </div>
            </section>

            <!-- Task Creation Form -->
            <section class="form-section">
                <h2>Create New Task</h2>
                <form id="taskForm" class="task-form">
                    <div class="form-group">
                        <label for="taskTitle">Task Title *</label>
                        <input type="text" id="taskTitle" name="title" required placeholder="Enter task title">
                    </div>
                    
                    <div class="form-group">
                        <label for="taskDescription">Description</label>
                        <textarea id="taskDescription" name="description" placeholder="Enter task description (optional)"></textarea>
                    </div>
                    
                    <div class="form-group">
                        <label for="taskPriority">Priority</label>
                        <select id="taskPriority" name="priority">
                            <option value="low">Low</option>
                            <option value="medium" selected>Medium</option>
                            <option value="high">High</option>
                        </select>
                    </div>
                    
                    <button type="submit" class="btn btn-primary">Create Task</button>
                </form>
            </section>

            <!-- Task Filters -->
            <section class="filter-section">
                <h2>Filter Tasks</h2>
                <div class="filter-buttons">
                    <button class="filter-btn active" data-filter="all">All Tasks</button>
                    <button class="filter-btn" data-filter="pending">Pending</button>
                    <button class="filter-btn" data-filter="completed">Completed</button>
                    <button class="filter-btn" data-filter="high">High Priority</button>
                    <button class="filter-btn" data-filter="medium">Medium Priority</button>
                    <button class="filter-btn" data-filter="low">Low Priority</button>
                </div>
            </section>

            <!-- Task List -->
            <section class="tasks-section">
                <div class="tasks-header">
                    <h2>Your Tasks</h2>
                    <button id="clearAllTasks" class="btn btn-danger">Clear All Tasks</button>
                </div>
                <div id="taskList" class="task-list">
                    <!-- Tasks will be rendered here -->
                </div>
            </section>
        </main>

        <footer>
            <p>&copy; 2024 Software Engineering Shortcourse - Day 1 Implementation</p>
        </footer>
    </div>

    <!-- Load JavaScript modules in correct order -->
    <script src="src/models/Task.js"></script>
    <script src="src/utils/StorageManager.js"></script>
    <script src="src/services/TaskService.js"></script>
    <script src="src/app.js"></script>
</body>
</html>
```

**Key Changes:**
- Added form for creating tasks
- Added containers for task statistics and task list
- Added filter buttons for different views
- Added script tags for our JavaScript modules in the correct loading order

### Step 2: Update the CSS Styles

Update `public/styles.css` to add styles for our new UI components. Add the following styles to your existing CSS:

```css
/* Messages */
.messages-container {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 1000;
    max-width: 400px;
}

.message {
    padding: 12px 16px;
    margin-bottom: 10px;
    border-radius: 6px;
    font-weight: 500;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    animation: slideIn 0.3s ease-out;
}

.message-success {
    background-color: #d4edda;
    color: #155724;
    border-left: 4px solid #28a745;
}

.message-error {
    background-color: #f8d7da;
    color: #721c24;
    border-left: 4px solid #dc3545;
}

.message-info {
    background-color: #d1ecf1;
    color: #0c5460;
    border-left: 4px solid #17a2b8;
}

@keyframes slideIn {
    from {
        transform: translateX(100%);
        opacity: 0;
    }
    to {
        transform: translateX(0);
        opacity: 1;
    }
}

/* Task Statistics */
.stats-container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
    margin-top: 20px;
}

.stat-item {
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    padding: 20px;
    border-radius: 8px;
    text-align: center;
    border: 1px solid #dee2e6;
    transition: transform 0.2s ease;
}

.stat-item:hover {
    transform: translateY(-2px);
}

.stat-number {
    display: block;
    font-size: 2.5rem;
    font-weight: 700;
    color: #667eea;
    margin-bottom: 5px;
}

.stat-label {
    font-size: 0.9rem;
    color: #6c757d;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.stat-item.priority-high .stat-number {
    color: #dc3545;
}

/* Task Form */
.task-form {
    display: grid;
    gap: 20px;
}

.form-group {
    display: flex;
    flex-direction: column;
}

.form-group label {
    font-weight: 600;
    margin-bottom: 8px;
    color: #555;
}

.form-group input,
.form-group textarea,
.form-group select {
    padding: 12px;
    border: 2px solid #e9ecef;
    border-radius: 6px;
    font-size: 1rem;
    transition: border-color 0.2s ease;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-group textarea {
    resize: vertical;
    min-height: 80px;
}

/* Buttons */
.btn {
    padding: 12px 24px;
    border: none;
    border-radius: 6px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    text-decoration: none;
    display: inline-block;
    text-align: center;
}

.btn-primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
}

.btn-primary:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.btn-danger {
    background-color: #dc3545;
    color: white;
}

.btn-danger:hover {
    background-color: #c82333;
    transform: translateY(-1px);
}

.btn-toggle {
    background-color: #28a745;
    color: white;
    padding: 8px 12px;
    font-size: 0.9rem;
}

.btn-toggle:hover {
    background-color: #218838;
}

.btn-delete {
    background-color: #dc3545;
    color: white;
    padding: 8px 12px;
    font-size: 0.9rem;
}

.btn-delete:hover {
    background-color: #c82333;
}

/* Filter Buttons */
.filter-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 20px;
}

.filter-btn {
    padding: 8px 16px;
    border: 2px solid #e9ecef;
    background-color: white;
    color: #6c757d;
    border-radius: 20px;
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.2s ease;
}

.filter-btn:hover {
    border-color: #667eea;
    color: #667eea;
}

.filter-btn.active {
    background-color: #667eea;
    border-color: #667eea;
    color: white;
}

/* Tasks Section */
.tasks-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.task-list {
    display: grid;
    gap: 15px;
}

.task-item {
    background: white;
    border: 1px solid #e9ecef;
    border-radius: 8px;
    padding: 20px;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    transition: all 0.2s ease;
    border-left: 4px solid #e9ecef;
}

.task-item:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transform: translateY(-1px);
}

.task-item.priority-high {
    border-left-color: #dc3545;
}

.task-item.priority-medium {
    border-left-color: #ffc107;
}

.task-item.priority-low {
    border-left-color: #28a745;
}

.task-item.completed {
    opacity: 0.7;
    background-color: #f8f9fa;
}

.task-item.completed .task-title {
    text-decoration: line-through;
    color: #6c757d;
}

.task-content {
    flex: 1;
    margin-right: 20px;
}

.task-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 10px;
}

.task-title {
    font-size: 1.2rem;
    font-weight: 600;
    color: #333;
    margin: 0;
    flex: 1;
    margin-right: 15px;
}

.task-priority {
    background-color: #e9ecef;
    color: #6c757d;
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 0.8rem;
    text-transform: uppercase;
    font-weight: 600;
}

.task-item.priority-high .task-priority {
    background-color: #f8d7da;
    color: #721c24;
}

.task-item.priority-medium .task-priority {
    background-color: #fff3cd;
    color: #856404;
}

.task-item.priority-low .task-priority {
    background-color: #d4edda;
    color: #155724;
}

.task-description {
    color: #6c757d;
    margin: 10px 0;
    line-height: 1.5;
}

.task-meta {
    display: flex;
    gap: 15px;
    margin-top: 10px;
}

.task-meta small {
    color: #6c757d;
    font-size: 0.85rem;
}

.task-actions {
    display: flex;
    gap: 8px;
    flex-shrink: 0;
}

/* Empty State */
.empty-state {
    text-align: center;
    padding: 60px 20px;
    color: #6c757d;
}

.empty-state p {
    font-size: 1.2rem;
    margin-bottom: 10px;
}

.empty-state small {
    font-size: 1rem;
    opacity: 0.8;
}
```

### Step 3: Create the Task Model

The Task model represents our core data structure and business logic.

**File**: `src/models/Task.js`

```javascript
/**
 * Task Model - Represents a single task in our system
 * 
 * Demonstrates:
 * - Encapsulation: Private data with public methods
 * - Data validation: Ensuring data integrity
 * - Business logic: Task-specific operations
 */
class Task {
    constructor(title, description, priority = 'medium') {
        // Validate required fields
        if (!title || title.trim() === '') {
            throw new Error('Task title is required');
        }
        
        // Private properties (using convention)
        this._id = this._generateId();
        this._title = title.trim();
        this._description = description ? description.trim() : '';
        this._priority = this._validatePriority(priority);
        this._completed = false;
        this._createdAt = new Date();
        this._updatedAt = new Date();
    }
    
    // Public getters (read-only access)
    get id() { return this._id; }
    get title() { return this._title; }
    get description() { return this._description; }
    get priority() { return this._priority; }
    get completed() { return this._completed; }
    get createdAt() { return this._createdAt; }
    get updatedAt() { return this._updatedAt; }
    
    // Public methods for task operations
    markComplete() {
        this._completed = true;
        this._updatedAt = new Date();
    }
    
    markIncomplete() {
        this._completed = false;
        this._updatedAt = new Date();
    }
    
    updateTitle(newTitle) {
        if (!newTitle || newTitle.trim() === '') {
            throw new Error('Task title cannot be empty');
        }
        this._title = newTitle.trim();
        this._updatedAt = new Date();
    }
    
    updateDescription(newDescription) {
        this._description = newDescription ? newDescription.trim() : '';
        this._updatedAt = new Date();
    }
    
    updatePriority(newPriority) {
        this._priority = this._validatePriority(newPriority);
        this._updatedAt = new Date();
    }
    
    // Convert to plain object for storage/serialization
    toJSON() {
        return {
            id: this._id,
            title: this._title,
            description: this._description,
            priority: this._priority,
            completed: this._completed,
            createdAt: this._createdAt.toISOString(),
            updatedAt: this._updatedAt.toISOString()
        };
    }
    
    // Create Task from stored data
    static fromJSON(data) {
        const task = new Task(data.title, data.description, data.priority);
        task._id = data.id;
        task._completed = data.completed;
        task._createdAt = new Date(data.createdAt);
        task._updatedAt = new Date(data.updatedAt);
        return task;
    }
    
    // Private helper methods
    _generateId() {
        return 'task_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    _validatePriority(priority) {
        const validPriorities = ['low', 'medium', 'high'];
        if (!validPriorities.includes(priority)) {
            throw new Error(`Invalid priority: ${priority}. Must be one of: ${validPriorities.join(', ')}`);
        }
        return priority;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Task;
} else {
    window.Task = Task;
}
```

### Step 4: Create the Storage Manager

The StorageManager handles data persistence using browser's localStorage.

**File**: `src/utils/StorageManager.js`

```javascript
/**
 * StorageManager - Handles data persistence using localStorage
 * 
 * Demonstrates:
 * - Separation of concerns: Data storage is separate from business logic
 * - Error handling: Graceful handling of storage failures
 * - Abstraction: Provides simple interface for complex operations
 */
class StorageManager {
    constructor(storageKey = 'taskManagementApp') {
        this.storageKey = storageKey;
        this.isAvailable = this._checkStorageAvailability();
    }
    
    /**
     * Save data to localStorage
     * @param {string} key - The key to store data under
     * @param {any} data - The data to store (will be JSON stringified)
     * @returns {boolean} - Success status
     */
    save(key, data) {
        if (!this.isAvailable) {
            console.warn('localStorage not available, data will not persist');
            return false;
        }
        
        try {
            const fullKey = `${this.storageKey}_${key}`;
            const jsonData = JSON.stringify(data);
            localStorage.setItem(fullKey, jsonData);
            return true;
        } catch (error) {
            console.error('Failed to save data:', error);
            return false;
        }
    }
    
    /**
     * Load data from localStorage
     * @param {string} key - The key to load data from
     * @param {any} defaultValue - Default value if key doesn't exist
     * @returns {any} - The loaded data or default value
     */
    load(key, defaultValue = null) {
        if (!this.isAvailable) {
            return defaultValue;
        }
        
        try {
            const fullKey = `${this.storageKey}_${key}`;
            const jsonData = localStorage.getItem(fullKey);
            
            if (jsonData === null) {
                return defaultValue;
            }
            
            return JSON.parse(jsonData);
        } catch (error) {
            console.error('Failed to load data:', error);
            return defaultValue;
        }
    }
    
    /**
     * Remove data from localStorage
     * @param {string} key - The key to remove
     * @returns {boolean} - Success status
     */
    remove(key) {
        if (!this.isAvailable) {
            return false;
        }
        
        try {
            const fullKey = `${this.storageKey}_${key}`;
            localStorage.removeItem(fullKey);
            return true;
        } catch (error) {
            console.error('Failed to remove data:', error);
            return false;
        }
    }
    
    /**
     * Clear all app data from localStorage
     * @returns {boolean} - Success status
     */
    clear() {
        if (!this.isAvailable) {
            return false;
        }
        
        try {
            // Remove all keys that start with our storage key
            const keysToRemove = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith(this.storageKey)) {
                    keysToRemove.push(key);
                }
            }
            
            keysToRemove.forEach(key => localStorage.removeItem(key));
            return true;
        } catch (error) {
            console.error('Failed to clear data:', error);
            return false;
        }
    }
    
    /**
     * Get storage usage information
     * @returns {object} - Storage usage stats
     */
    getStorageInfo() {
        if (!this.isAvailable) {
            return { available: false };
        }
        
        try {
            let totalSize = 0;
            let appSize = 0;
            
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                const value = localStorage.getItem(key);
                const itemSize = key.length + value.length;
                
                totalSize += itemSize;
                
                if (key.startsWith(this.storageKey)) {
                    appSize += itemSize;
                }
            }
            
            return {
                available: true,
                totalSize,
                appSize,
                itemCount: localStorage.length
            };
        } catch (error) {
            console.error('Failed to get storage info:', error);
            return { available: false, error: error.message };
        }
    }
    
    // Private helper method
    _checkStorageAvailability() {
        try {
            const testKey = '__storage_test__';
            localStorage.setItem(testKey, 'test');
            localStorage.removeItem(testKey);
            return true;
        } catch (error) {
            return false;
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StorageManager;
} else {
    window.StorageManager = StorageManager;
}
```

### Step 5: Create the Task Service

The TaskService manages business logic and coordinates between the model and storage.

**File**: `src/services/TaskService.js`

```javascript
/**
 * TaskService - Business logic layer for task management
 * 
 * Demonstrates:
 * - Business logic separation: All task operations in one place
 * - Data coordination: Manages interaction between models and storage
 * - Event handling: Notifies other parts of the system about changes
 */
class TaskService {
    constructor(storageManager) {
        this.storage = storageManager;
        this.tasks = new Map(); // In-memory cache for better performance
        this.listeners = new Set(); // For event notifications
        
        // Load existing tasks from storage
        this._loadTasksFromStorage();
    }
    
    /**
     * Create a new task
     * @param {string} title - Task title
     * @param {string} description - Task description
     * @param {string} priority - Task priority (low, medium, high)
     * @returns {Task} - The created task
     */
    createTask(title, description, priority) {
        try {
            // Create new task (validation happens in constructor)
            const task = new Task(title, description, priority);
            
            // Add to in-memory cache
            this.tasks.set(task.id, task);
            
            // Persist to storage
            this._saveTasksToStorage();
            
            // Notify listeners
            this._notifyListeners('taskCreated', task);
            
            return task;
        } catch (error) {
            console.error('Failed to create task:', error);
            throw error;
        }
    }
    
    /**
     * Get all tasks
     * @returns {Task[]} - Array of all tasks
     */
    getAllTasks() {
        return Array.from(this.tasks.values());
    }
    
    /**
     * Get task by ID
     * @param {string} id - Task ID
     * @returns {Task|null} - The task or null if not found
     */
    getTaskById(id) {
        return this.tasks.get(id) || null;
    }
    
    /**
     * Update a task
     * @param {string} id - Task ID
     * @param {object} updates - Object with properties to update
     * @returns {Task|null} - The updated task or null if not found
     */
    updateTask(id, updates) {
        const task = this.tasks.get(id);
        if (!task) {
            return null;
        }
        
        try {
            // Apply updates
            if (updates.title !== undefined) {
                task.updateTitle(updates.title);
            }
            if (updates.description !== undefined) {
                task.updateDescription(updates.description);
            }
            if (updates.priority !== undefined) {
                task.updatePriority(updates.priority);
            }
            if (updates.completed !== undefined) {
                if (updates.completed) {
                    task.markComplete();
                } else {
                    task.markIncomplete();
                }
            }
            
            // Persist changes
            this._saveTasksToStorage();
            
            // Notify listeners
            this._notifyListeners('taskUpdated', task);
            
            return task;
        } catch (error) {
            console.error('Failed to update task:', error);
            throw error;
        }
    }
    
    /**
     * Delete a task
     * @param {string} id - Task ID
     * @returns {boolean} - Success status
     */
    deleteTask(id) {
        const task = this.tasks.get(id);
        if (!task) {
            return false;
        }
        
        // Remove from cache
        this.tasks.delete(id);
        
        // Persist changes
        this._saveTasksToStorage();
        
        // Notify listeners
        this._notifyListeners('taskDeleted', task);
        
        return true;
    }
    
    /**
     * Get tasks filtered by completion status
     * @param {boolean} completed - Filter by completion status
     * @returns {Task[]} - Filtered tasks
     */
    getTasksByStatus(completed) {
        return this.getAllTasks().filter(task => task.completed === completed);
    }
    
    /**
     * Get tasks filtered by priority
     * @param {string} priority - Priority level
     * @returns {Task[]} - Filtered tasks
     */
    getTasksByPriority(priority) {
        return this.getAllTasks().filter(task => task.priority === priority);
    }
    
    /**
     * Get task statistics
     * @returns {object} - Task statistics
     */
    getTaskStats() {
        const allTasks = this.getAllTasks();
        const completed = allTasks.filter(task => task.completed);
        const pending = allTasks.filter(task => !task.completed);
        
        const byPriority = {
            high: allTasks.filter(task => task.priority === 'high').length,
            medium: allTasks.filter(task => task.priority === 'medium').length,
            low: allTasks.filter(task => task.priority === 'low').length
        };
        
        return {
            total: allTasks.length,
            completed: completed.length,
            pending: pending.length,
            byPriority
        };
    }
    
    /**
     * Add event listener for task changes
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
     * Clear all tasks
     * @returns {boolean} - Success status
     */
    clearAllTasks() {
        this.tasks.clear();
        this._saveTasksToStorage();
        this._notifyListeners('allTasksCleared');
        return true;
    }
    
    // Private methods
    _loadTasksFromStorage() {
        const tasksData = this.storage.load('tasks', []);
        
        tasksData.forEach(taskData => {
            try {
                const task = Task.fromJSON(taskData);
                this.tasks.set(task.id, task);
            } catch (error) {
                console.error('Failed to load task:', taskData, error);
            }
        });
    }
    
    _saveTasksToStorage() {
        const tasksData = this.getAllTasks().map(task => task.toJSON());
        this.storage.save('tasks', tasksData);
    }
    
    _notifyListeners(eventType, data) {
        this.listeners.forEach(listener => {
            try {
                listener(eventType, data);
            } catch (error) {
                console.error('Error in task service listener:', error);
            }
        });
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TaskService;
} else {
    window.TaskService = TaskService;
}
```

### Step 6: Update the Main Application

Now we'll update the main `app.js` file to orchestrate all components.

**File**: `src/app.js`

Replace the existing content with:

```javascript
/**
 * Main Application - Day 1 Implementation
 * 
 * Demonstrates:
 * - Component orchestration: Bringing all pieces together
 * - Event-driven architecture: Responding to user interactions
 * - DOM manipulation: Updating the user interface
 */

// Global application state
let taskService;
let storageManager;

/**
 * Initialize the application
 */
function initializeApp() {
    console.log('🚀 Initializing Task Management System...');
    
    // Initialize storage manager
    storageManager = new StorageManager('taskApp');
    
    // Initialize task service
    taskService = new TaskService(storageManager);
    
    // Set up event listeners
    setupEventListeners();
    
    // Listen for task service events
    taskService.addListener(handleTaskServiceEvent);
    
    // Render initial UI
    renderTaskList();
    renderTaskStats();
    
    console.log('✅ Application initialized successfully!');
    console.log(`📊 Loaded ${taskService.getAllTasks().length} existing tasks`);
}

/**
 * Set up DOM event listeners
 */
function setupEventListeners() {
    // Task creation form
    const taskForm = document.getElementById('taskForm');
    if (taskForm) {
        taskForm.addEventListener('submit', handleTaskFormSubmit);
    }
    
    // Clear all tasks button
    const clearAllBtn = document.getElementById('clearAllTasks');
    if (clearAllBtn) {
        clearAllBtn.addEventListener('click', handleClearAllTasks);
    }
    
    // Filter buttons
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', handleFilterChange);
    });
}

/**
 * Handle task form submission
 */
function handleTaskFormSubmit(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const title = formData.get('title')?.trim();
    const description = formData.get('description')?.trim();
    const priority = formData.get('priority') || 'medium';
    
    if (!title) {
        showMessage('Please enter a task title', 'error');
        return;
    }
    
    try {
        const task = taskService.createTask(title, description, priority);
        showMessage(`Task "${task.title}" created successfully!`, 'success');
        
        // Reset form
        event.target.reset();
        
        // Focus back to title input
        const titleInput = document.getElementById('taskTitle');
        if (titleInput) {
            titleInput.focus();
        }
    } catch (error) {
        showMessage(`Failed to create task: ${error.message}`, 'error');
    }
}

/**
 * Handle task service events
 */
function handleTaskServiceEvent(eventType, data) {
    console.log(`📢 Task service event: ${eventType}`, data);
    
    // Re-render UI when tasks change
    renderTaskList();
    renderTaskStats();
}

/**
 * Handle task completion toggle
 */
function handleTaskToggle(taskId) {
    const task = taskService.getTaskById(taskId);
    if (!task) return;
    
    try {
        taskService.updateTask(taskId, { completed: !task.completed });
        const status = task.completed ? 'incomplete' : 'complete';
        showMessage(`Task marked as ${status}`, 'info');
    } catch (error) {
        showMessage(`Failed to update task: ${error.message}`, 'error');
    }
}

/**
 * Handle task deletion
 */
function handleTaskDelete(taskId) {
    const task = taskService.getTaskById(taskId);
    if (!task) return;
    
    if (confirm(`Are you sure you want to delete "${task.title}"?`)) {
        if (taskService.deleteTask(taskId)) {
            showMessage('Task deleted successfully', 'info');
        } else {
            showMessage('Failed to delete task', 'error');
        }
    }
}

/**
 * Handle clear all tasks
 */
function handleClearAllTasks() {
    const taskCount = taskService.getAllTasks().length;
    
    if (taskCount === 0) {
        showMessage('No tasks to clear', 'info');
        return;
    }
    
    if (confirm(`Are you sure you want to delete all ${taskCount} tasks?`)) {
        taskService.clearAllTasks();
        showMessage('All tasks cleared', 'info');
    }
}

/**
 * Handle filter changes
 */
function handleFilterChange(event) {
    const filterType = event.target.dataset.filter;
    
    // Update active filter button
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Re-render with filter
    renderTaskList(filterType);
}

/**
 * Render the task list
 */
function renderTaskList(filter = 'all') {
    const taskListContainer = document.getElementById('taskList');
    if (!taskListContainer) return;
    
    let tasks = taskService.getAllTasks();
    
    // Apply filter
    switch (filter) {
        case 'pending':
            tasks = tasks.filter(task => !task.completed);
            break;
        case 'completed':
            tasks = tasks.filter(task => task.completed);
            break;
        case 'high':
            tasks = tasks.filter(task => task.priority === 'high');
            break;
        case 'medium':
            tasks = tasks.filter(task => task.priority === 'medium');
            break;
        case 'low':
            tasks = tasks.filter(task => task.priority === 'low');
            break;
    }
    
    // Sort tasks by creation date (newest first)
    tasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    if (tasks.length === 0) {
        taskListContainer.innerHTML = `
            <div class="empty-state">
                <p>No tasks found</p>
                <small>Create your first task using the form above</small>
            </div>
        `;
        return;
    }
    
    const taskHTML = tasks.map(task => createTaskHTML(task)).join('');
    taskListContainer.innerHTML = taskHTML;
}

/**
 * Create HTML for a single task
 */
function createTaskHTML(task) {
    const priorityClass = `priority-${task.priority}`;
    const completedClass = task.completed ? 'completed' : '';
    const createdDate = new Date(task.createdAt).toLocaleDateString();
    
    return `
        <div class="task-item ${priorityClass} ${completedClass}" data-task-id="${task.id}">
            <div class="task-content">
                <div class="task-header">
                    <h3 class="task-title">${escapeHtml(task.title)}</h3>
                    <span class="task-priority">${task.priority}</span>
                </div>
                ${task.description ? `<p class="task-description">${escapeHtml(task.description)}</p>` : ''}
                <div class="task-meta">
                    <small>Created: ${createdDate}</small>
                    ${task.completed ? `<small>Completed: ${new Date(task.updatedAt).toLocaleDateString()}</small>` : ''}
                </div>
            </div>
            <div class="task-actions">
                <button class="btn btn-toggle" onclick="handleTaskToggle('${task.id}')" title="${task.completed ? 'Mark incomplete' : 'Mark complete'}">
                    ${task.completed ? '↶' : '✓'}
                </button>
                <button class="btn btn-delete" onclick="handleTaskDelete('${task.id}')" title="Delete task">
                    🗑️
                </button>
            </div>
        </div>
    `;
}

/**
 * Render task statistics
 */
function renderTaskStats() {
    const statsContainer = document.getElementById('taskStats');
    if (!statsContainer) return;
    
    const stats = taskService.getTaskStats();
    
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
            <div class="stat-item priority-high">
                <span class="stat-number">${stats.byPriority.high}</span>
                <span class="stat-label">High Priority</span>
            </div>
        </div>
    `;
}

/**
 * Show user message
 */
function showMessage(message, type = 'info') {
    const messageContainer = document.getElementById('messages');
    if (!messageContainer) {
        console.log(`${type.toUpperCase()}: ${message}`);
        return;
    }
    
    const messageElement = document.createElement('div');
    messageElement.className = `message message-${type}`;
    messageElement.textContent = message;
    
    messageContainer.appendChild(messageElement);
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
        if (messageElement.parentNode) {
            messageElement.parentNode.removeChild(messageElement);
        }
    }, 3000);
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', initializeApp);

// Export functions for testing (if in Node.js environment)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initializeApp,
        handleTaskFormSubmit,
        handleTaskToggle,
        handleTaskDelete,
        renderTaskList,
        renderTaskStats,
        showMessage,
        escapeHtml
    };
}
```

## Key Concepts Explained

### 1. **Encapsulation in the Task Model**
- Private properties (using `_` convention)
- Public getters for read-only access
- Controlled modification through methods
- Data validation in constructors and setters

### 2. **Separation of Concerns**
- **Task Model**: Handles task data and validation
- **StorageManager**: Manages data persistence
- **TaskService**: Coordinates business logic
- **App.js**: Handles UI and user interactions

### 3. **Error Handling**
- Try-catch blocks for operations that might fail
- Validation in constructors and methods
- Graceful degradation when localStorage isn't available
- User-friendly error messages

### 4. **Event-Driven Architecture**
- TaskService notifies listeners when data changes
- UI automatically updates when tasks are modified
- Loose coupling between components

## Testing Your Implementation

1. **Create a new task**: Fill out the form and submit
2. **Mark tasks complete**: Click the checkmark button
3. **Delete tasks**: Click the trash button
4. **Filter tasks**: Use the filter buttons
5. **Refresh the page**: Tasks should persist in localStorage

## Common Issues and Solutions

### Issue: "Task is not defined"
**Solution**: Make sure you've included the Task.js file in your HTML and the script loading order is correct

### Issue: Tasks don't persist after refresh
**Solution**: Check browser console for localStorage errors

### Issue: Form doesn't submit
**Solution**: Ensure form has correct ID and event listeners are set up

### Issue: "StorageManager is not defined"
**Solution**: Ensure all JavaScript files are loaded in the correct order in your HTML

## Implementation Checklist

- [ ] Updated HTML with new UI structure
- [ ] Updated CSS with new styles
- [ ] Created Task.js model
- [ ] Created StorageManager.js utility
- [ ] Created TaskService.js service layer
- [ ] Updated app.js with main application logic
- [ ] Tested task creation, completion, and deletion
- [ ] Verified data persistence after page refresh

## Next Steps

Tomorrow (Day 2), you'll enhance this structure by:
- Implementing proper MVC separation
- Adding the Repository pattern
- Creating a User model
- Enhancing the Task model with more features

## Reflection Questions

1. How does the MVC pattern help organize our code?
2. What are the benefits of encapsulation in the Task model?
3. How does the StorageManager demonstrate separation of concerns?
4. What would happen if we put all this code in a single file?
5. Why is the script loading order important in our HTML?

Great job completing Day 1! You've built a solid foundation using fundamental software engineering principles.