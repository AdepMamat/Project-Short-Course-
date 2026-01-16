/**
 * Enhanced Task Model - Day 3 Implementation
 * Feature-complete Task model with advanced features
 */

const { TaskValidator } = require('./validation');

class Task {
    constructor(title, description = '', userId, options = {}) {
        // Validate required parameters
        if (!title || typeof title !== 'string' || title.trim() === '') {
            throw new Error('Task title is required');
        }
        if (!userId || typeof userId !== 'string' || userId.trim() === '') {
            throw new Error('User ID is required');
        }

        // Core properties
        this.id = this.generateId();
        this.title = title.trim();
        this.description = (description || '').trim();
        this.userId = userId.trim();
        this.assignedTo = options.assignedTo || userId;

        // Status and completion
        this.completed = false;
        this.status = 'pending';
        this.completedAt = null;

        // Priority and categorization
        this.priority = this.validatePriority(options.priority || 'medium');
        this.category = this.normalizeCategory(options.category || 'general');

        // Time tracking
        this.createdAt = new Date();
        this.updatedAt = new Date();
        this.dueDate = options.dueDate ? new Date(options.dueDate) : null;
        this.estimatedHours = options.estimatedHours || null;
        this.actualHours = options.actualHours || null;

        // Collections (using private properties)
        this._tags = [];
        this._notes = [];
        this._dependencies = [];

        // Additional metadata
        this.projectId = options.projectId || null;
        this.parentTaskId = options.parentTaskId || null;
        this.recurrence = options.recurrence || null;
    }

    generateId() {
        return 'task_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    validatePriority(priority) {
        const validPriorities = ['low', 'medium', 'high', 'urgent'];
        if (!validPriorities.includes(priority)) {
            throw new Error('Invalid priority');
        }
        return priority;
    }

    normalizeCategory(category) {
        return (category || 'general').toString().trim().toLowerCase();
    }

    // Title management
    updateTitle(newTitle) {
        if (!newTitle || typeof newTitle !== 'string' || newTitle.trim() === '') {
            throw new Error('Task title cannot be empty');
        }
        this.title = newTitle.trim();
        this.updatedAt = new Date();
        return this;
    }

    // Description management
    updateDescription(newDescription) {
        this.description = (newDescription || '').toString().trim();
        this.updatedAt = new Date();
        return this;
    }

    // Priority management
    updatePriority(newPriority) {
        this.priority = this.validatePriority(newPriority);
        this.updatedAt = new Date();
        return this;
    }

    // Completion management
    markComplete() {
        if (!this.completed) {
            this.completed = true;
            this.status = 'completed';
            this.completedAt = new Date();
            this.updatedAt = new Date();
        }
        return this;
    }

    markIncomplete() {
        if (this.completed) {
            this.completed = false;
            this.status = 'pending';
            this.completedAt = null;
            this.updatedAt = new Date();
        }
        return this;
    }

    // Assignment management
    assignTo(userId) {
        if (!userId || typeof userId !== 'string' || userId.trim() === '') {
            throw new Error('Valid user ID is required');
        }
        this.assignedTo = userId.trim();
        this.updatedAt = new Date();
        return this;
    }

    reassignToOwner() {
        this.assignedTo = this.userId;
        this.updatedAt = new Date();
        return this;
    }

    // Category management
    setCategory(category) {
        if (!category || typeof category !== 'string' || category.trim() === '') {
            throw new Error('Category must be a non-empty string');
        }
        this.category = this.normalizeCategory(category);
        this.updatedAt = new Date();
        return this;
    }

    // Tag management
    addTag(tag) {
        if (!tag || typeof tag !== 'string' || tag.trim() === '') {
            throw new Error('Tag must be a non-empty string');
        }
        const normalizedTag = tag.trim().toLowerCase();
        if (!this._tags.includes(normalizedTag)) {
            this._tags.push(normalizedTag);
            this.updatedAt = new Date();
        }
        return this;
    }

    removeTag(tag) {
        const normalizedTag = tag.toString().trim().toLowerCase();
        const index = this._tags.indexOf(normalizedTag);
        if (index > -1) {
            this._tags.splice(index, 1);
            this.updatedAt = new Date();
        }
        return this;
    }

    clearTags() {
        this._tags = [];
        this.updatedAt = new Date();
        return this;
    }

    hasTag(tag) {
        const normalizedTag = tag.toString().trim().toLowerCase();
        return this._tags.includes(normalizedTag);
    }

    // Due date management
    setDueDate(dueDate) {
        if (dueDate) {
            const date = new Date(dueDate);
            if (isNaN(date.getTime())) {
                throw new Error('Invalid due date');
            }
            this.dueDate = date;
        } else {
            this.dueDate = null;
        }
        this.updatedAt = new Date();
        return this;
    }

    clearDueDate() {
        this.dueDate = null;
        this.updatedAt = new Date();
        return this;
    }

