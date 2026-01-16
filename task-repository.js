/**
 * Task Repository - Day 3 Implementation
 * Data access layer for Task management
 */

const { TaskValidator } = require('./validation');

class TaskRepository {
    constructor(storage = null) {
        this.storage = storage;
        this.tasks = new Map();
        this.listeners = new Map();
    }

    // Event system for reactive updates
    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
    }

    emit(event, data) {
        if (this.listeners.has(event)) {
            this.listeners.get(event).forEach(callback => callback(data));
        }
    }

    // Core CRUD operations
    async create(task) {
        if (!task || !task.id) {
            throw new Error('Valid task object required');
        }

        if (this.tasks.has(task.id)) {
            throw new Error('Task with this ID already exists');
        }

        this.tasks.set(task.id, task);
        this.emit('taskAdded', task);

        if (this.storage) {
            await this.saveToStorage();
        }

        return task;
    }

    async addTask(task) {
        return this.create(task);
    }

    async update(taskId, updates) {
        const task = this.tasks.get(taskId);
        if (!task) {
            return null;
        }

        // Apply updates
        Object.assign(task, updates);
        task.updatedAt = new Date();

        this.emit('taskUpdated', task);

        if (this.storage) {
            await this.saveToStorage();
        }

        return task;
    }

    async updateTask(taskId, updates) {
        return this.update(taskId, updates);
    }

    async deleteTask(taskId) {
        const task = this.tasks.get(taskId);
        if (!task) {
            throw new Error('Task not found');
        }

        this.tasks.delete(taskId);
        this.emit('taskDeleted', { id: taskId, task });

        if (this.storage) {
            await this.saveToStorage();
        }

        return task;
    }

    async findById(taskId) {
        return this.tasks.get(taskId) || null;
    }

    async findAll(filter = {}) {
        let tasks = Array.from(this.tasks.values());

        // Apply filters
        if (filter.userId) {
            tasks = tasks.filter(task => task.userId === filter.userId);
        }

        if (filter.completed !== undefined) {
            tasks = tasks.filter(task => task.completed === filter.completed);
        }

        if (filter.priority) {
            tasks = tasks.filter(task => task.priority === filter.priority);
        }

        // Sorting
        if (filter.sortBy) {
            tasks.sort((a, b) => {
                let aValue, bValue;

                switch (filter.sortBy) {
                    case 'title':
                        aValue = a.title.toLowerCase();
                        bValue = b.title.toLowerCase();
                        break;
                    default:
                        return 0;
                }

                if (filter.sortOrder === 'desc') {
                    return bValue - aValue;
                }
                return aValue - bValue;
            });
        }

        // Pagination
        if (filter.limit) {
            const offset = filter.offset || 0;
            tasks = tasks.slice(offset, offset + filter.limit);
        }

        return tasks;
    }

    getTask(taskId) {
        return this.tasks.get(taskId) || null;
    }

    getAllTasks() {
        return Array.from(this.tasks.values());
    }

    // Query methods
    getTasksByUser(userId) {
        return this.getAllTasks().filter(task => task.userId === userId);
    }

    getTasksByAssignee(assigneeId) {
        return this.getAllTasks().filter(task => task.assignedTo === assigneeId);
    }

    getTasksByStatus(status) {
        return this.getAllTasks().filter(task => task.status === status);
    }

    getTasksByPriority(priority) {
        return this.getAllTasks().filter(task => task.priority === priority);
    }

    getTasksByCategory(category) {
        return this.getAllTasks().filter(task => task.category === category);
    }

    getCompletedTasks() {
        return this.getAllTasks().filter(task => task.completed);
    }

    getIncompleteTasks() {
        return this.getAllTasks().filter(task => !task.completed);
    }

    getOverdueTasks() {
        return this.getAllTasks().filter(task => task.isOverdue);
    }

    getTasksDueToday() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        return this.getAllTasks().filter(task => {
            if (!task.dueDate) return false;
            const dueDate = new Date(task.dueDate);
            dueDate.setHours(0, 0, 0, 0);
            return dueDate >= today && dueDate < tomorrow;
        });
    }

    getTasksDueThisWeek() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const weekFromNow = new Date(today);
        weekFromNow.setDate(weekFromNow.getDate() + 7);

        return this.getAllTasks().filter(task => {
            if (!task.dueDate) return false;
            const dueDate = new Date(task.dueDate);
            dueDate.setHours(0, 0, 0, 0);
            return dueDate >= today && dueDate <= weekFromNow;
        });
    }

    // Advanced filtering
    getTasksByFilter(filter) {
        let tasks = this.getAllTasks();

        if (filter.userId) {
            tasks = tasks.filter(task => task.userId === filter.userId);
        }

        if (filter.assigneeId) {
            tasks = tasks.filter(task => task.assignedTo === filter.assigneeId);
        }

        if (filter.status) {
            tasks = tasks.filter(task => task.status === filter.status);
        }

        if (filter.priority) {
            tasks = tasks.filter(task => task.priority === filter.priority);
        }

        if (filter.category) {
            tasks = tasks.filter(task => task.category === filter.category);
        }

        if (filter.completed !== undefined) {
            tasks = tasks.filter(task => task.completed === filter.completed);
        }

        if (filter.overdue !== undefined) {
            tasks = tasks.filter(task => task.isOverdue === filter.overdue);
        }

        if (filter.tags && filter.tags.length > 0) {
            tasks = tasks.filter(task =>
                filter.tags.some(tag => task.hasTag(tag))
            );
        }

        if (filter.search) {
            const searchTerm = filter.search.toLowerCase();
            tasks = tasks.filter(task =>
                task.title.toLowerCase().includes(searchTerm) ||
                task.description.toLowerCase().includes(searchTerm)
            );
        }

        // Sorting
        if (filter.sortBy) {
            tasks.sort((a, b) => {
                let aValue, bValue;

                switch (filter.sortBy) {
                    case 'title':
                        aValue = a.title.toLowerCase();
                        bValue = b.title.toLowerCase();
                        break;
                    case 'priority':
                        const priorityOrder = { low: 1, medium: 2, high: 3, urgent: 4 };
                        aValue = priorityOrder[a.priority] || 0;
                        bValue = priorityOrder[b.priority] || 0;
                        break;
                    case 'dueDate':
                        aValue = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
                        bValue = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
                        break;
                    case 'createdAt':
                        aValue = new Date(a.createdAt).getTime();
                        bValue = new Date(b.createdAt).getTime();
                        break;
                    case 'updatedAt':
                        aValue = new Date(a.updatedAt).getTime();
                        bValue = new Date(b.updatedAt).getTime();
                        break;
                    default:
                        return 0;
                }

                if (filter.sortOrder === 'desc') {
                    return bValue - aValue;
                }
                return aValue - bValue;
            });
        }

        // Pagination
        if (filter.limit) {
            const offset = filter.offset || 0;
            tasks = tasks.slice(offset, offset + filter.limit);
        }

        return tasks;
    }

    // Statistics and analytics
    getTaskStats(userId = null) {
        let tasks = userId ? this.getTasksByUser(userId) : this.getAllTasks();

        const stats = {
            total: tasks.length,
            completed: tasks.filter(t => t.completed).length,
            incomplete: tasks.filter(t => !t.completed).length,
            overdue: tasks.filter(t => t.isOverdue).length,
            byPriority: {},
            byStatus: {},
            byCategory: {}
        };

        // Priority breakdown
        ['low', 'medium', 'high', 'urgent'].forEach(priority => {
            stats.byPriority[priority] = tasks.filter(t => t.priority === priority).length;
        });

        // Status breakdown
        ['pending', 'in-progress', 'completed', 'cancelled', 'on-hold'].forEach(status => {
            stats.byStatus[status] = tasks.filter(t => t.status === status).length;
        });

        // Category breakdown
        const categories = [...new Set(tasks.map(t => t.category))];
        categories.forEach(category => {
            stats.byCategory[category] = tasks.filter(t => t.category === category).length;
        });

        return stats;
    }

    // Bulk operations
    async addTasks(tasks) {
        if (!Array.isArray(tasks)) {
            throw new Error('Array of tasks required');
        }

        const results = [];
        const errors = [];

        for (const task of tasks) {
            try {
                const addedTask = await this.addTask(task);
                results.push(addedTask);
            } catch (error) {
                errors.push({ task, error: error.message });
            }
        }

        if (this.storage) {
            await this.saveToStorage();
        }

        return { results, errors };
    }

    async deleteTasks(taskIds) {
        if (!Array.isArray(taskIds)) {
            throw new Error('Array of task IDs required');
        }

        const results = [];
        const errors = [];

        for (const taskId of taskIds) {
            try {
                const deletedTask = await this.deleteTask(taskId);
                results.push(deletedTask);
            } catch (error) {
                errors.push({ taskId, error: error.message });
            }
        }

        if (this.storage) {
            await this.saveToStorage();
        }

        return { results, errors };
    }

    // Storage operations
    async loadFromStorage() {
        if (!this.storage) {
            throw new Error('No storage configured');
        }

        try {
            const data = await this.storage.load();
            if (data && Array.isArray(data.tasks)) {
                this.tasks.clear();
                data.tasks.forEach(taskData => {
                    const Task = require('./enhanced-task-model');
                    const task = Task.fromJSON(taskData);
                    this.tasks.set(task.id, task);
                });
            }
        } catch (error) {
            throw new Error(`Failed to load from storage: ${error.message}`);
        }
    }

    async saveToStorage() {
        if (!this.storage) {
            throw new Error('No storage configured');
        }

        try {
            const data = {
                tasks: Array.from(this.tasks.values()).map(task => task.toJSON()),
                lastSaved: new Date().toISOString()
            };
            await this.storage.save(data);
        } catch (error) {
            throw new Error(`Failed to save to storage: ${error.message}`);
        }
    }

    // Utility methods
    async exists(taskId) {
        return this.tasks.has(taskId);
    }

    async count() {
        return this.tasks.size;
    }

    clear() {
        this.tasks.clear();
        if (this.storage) {
            this.saveToStorage();
        }
    }

    get size() {
        return this.tasks.size;
    }

    hasTask(taskId) {
        return this.tasks.has(taskId);
    }

    // Iterator for easy looping
    [Symbol.iterator]() {
        return this.tasks.values();
    }
}

module.exports = { TaskRepository };
