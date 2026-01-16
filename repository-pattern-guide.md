# Repository Pattern Implementation Guide

## Overview

The Repository pattern is a design pattern that encapsulates the logic needed to access data sources. It centralizes common data access functionality, providing better maintainability and decoupling the infrastructure or technology used to access databases from the domain model layer.

## Why Use the Repository Pattern?

### Benefits

1. **Abstraction**: Separates business logic from data access logic
2. **Testability**: Easy to create mock repositories for unit testing
3. **Flexibility**: Can switch between different storage mechanisms
4. **Consistency**: Standardized interface for data operations
5. **Caching**: Centralized location to implement caching strategies
6. **Query Optimization**: Single place to optimize data access

### When to Use

- When you need to abstract data access logic
- When you want to make your code more testable
- When you might need to support multiple data sources
- When you want to implement caching or other cross-cutting concerns

## Repository Interface Design

### Basic Repository Interface

```javascript
/**
 * Base Repository Interface
 * Defines standard CRUD operations that all repositories should implement
 */
class BaseRepository {
    /**
     * Create a new entity
     * @param {Object} entity - The entity to create
     * @returns {Promise<Object>} The created entity with generated ID
     */
    async create(entity) {
        throw new Error('create method must be implemented');
    }
    
    /**
     * Find entity by ID
     * @param {string} id - The entity ID
     * @returns {Promise<Object|null>} The entity or null if not found
     */
    async findById(id) {
        throw new Error('findById method must be implemented');
    }
    
    /**
     * Find all entities
     * @param {Object} options - Query options (limit, offset, sort)
     * @returns {Promise<Array>} Array of entities
     */
    async findAll(options = {}) {
        throw new Error('findAll method must be implemented');
    }
    
    /**
     * Update entity by ID
     * @param {string} id - The entity ID
     * @param {Object} updates - Properties to update
     * @returns {Promise<Object|null>} Updated entity or null if not found
     */
    async update(id, updates) {
        throw new Error('update method must be implemented');
    }
    
    /**
     * Delete entity by ID
     * @param {string} id - The entity ID
     * @returns {Promise<boolean>} True if deleted, false if not found
     */
    async delete(id) {
        throw new Error('delete method must be implemented');
    }
    
    /**
     * Check if entity exists
     * @param {string} id - The entity ID
     * @returns {Promise<boolean>} True if exists, false otherwise
     */
    async exists(id) {
        const entity = await this.findById(id);
        return entity !== null;
    }
    
    /**
     * Count total entities
     * @param {Object} criteria - Optional filtering criteria
     * @returns {Promise<number>} Total count
     */
    async count(criteria = {}) {
        const entities = await this.findAll();
        return entities.length;
    }
}
```

## Task Repository Implementation

### TaskRepository Class