    get isOverdue() {
        if (!this.dueDate || this.completed) return false;
        const dueDate = new Date(this.dueDate);
        const today = new Date();
        dueDate.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);
        return dueDate < today;
    }

    get daysUntilDue() {
        if (!this.dueDate) return null;
        const dueDate = new Date(this.dueDate);
        const today = new Date();
        dueDate.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);
        const diffTime = dueDate.getTime() - today.getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    // Time tracking
    setEstimatedHours(hours) {
        if (hours !== null && (typeof hours !== 'number' || hours < 0)) {
            throw new Error('Hours must be a positive number');
        }
        this.estimatedHours = hours;
        this.updatedAt = new Date();
        return this;
    }

    setActualHours(hours) {
        if (hours !== null && (typeof hours !== 'number' || hours < 0)) {
            throw new Error('Hours must be a positive number');
        }
        this.actualHours = hours;
        this.updatedAt = new Date();
        return this;
    }

    addTimeSpent(hours) {
        if (typeof hours !== 'number' || hours < 0) {
            throw new Error('Hours must be a positive number');
        }
        this.actualHours = (this.actualHours || 0) + hours;
        this.updatedAt = new Date();
        return this;
    }

    get progress() {
        if (this.completed) return 100;
        if (!this.estimatedHours || !this.actualHours) return 0;
        const progress = (this.actualHours / this.estimatedHours) * 100;
        return Math.min(progress, 100);
    }

    // Status management
    setStatus(status) {
        const validStatuses = ['pending', 'in-progress', 'completed', 'cancelled', 'on-hold'];
        if (!validStatuses.includes(status)) {
            throw new Error('Invalid status');
        }
        this.status = status;

        // Auto-update completion based on status
        if (status === 'completed' && !this.completed) {
            this.markComplete();
        } else if (status !== 'completed' && this.completed) {
            this.markIncomplete();
        }

        this.updatedAt = new Date();
        return this;
    }

    // Notes management
    addNote(content, author = this.userId) {
        if (!content || typeof content !== 'string' || content.trim() === '') {
            throw new Error('Note must be a non-empty string');
        }
        const note = {
            id: this.generateId(),
            content: content.trim(),
            author: author,
            createdAt: new Date()
        };
        this.notes.push(note);
        this.updatedAt = new Date();
        return this;
    }

    removeNote(noteId) {
        const index = this.notes.findIndex(note => note.id === noteId);
        if (index > -1) {
            this.notes.splice(index, 1);
            this.updatedAt = new Date();
        }
        return this;
    }

    // Dependencies management
    addDependency(taskId) {
        if (taskId === this.id) {
            throw new Error('Task cannot depend on itself');
        }
        if (!this.dependencies.includes(taskId)) {
            this.dependencies.push(taskId);
            this.updatedAt = new Date();
        }
        return this;
    }

    removeDependency(taskId) {
        const index = this.dependencies.indexOf(taskId);
        if (index > -1) {
            this.dependencies.splice(index, 1);
            this.updatedAt = new Date();
        }
        return this;
    }

    hasDependency(taskId) {
        return this.dependencies.includes(taskId);
    }

    // Serialization
    toJSON() {
        return {
            id: this.id,
            title: this.title,
            description: this.description,
            userId: this.userId,
            assignedTo: this.assignedTo,
            completed: this.completed,
            status: this.status,
            completedAt: this.completedAt,
            priority: this.priority,
            category: this.category,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            dueDate: this.dueDate,
            estimatedHours: this.estimatedHours,
            actualHours: this.actualHours,
            tags: [...this.tags],
            notes: [...this.notes],
            dependencies: [...this.dependencies],
            projectId: this.projectId,
            parentTaskId: this.parentTaskId,
            recurrence: this.recurrence
        };
    }

    static fromJSON(json) {
        const task = new Task(json.title, json.description, json.userId, {
            assignedTo: json.assignedTo,
            priority: json.priority,
            category: json.category,
            dueDate: json.dueDate,
            estimatedHours: json.estimatedHours,
            actualHours: json.actualHours,
            projectId: json.projectId,
            parentTaskId: json.parentTaskId,
            recurrence: json.recurrence
        });

        // Restore additional properties
        task.id = json.id;
        task.completed = json.completed;
        task.status = json.status;
        task.completedAt = json.completedAt ? new Date(json.completedAt) : null;
        task.createdAt = new Date(json.createdAt);
        task.updatedAt = new Date(json.updatedAt);
        task._tags = [...(json.tags || [])];
        task._notes = [...(json.notes || [])];
        task._dependencies = [...(json.dependencies || [])];

        return task;
    }

    // Cloning
    clone() {
        const json = this.toJSON();
        const cloned = Task.fromJSON(json);
        cloned.id = this.generateId(); // Generate new ID for clone
        cloned.createdAt = new Date();
        cloned.updatedAt = new Date();
        cloned.completedAt = null;
        cloned.completed = false;
        cloned.status = 'pending';
        return cloned;
    }

    // Getters for computed properties
    get tags() {
        return [...(this._tags || [])];
    }

    set tags(value) {
        this._tags = Array.isArray(value) ? [...value] : [];
    }

    get notes() {
        return [...(this._notes || [])];
    }

    set notes(value) {
        this._notes = Array.isArray(value) ? [...value] : [];
    }

    get dependencies() {
        return [...(this._dependencies || [])];
    }

    set dependencies(value) {
        this._dependencies = Array.isArray(value) ? [...value] : [];
    }
}

module.exports = Task;