```javascript
/**
 * Task Repository
 * Handles all data access operations for Task entities
 */
class TaskRepository extends BaseRepository {
    constructor(storageManager) {
        super();
        this.storage = storageManager;
        this.entityKey = 'tasks';
        this._cache = new Map(); // In-memory cache for performance
        this._cacheExpiry = 5 * 60 * 1000; // 5 minutes
    }
    
    /**
     * Create a new task
     */
    async create(task) {
        try {
            // Validate task object
            this._validateTask(task);
            
            // Ensure task has an ID
            if (!task.id) {
                task.id = this._generateId();
            }
            
            // Get existing tasks
            const tasks = await this._getAllTasks();
            
            // Check for duplicate ID
            if (tasks.some(t => t.id === task.id)) {
                throw new Error(`Task with ID ${task.id} already exists`);
            }
            
            // Add to collection
            tasks.push(task.toJSON ? task.toJSON() : task);
            
            // Save to storage
            await this._saveTasks(tasks);
            
            // Update cache
            this._cache.set(task.id, {
                data: task,
                timestamp: Date.now()
            });
            
            return task;
        } catch (error) {
            console.error('Error creating task:', error);
            throw error;
        }
    }
    
    /**
     * Find task by ID
     */
    async findById(id) {
        try {
            // Check cache first
            const cached = this._getFromCache(id);
            if (cached) {
                return cached;
            }
            
            // Load from storage
            const tasks = await this._getAllTasks();
            const taskData = tasks.find(t => t.id === id);
            
            if (!taskData) {
                return null;
            }
            
            // Convert to Task object if needed
            const task = this._hydrateTask(taskData);
            
            // Cache the result
            this._cache.set(id, {
                data: task,
                timestamp: Date.now()
            });
            
            return task;
        } catch (error) {
            console.error('Error finding task by ID:', error);
            throw error;
        }
    }
    
    /**
     * Find all tasks with optional filtering
     */
    async findAll(options = {}) {
        try {
            const tasks = await this._getAllTasks();
            let result = tasks.map(taskData => this._hydrateTask(taskData));
            
            // Apply filters
            if (options.userId) {
                result = result.filter(task => task.userId === options.userId);
            }
            
            if (options.completed !== undefined) {
                result = result.filter(task => task.completed === options.completed);
            }
            
            if (options.priority) {
                result = result.filter(task => task.priority === options.priority);
            }
            
            if (options.category) {
                result = result.filter(task => task.category === options.category);
            }
            
            if (options.assignedTo) {
                result = result.filter(task => task.assignedTo === options.assignedTo);
            }
            
            // Apply sorting
            if (options.sortBy) {
                result = this._sortTasks(result, options.sortBy, options.sortOrder);
            }
            
            // Apply pagination
            if (options.limit || options.offset) {
                const offset = options.offset || 0;
                const limit = options.limit || result.length;
                result = result.slice(offset, offset + limit);
            }
            
            return result;
        } catch (error) {
            console.error('Error finding all tasks:', error);
            throw error;
        }
    }
    
    /**
     * Update task by ID
     */
    async update(id, updates) {
        try {
            const tasks = await this._getAllTasks();
            const taskIndex = tasks.findIndex(t => t.id === id);
            
            if (taskIndex === -1) {
                return null;
            }
            
            // Get current task data
            const currentTask = this._hydrateTask(tasks[taskIndex]);
            
            // Apply updates to task object
            Object.keys(updates).forEach(key => {
                if (currentTask.hasOwnProperty(`_${key}`) || currentTask.hasOwnProperty(key)) {
                    // Use setter methods if available
                    const setterName = `set${key.charAt(0).toUpperCase() + key.slice(1)}`;
                    const updateMethodName = `update${key.charAt(0).toUpperCase() + key.slice(1)}`;
                    
                    if (typeof currentTask[setterName] === 'function') {
                        currentTask[setterName](updates[key]);
                    } else if (typeof currentTask[updateMethodName] === 'function') {
                        currentTask[updateMethodName](updates[key]);
                    } else {
                        // Direct property update
                        if (currentTask.hasOwnProperty(`_${key}`)) {
                            currentTask[`_${key}`] = updates[key];
                        } else {
                            currentTask[key] = updates[key];
                        }
                    }
                }
            });
            
            // Update timestamp
            if (currentTask._updatedAt !== undefined) {
                currentTask._updatedAt = new Date();
            }
            
            // Update in storage
            tasks[taskIndex] = currentTask.toJSON ? currentTask.toJSON() : currentTask;
            await this._saveTasks(tasks);
            
            // Update cache
            this._cache.set(id, {
                data: currentTask,
                timestamp: Date.now()
            });
            
            return currentTask;
        } catch (error) {
            console.error('Error updating task:', error);
            throw error;
        }
    }
    
    /**
     * Delete task by ID
     */
    async delete(id) {
        try {
            const tasks = await this._getAllTasks();
            const taskIndex = tasks.findIndex(t => t.id === id);
            
            if (taskIndex === -1) {
                return false;
            }
            
            // Remove from array
            tasks.splice(taskIndex, 1);
            
            // Save to storage
            await this._saveTasks(tasks);
            
            // Remove from cache
            this._cache.delete(id);
            
            return true;
        } catch (error) {
            console.error('Error deleting task:', error);
            throw error;
        }
    }
    
    // Specialized query methods
    
    /**
     * Find tasks by user ID
     */
    async findByUserId(userId) {
        return this.findAll({ userId });
    }
    
    /**
     * Find tasks by category
     */
    async findByCategory(category) {
        return this.findAll({ category });
    }
    
    /**
     * Find tasks by priority
     */
    async findByPriority(priority) {
        return this.findAll({ priority });
    }
    
    /**
     * Find tasks by completion status
     */
    async findByStatus(completed) {
        return this.findAll({ completed });
    }
    
    /**
     * Find tasks assigned to a specific user
     */
    async findByAssignee(assignedTo) {
        return this.findAll({ assignedTo });
    }
    
    /**
     * Find overdue tasks
     */
    async findOverdue() {
        const tasks = await this.findAll();
        const now = new Date();
        
        return tasks.filter(task => {
            return !task.completed && 
                   task.dueDate && 
                   new Date(task.dueDate) < now;
        });
    }
    
    /**
     * Find tasks due within a date range
     */
    async findByDueDateRange(startDate, endDate) {
        const tasks = await this.findAll();
        
        return tasks.filter(task => {
            if (!task.dueDate) return false;
            
            const dueDate = new Date(task.dueDate);
            return dueDate >= startDate && dueDate <= endDate;
        });
    }
    
    /**
     * Search tasks by text
     */
    async search(query) {
        const tasks = await this.findAll();
        const searchTerm = query.toLowerCase();
        
        return tasks.filter(task => {
            return task.title.toLowerCase().includes(searchTerm) ||
                   task.description.toLowerCase().includes(searchTerm) ||
                   (task.tags && task.tags.some(tag => 
                       tag.toLowerCase().includes(searchTerm)));
        });
    }
    
    /**
     * Get task statistics
     */
    async getStatistics(userId = null) {
        const tasks = userId ? 
            await this.findByUserId(userId) : 
            await this.findAll();
        
        const stats = {
            total: tasks.length,
            completed: tasks.filter(t => t.completed).length,
            pending: tasks.filter(t => !t.completed).length,
            overdue: 0,
            byPriority: {
                high: tasks.filter(t => t.priority === 'high').length,
                medium: tasks.filter(t => t.priority === 'medium').length,
                low: tasks.filter(t => t.priority === 'low').length
            },
            byCategory: {}
        };
        
        // Count overdue tasks
        const now = new Date();
        stats.overdue = tasks.filter(task => {
            return !task.completed && 
                   task.dueDate && 
                   new Date(task.dueDate) < now;
        }).length;
        
        // Count by category
        tasks.forEach(task => {
            const category = task.category || 'uncategorized';
            stats.byCategory[category] = (stats.byCategory[category] || 0) + 1;
        });
        
        return stats;
    }
    
    // Private helper methods
    
    async _getAllTasks() {
        return this.storage.load(this.entityKey, []);
    }
    
    async _saveTasks(tasks) {
        return this.storage.save(this.entityKey, tasks);
    }
    
    _validateTask(task) {
        if (!task) {
            throw new Error('Task is required');
        }
        
        if (!task.title || task.title.trim() === '') {
            throw new Error('Task title is required');
        }
        
        if (!task.userId) {
            throw new Error('Task must be assigned to a user');
        }
    }
    
    _hydrateTask(taskData) {
        // Convert plain object back to Task instance
        // This assumes you have a Task.fromJSON method
        if (typeof Task !== 'undefined' && Task.fromJSON) {
            return Task.fromJSON(taskData);
        }
        return taskData;
    }
    
    _generateId() {
        return 'task_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    _getFromCache(id) {
        const cached = this._cache.get(id);
        if (!cached) return null;
        
        // Check if cache entry is expired
        if (Date.now() - cached.timestamp > this._cacheExpiry) {
            this._cache.delete(id);
            return null;
        }
        
        return cached.data;
    }
    
    _sortTasks(tasks, sortBy, sortOrder = 'asc') {
        return tasks.sort((a, b) => {
            let aValue = a[sortBy];
            let bValue = b[sortBy];
            
            // Handle date sorting
            if (sortBy.includes('Date') || sortBy.includes('At')) {
                aValue = new Date(aValue);
                bValue = new Date(bValue);
            }
            
            // Handle string sorting
            if (typeof aValue === 'string') {
                aValue = aValue.toLowerCase();
                bValue = bValue.toLowerCase();
            }
            
            let comparison = 0;
            if (aValue > bValue) {
                comparison = 1;
            } else if (aValue < bValue) {
                comparison = -1;
            }
            
            return sortOrder === 'desc' ? -comparison : comparison;
        });
    }
}
```

## User Repository Implementation

### UserRepository Class

```javascript
/**
 * User Repository
 * Handles all data access operations for User entities
 */
class UserRepository extends BaseRepository {
    constructor(storageManager) {
        super();
        this.storage = storageManager;
        this.entityKey = 'users';
        this._cache = new Map();
        this._cacheExpiry = 10 * 60 * 1000; // 10 minutes
    }
    
    async create(user) {
        try {
            this._validateUser(user);
            
            if (!user.id) {
                user.id = this._generateId();
            }
            
            const users = await this._getAllUsers();
            
            // Check for duplicate username or email
            if (users.some(u => u.username === user.username)) {
                throw new Error(`Username ${user.username} already exists`);
            }
            
            if (users.some(u => u.email === user.email)) {
                throw new Error(`Email ${user.email} already exists`);
            }
            
            users.push(user.toJSON ? user.toJSON() : user);
            await this._saveUsers(users);
            
            this._cache.set(user.id, {
                data: user,
                timestamp: Date.now()
            });
            
            return user;
        } catch (error) {
            console.error('Error creating user:', error);
            throw error;
        }
    }
    
    async findById(id) {
        try {
            const cached = this._getFromCache(id);
            if (cached) return cached;
            
            const users = await this._getAllUsers();
            const userData = users.find(u => u.id === id);
            
            if (!userData) return null;
            
            const user = this._hydrateUser(userData);
            this._cache.set(id, {
                data: user,
                timestamp: Date.now()
            });
            
            return user;
        } catch (error) {
            console.error('Error finding user by ID:', error);
            throw error;
        }
    }
    
    async findAll(options = {}) {
        try {
            const users = await this._getAllUsers();
            let result = users.map(userData => this._hydrateUser(userData));
            
            // Apply filters
            if (options.isActive !== undefined) {
                result = result.filter(user => user.isActive === options.isActive);
            }
            
            if (options.role) {
                result = result.filter(user => user.role === options.role);
            }
            
            // Apply sorting
            if (options.sortBy) {
                result = this._sortUsers(result, options.sortBy, options.sortOrder);
            }
            
            return result;
        } catch (error) {
            console.error('Error finding all users:', error);
            throw error;
        }
    }
    
    async update(id, updates) {
        try {
            const users = await this._getAllUsers();
            const userIndex = users.findIndex(u => u.id === id);
            
            if (userIndex === -1) return null;
            
            const currentUser = this._hydrateUser(users[userIndex]);
            
            // Apply updates
            Object.keys(updates).forEach(key => {
                if (currentUser.hasOwnProperty(`_${key}`) || currentUser.hasOwnProperty(key)) {
                    const updateMethodName = `update${key.charAt(0).toUpperCase() + key.slice(1)}`;
                    
                    if (typeof currentUser[updateMethodName] === 'function') {
                        currentUser[updateMethodName](updates[key]);
                    } else {
                        if (currentUser.hasOwnProperty(`_${key}`)) {
                            currentUser[`_${key}`] = updates[key];
                        } else {
                            currentUser[key] = updates[key];
                        }
                    }
                }
            });
            
            users[userIndex] = currentUser.toJSON ? currentUser.toJSON() : currentUser;
            await this._saveUsers(users);
            
            this._cache.set(id, {
                data: currentUser,
                timestamp: Date.now()
            });
            
            return currentUser;
        } catch (error) {
            console.error('Error updating user:', error);
            throw error;
        }
    }
    
    async delete(id) {
        try {
            const users = await this._getAllUsers();
            const userIndex = users.findIndex(u => u.id === id);
            
            if (userIndex === -1) return false;
            
            users.splice(userIndex, 1);
            await this._saveUsers(users);
            this._cache.delete(id);
            
            return true;
        } catch (error) {
            console.error('Error deleting user:', error);
            throw error;
        }
    }
    
    // Specialized query methods
    
    async findByUsername(username) {
        const users = await this._getAllUsers();
        const userData = users.find(u => u.username === username);
        return userData ? this._hydrateUser(userData) : null;
    }
    
    async findByEmail(email) {
        const users = await this._getAllUsers();
        const userData = users.find(u => u.email === email);
        return userData ? this._hydrateUser(userData) : null;
    }
    
    async findActiveUsers() {
        return this.findAll({ isActive: true });
    }
    
    async findByRole(role) {
        return this.findAll({ role });
    }
    
    // Private helper methods
    
    async _getAllUsers() {
        return this.storage.load(this.entityKey, []);
    }
    
    async _saveUsers(users) {
        return this.storage.save(this.entityKey, users);
    }
    
    _validateUser(user) {
        if (!user) {
            throw new Error('User is required');
        }
        
        if (!user.username || user.username.trim() === '') {
            throw new Error('Username is required');
        }
        
        if (!user.email || user.email.trim() === '') {
            throw new Error('Email is required');
        }
        
        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(user.email)) {
            throw new Error('Invalid email format');
        }
    }
    
    _hydrateUser(userData) {
        if (typeof User !== 'undefined' && User.fromJSON) {
            return User.fromJSON(userData);
        }
        return userData;
    }
    
    _generateId() {
        return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    _getFromCache(id) {
        const cached = this._cache.get(id);
        if (!cached) return null;
        
        if (Date.now() - cached.timestamp > this._cacheExpiry) {
            this._cache.delete(id);
            return null;
        }
        
        return cached.data;
    }
    
    _sortUsers(users, sortBy, sortOrder = 'asc') {
        return users.sort((a, b) => {
            let aValue = a[sortBy];
            let bValue = b[sortBy];
            
            if (sortBy.includes('Date') || sortBy.includes('At')) {
                aValue = new Date(aValue);
                bValue = new Date(bValue);
            }
            
            if (typeof aValue === 'string') {
                aValue = aValue.toLowerCase();
                bValue = bValue.toLowerCase();
            }
            
            let comparison = 0;
            if (aValue > bValue) {
                comparison = 1;
            } else if (aValue < bValue) {
                comparison = -1;
            }
            
            return sortOrder === 'desc' ? -comparison : comparison;
        });
    }
}
```

## Usage Examples

### Basic Repository Usage

```javascript
// Initialize repositories
const storageManager = new StorageManager();
const taskRepo = new TaskRepository(storageManager);
const userRepo = new UserRepository(storageManager);

// Create a user
const user = new User('john_doe', 'john@example.com');
await userRepo.create(user);

// Create a task
const task = new Task('Complete project', 'Finish the task management system', user.id);
await taskRepo.create(task);

// Find tasks by user
const userTasks = await taskRepo.findByUserId(user.id);

// Search tasks
const searchResults = await taskRepo.search('project');

// Get statistics
const stats = await taskRepo.getStatistics(user.id);
```

### Advanced Querying

```javascript
// Find overdue tasks
const overdueTasks = await taskRepo.findOverdue();

// Find tasks due this week
const startOfWeek = new Date();
const endOfWeek = new Date();
endOfWeek.setDate(startOfWeek.getDate() + 7);
const thisWeekTasks = await taskRepo.findByDueDateRange(startOfWeek, endOfWeek);

// Find high priority pending tasks
const urgentTasks = await taskRepo.findAll({
    priority: 'high',
    completed: false,
    sortBy: 'dueDate',
    sortOrder: 'asc'
});
```

## Best Practices

1. **Keep repositories focused**: Each repository should handle only one entity type
2. **Use async/await**: All repository methods should be asynchronous
3. **Implement caching wisely**: Cache frequently accessed data but manage cache expiry
4. **Validate inputs**: Always validate data before storing
5. **Handle errors gracefully**: Provide meaningful error messages
6. **Use consistent naming**: Follow naming conventions across all repositories
7. **Document your methods**: Provide clear documentation for all public methods
8. **Consider performance**: Implement efficient querying and avoid loading unnecessary data

## Testing Repositories

```javascript
// Example repository test
describe('TaskRepository', () => {
    let taskRepo;
    let mockStorage;
    
    beforeEach(() => {
        mockStorage = new MockStorageManager();
        taskRepo = new TaskRepository(mockStorage);
    });
    
    test('should create task successfully', async () => {
        const task = new Task('Test Task', 'Description', 'user123');
        const created = await taskRepo.create(task);
        
        expect(created.id).toBeDefined();
        expect(created.title).toBe('Test Task');
    });
    
    test('should find task by ID', async () => {
        const task = new Task('Test Task', 'Description', 'user123');
        await taskRepo.create(task);
        
        const found = await taskRepo.findById(task.id);
        expect(found.title).toBe('Test Task');
    });
});
```

This Repository pattern implementation provides a solid foundation for your Day 2 refactoring, offering clean separation between business logic and data access while maintaining flexibility and testability.