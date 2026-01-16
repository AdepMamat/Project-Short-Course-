# Enhanced Models Guide - Day 2

## Overview

In Day 2, we'll enhance our basic Task model and introduce a new User model to support multi-user functionality. This guide covers the design principles, implementation details, and best practices for creating robust, extensible models.

## Model Design Principles

### 1. Encapsulation
- Keep internal state private using naming conventions (`_property`)
- Provide controlled access through getters and setters
- Validate data at the model level

### 2. Single Responsibility
- Each model should represent one business entity
- Keep business logic related to the entity within the model
- Separate concerns between different models

### 3. Data Integrity
- Validate all inputs in constructors and setters
- Maintain referential integrity between related entities
- Provide meaningful error messages for validation failures

### 4. Immutability Where Appropriate
- Make certain properties immutable after creation (like IDs, creation dates)
- Provide controlled mutation through specific methods
- Track changes with update timestamps

## Enhanced Task Model

### Design Requirements

The enhanced Task model needs to support:
- Multi-user assignment and ownership
- Categories and tags for organization
- Due dates and time tracking
- Enhanced priority and status management
- Relationships with other entities

### Implementation

```javascript
/**
 * Enhanced Task Model - Day 2 Implementation
 * 
 * Represents a task with enhanced properties for multi-user support,
 * categorization, time tracking, and improved organization.
 */
class Task {
    constructor(title, description, userId, options = {}) {
        // Validate required parameters
        this._validateConstructorParams(title, description, userId);
        
        // Core properties (immutable after creation)
        this._id = options.id || this._generateId();
        this._createdAt = options.createdAt ? new Date(options.createdAt) : new Date();
        
        // Basic properties (from Day 1, enhanced)
        this._title = title.trim();
        this._description = description ? description.trim() : '';
        this._priority = this._validatePriority(options.priority || 'medium');
        this._completed = Boolean(options.completed);
        this._updatedAt = options.updatedAt ? new Date(options.updatedAt) : new Date();
        
        // User-related properties (new in Day 2)
        this._userId = userId; // Owner of the task
        this._assignedTo = options.assignedTo || userId; // Who should complete it
        
        // Organization properties (new in Day 2)
        this._category = this._validateCategory(options.category || 'general');
        this._tags = this._validateTags(options.tags || []);
        
        // Time-related properties (new in Day 2)
        this._dueDate = options.dueDate ? new Date(options.dueDate) : null;
        this._estimatedHours = this._validateHours(options.estimatedHours);
        this._actualHours = this._validateHours(options.actualHours);
        
        // Status properties (enhanced in Day 2)
        this._status = this._validateStatus(options.status || 'pending');
        this._completedAt = options.completedAt ? new Date(options.completedAt) : null;
        
        // Metadata (new in Day 2)
        this._notes = options.notes || [];
        this._attachments = options.attachments || [];
        this._dependencies = options.dependencies || []; // Task IDs this task depends on
    }
    
    // Immutable properties (read-only)
    get id() { return this._id; }
    get createdAt() { return new Date(this._createdAt); }
    get userId() { return this._userId; }
    
    // Basic properties (with controlled access)
    get title() { return this._title; }
    get description() { return this._description; }
    get priority() { return this._priority; }
    get completed() { return this._completed; }
    get updatedAt() { return new Date(this._updatedAt); }
    
    // User-related properties
    get assignedTo() { return this._assignedTo; }
    
    // Organization properties
    get category() { return this._category; }
    get tags() { return [...this._tags]; } // Return copy to prevent mutation
    
    // Time-related properties
    get dueDate() { return this._dueDate ? new Date(this._dueDate) : null; }
    get estimatedHours() { return this._estimatedHours; }
    get actualHours() { return this._actualHours; }
    
    // Status properties
    get status() { return this._status; }
    get completedAt() { return this._completedAt ? new Date(this._completedAt) : null; }
    
    // Metadata properties
    get notes() { return [...this._notes]; }
    get attachments() { return [...this._attachments]; }
    get dependencies() { return [...this._dependencies]; }
    
    // Computed properties
    get isOverdue() {
        if (!this._dueDate || this._completed) return false;
        return new Date() > this._dueDate;
    }
    
    get daysUntilDue() {
        if (!this._dueDate) return null;
        const now = new Date();
        const diffTime = this._dueDate - now;
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
    
    get progress() {
        if (this._completed) return 100;
        if (!this._estimatedHours || !this._actualHours) return 0;
        return Math.min(100, (this._actualHours / this._estimatedHours) * 100);
    }
    
    // Basic update methods (from Day 1, enhanced)
    updateTitle(newTitle) {
        if (!newTitle || newTitle.trim() === '') {
            throw new Error('Task title cannot be empty');
        }
        this._title = newTitle.trim();
        this._touch();
        return this;
    }
    
    updateDescription(newDescription) {
        this._description = newDescription ? newDescription.trim() : '';
        this._touch();
        return this;
    }
    
    updatePriority(newPriority) {
        this._priority = this._validatePriority(newPriority);
        this._touch();
        return this;
    }
    
    // Completion methods (enhanced)
    markComplete() {
        if (this._completed) return this;
        
        this._completed = true;
        this._status = 'completed';
        this._completedAt = new Date();
        this._touch();
        return this;
    }
    
    markIncomplete() {
        if (!this._completed) return this;
        
        this._completed = false;
        this._status = 'pending';
        this._completedAt = null;
        this._touch();
        return this;
    }
    
    // Assignment methods (new in Day 2)
    assignTo(userId) {
        if (!userId || typeof userId !== 'string') {
            throw new Error('Valid user ID is required for assignment');
        }
        this._assignedTo = userId;
        this._touch();
        return this;
    }
    
    reassignToOwner() {
        this._assignedTo = this._userId;
        this._touch();
        return this;
    }
    
    // Category methods (new in Day 2)
    setCategory(category) {
        this._category = this._validateCategory(category);
        this._touch();
        return this;
    }
    
    // Tag methods (new in Day 2)
    addTag(tag) {
        if (!tag || typeof tag !== 'string') {
            throw new Error('Tag must be a non-empty string');
        }
        
        const normalizedTag = tag.trim().toLowerCase();
        if (!this._tags.includes(normalizedTag)) {
            this._tags.push(normalizedTag);
            this._touch();
        }
        return this;
    }
    
    removeTag(tag) {
        const normalizedTag = tag.trim().toLowerCase();
        const index = this._tags.indexOf(normalizedTag);
        if (index > -1) {
            this._tags.splice(index, 1);
            this._touch();
        }
        return this;
    }
    
    clearTags() {
        this._tags = [];
        this._touch();
        return this;
    }
    
    hasTag(tag) {
        return this._tags.includes(tag.trim().toLowerCase());
    }
    
    // Time management methods (new in Day 2)
    setDueDate(date) {
        if (date && !(date instanceof Date)) {
            date = new Date(date);
        }
        
        if (date && isNaN(date.getTime())) {
            throw new Error('Invalid due date');
        }
        
        this._dueDate = date;
        this._touch();
        return this;
    }
    
    clearDueDate() {
        this._dueDate = null;
        this._touch();
        return this;
    }
    
    setEstimatedHours(hours) {
        this._estimatedHours = this._validateHours(hours);
        this._touch();
        return this;
    }
    
    setActualHours(hours) {
        this._actualHours = this._validateHours(hours);
        this._touch();
        return this;
    }
    
    addTimeSpent(hours) {
        if (typeof hours !== 'number' || hours < 0) {
            throw new Error('Hours must be a positive number');
        }
        
        this._actualHours = (this._actualHours || 0) + hours;
        this._touch();
        return this;
    }
    
    // Status methods (new in Day 2)
    setStatus(status) {
        this._status = this._validateStatus(status);
        
        // Auto-update completion status based on status
        if (status === 'completed' && !this._completed) {
            this.markComplete();
        } else if (status !== 'completed' && this._completed) {
            this.markIncomplete();
        }
        
        return this;
    }
    
    // Note methods (new in Day 2)
    addNote(note, author = null) {
        if (!note || typeof note !== 'string') {
            throw new Error('Note must be a non-empty string');
        }
        
        const noteObj = {
            id: this._generateId(),
            content: note.trim(),
            author: author,
            createdAt: new Date()
        };
        
        this._notes.push(noteObj);
        this._touch();
        return this;
    }
    
    removeNote(noteId) {
        const index = this._notes.findIndex(note => note.id === noteId);
        if (index > -1) {
            this._notes.splice(index, 1);
            this._touch();
        }
        return this;
    }
    
    // Dependency methods (new in Day 2)
    addDependency(taskId) {
        if (!taskId || typeof taskId !== 'string') {
            throw new Error('Task ID must be a non-empty string');
        }
        
        if (taskId === this._id) {
            throw new Error('Task cannot depend on itself');
        }
        
        if (!this._dependencies.includes(taskId)) {
            this._dependencies.push(taskId);
            this._touch();
        }
        return this;
    }
    
    removeDependency(taskId) {
        const index = this._dependencies.indexOf(taskId);
        if (index > -1) {
            this._dependencies.splice(index, 1);
            this._touch();
        }
        return this;
    }
    
    hasDependency(taskId) {
        return this._dependencies.includes(taskId);
    }
    
    // Utility methods
    clone() {
        const clonedData = this.toJSON();
        clonedData.id = this._generateId(); // New ID for clone
        clonedData.createdAt = new Date();
        clonedData.updatedAt = new Date();
        return Task.fromJSON(clonedData);
    }
    
    // Serialization methods
    toJSON() {
        return {
            id: this._id,
            title: this._title,
            description: this._description,
            userId: this._userId,
            assignedTo: this._assignedTo,
            priority: this._priority,
            category: this._category,
            tags: [...this._tags],
            completed: this._completed,
            status: this._status,
            dueDate: this._dueDate ? this._dueDate.toISOString() : null,
            estimatedHours: this._estimatedHours,
            actualHours: this._actualHours,
            notes: [...this._notes],
            attachments: [...this._attachments],
            dependencies: [...this._dependencies],
            createdAt: this._createdAt.toISOString(),
            updatedAt: this._updatedAt.toISOString(),
            completedAt: this._completedAt ? this._completedAt.toISOString() : null
        };
    }
    
    static fromJSON(data) {
        const task = new Task(data.title, data.description, data.userId, {
            id: data.id,
            assignedTo: data.assignedTo,
            priority: data.priority,
            category: data.category,
            tags: data.tags,
            completed: data.completed,
            status: data.status,
            dueDate: data.dueDate,
            estimatedHours: data.estimatedHours,
            actualHours: data.actualHours,
            notes: data.notes,
            attachments: data.attachments,
            dependencies: data.dependencies,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
            completedAt: data.completedAt
        });
        
        return task;
    }
    
    // Private validation methods
    _validateConstructorParams(title, description, userId) {
        if (!title || typeof title !== 'string' || title.trim() === '') {
            throw new Error('Task title is required and must be a non-empty string');
        }
        
        if (description !== null && description !== undefined && typeof description !== 'string') {
            throw new Error('Task description must be a string or null');
        }
        
        if (!userId || typeof userId !== 'string') {
            throw new Error('User ID is required and must be a non-empty string');
        }
    }
    
    _validatePriority(priority) {
        const validPriorities = ['low', 'medium', 'high', 'urgent'];
        if (!validPriorities.includes(priority)) {
            throw new Error(`Invalid priority: ${priority}. Must be one of: ${validPriorities.join(', ')}`);
        }
        return priority;
    }
    
    _validateCategory(category) {
        if (!category || typeof category !== 'string') {
            throw new Error('Category must be a non-empty string');
        }
        return category.trim().toLowerCase();
    }
    
    _validateTags(tags) {
        if (!Array.isArray(tags)) {
            throw new Error('Tags must be an array');
        }
        
        return tags.map(tag => {
            if (typeof tag !== 'string') {
                throw new Error('All tags must be strings');
            }
            return tag.trim().toLowerCase();
        });
    }
    
    _validateStatus(status) {
        const validStatuses = ['pending', 'in-progress', 'blocked', 'completed', 'cancelled'];
        if (!validStatuses.includes(status)) {
            throw new Error(`Invalid status: ${status}. Must be one of: ${validStatuses.join(', ')}`);
        }
        return status;
    }
    
    _validateHours(hours) {
        if (hours === null || hours === undefined) {
            return null;
        }
        
        if (typeof hours !== 'number' || hours < 0) {
            throw new Error('Hours must be a positive number or null');
        }
        
        return hours;
    }
    
    _generateId() {
        return 'task_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    _touch() {
        this._updatedAt = new Date();
    }
}
```

## User Model

### Design Requirements

The User model needs to support:
- User authentication and profile management
- Role-based access control
- User preferences and settings
- Activity tracking
- Relationships with tasks

### Implementation

```javascript
/**
 * User Model - Day 2 Implementation
 * 
 * Represents a user with profile information, preferences,
 * role management, and activity tracking.
 */
class User {
    constructor(username, email, options = {}) {
        // Validate required parameters
        this._validateConstructorParams(username, email);
        
        // Core properties (immutable after creation)
        this._id = options.id || this._generateId();
        this._createdAt = options.createdAt ? new Date(options.createdAt) : new Date();
        
        // Basic profile properties
        this._username = username.trim().toLowerCase();
        this._email = email.trim().toLowerCase();
        this._displayName = options.displayName || username.trim();
        this._firstName = options.firstName || '';
        this._lastName = options.lastName || '';
        this._avatar = options.avatar || null;
        this._bio = options.bio || '';
        
        // Authentication properties
        this._passwordHash = options.passwordHash || null; // In real app, never store plain passwords
        this._lastLoginAt = options.lastLoginAt ? new Date(options.lastLoginAt) : null;
        this._loginCount = options.loginCount || 0;
        
        // Status properties
        this._isActive = options.isActive !== undefined ? Boolean(options.isActive) : true;
        this._isVerified = options.isVerified !== undefined ? Boolean(options.isVerified) : false;
        this._role = this._validateRole(options.role || 'user');
        
        // Preferences and settings
        this._preferences = this._validatePreferences(options.preferences || {});
        this._timezone = options.timezone || 'UTC';
        this._language = options.language || 'en';
        this._theme = options.theme || 'light';
        
        // Activity tracking
        this._updatedAt = options.updatedAt ? new Date(options.updatedAt) : new Date();
        this._lastActiveAt = options.lastActiveAt ? new Date(options.lastActiveAt) : new Date();
        
        // Metadata
        this._tags = this._validateTags(options.tags || []);
        this._metadata = options.metadata || {};
    }
    
    // Immutable properties (read-only)
    get id() { return this._id; }
    get createdAt() { return new Date(this._createdAt); }
    get username() { return this._username; }
    get email() { return this._email; }
    
    // Profile properties
    get displayName() { return this._displayName; }
    get firstName() { return this._firstName; }
    get lastName() { return this._lastName; }
    get fullName() { 
        return `${this._firstName} ${this._lastName}`.trim() || this._displayName; 
    }
    get avatar() { return this._avatar; }
    get bio() { return this._bio; }
    
    // Authentication properties
    get lastLoginAt() { return this._lastLoginAt ? new Date(this._lastLoginAt) : null; }
    get loginCount() { return this._loginCount; }
    
    // Status properties
    get isActive() { return this._isActive; }
    get isVerified() { return this._isVerified; }
    get role() { return this._role; }
    
    // Preferences
    get preferences() { return { ...this._preferences }; }
    get timezone() { return this._timezone; }
    get language() { return this._language; }
    get theme() { return this._theme; }
    
    // Activity properties
    get updatedAt() { return new Date(this._updatedAt); }
    get lastActiveAt() { return new Date(this._lastActiveAt); }
    
    // Metadata
    get tags() { return [...this._tags]; }
    get metadata() { return { ...this._metadata }; }
    
    // Computed properties
    get initials() {
        if (this._firstName && this._lastName) {
            return `${this._firstName.charAt(0)}${this._lastName.charAt(0)}`.toUpperCase();
        }
        return this._displayName.substring(0, 2).toUpperCase();
    }
    
    get isAdmin() {
        return this._role === 'admin' || this._role === 'super-admin';
    }
    
    get canManageUsers() {
        return this._role === 'admin' || this._role === 'super-admin' || this._role === 'moderator';
    }
    
    get daysSinceJoined() {
        const now = new Date();
        const diffTime = now - this._createdAt;
        return Math.floor(diffTime / (1000 * 60 * 60 * 24));
    }
    
    get isNewUser() {
        return this.daysSinceJoined < 7;
    }
    
    // Profile update methods
    updateProfile(updates) {
        const allowedUpdates = [
            'displayName', 'firstName', 'lastName', 'bio', 'avatar'
        ];
        
        Object.keys(updates).forEach(key => {
            if (allowedUpdates.includes(key)) {
                const value = updates[key];
                
                switch (key) {
                    case 'displayName':
                        this.setDisplayName(value);
                        break;
                    case 'firstName':
                        this.setFirstName(value);
                        break;
                    case 'lastName':
                        this.setLastName(value);
                        break;
                    case 'bio':
                        this.setBio(value);
                        break;
                    case 'avatar':
                        this.setAvatar(value);
                        break;
                }
            }
        });
        
        return this;
    }
    
    setDisplayName(displayName) {
        if (!displayName || typeof displayName !== 'string' || displayName.trim() === '') {
            throw new Error('Display name must be a non-empty string');
        }
        this._displayName = displayName.trim();
        this._touch();
        return this;
    }
    
    setFirstName(firstName) {
        this._firstName = firstName ? firstName.trim() : '';
        this._touch();
        return this;
    }
    
    setLastName(lastName) {
        this._lastName = lastName ? lastName.trim() : '';
        this._touch();
        return this;
    }
    
    setBio(bio) {
        this._bio = bio ? bio.trim() : '';
        this._touch();
        return this;
    }
    
    setAvatar(avatar) {
        // In a real app, you'd validate the avatar URL or file
        this._avatar = avatar;
        this._touch();
        return this;
    }
    
    // Authentication methods
    login() {
        this._lastLoginAt = new Date();
        this._loginCount += 1;
        this._lastActiveAt = new Date();
        this._touch();
        return this;
    }
    
    logout() {
        // In a real app, you might want to track logout time
        this._touch();
        return this;
    }
    
    updateActivity() {
        this._lastActiveAt = new Date();
        // Don't update updatedAt for activity updates to avoid noise
        return this;
    }
    
    // Status management methods
    activate() {
        this._isActive = true;
        this._touch();
        return this;
    }
    
    deactivate() {
        this._isActive = false;
        this._touch();
        return this;
    }
    
    verify() {
        this._isVerified = true;
        this._touch();
        return this;
    }
    
    unverify() {
        this._isVerified = false;
        this._touch();
        return this;
    }
    
    setRole(role) {
        this._role = this._validateRole(role);
        this._touch();
        return this;
    }
    
    // Preference methods
    setPreference(key, value) {
        if (!key || typeof key !== 'string') {
            throw new Error('Preference key must be a non-empty string');
        }
        
        this._preferences[key] = value;
        this._touch();
        return this;
    }
    
    getPreference(key, defaultValue = null) {
        return this._preferences.hasOwnProperty(key) ? this._preferences[key] : defaultValue;
    }
    
    removePreference(key) {
        delete this._preferences[key];
        this._touch();
        return this;
    }
    
    clearPreferences() {
        this._preferences = {};
        this._touch();
        return this;
    }
    
    setTimezone(timezone) {
        // In a real app, you'd validate against a list of valid timezones
        this._timezone = timezone;
        this._touch();
        return this;
    }
    
    setLanguage(language) {
        // In a real app, you'd validate against supported languages
        this._language = language;
        this._touch();
        return this;
    }
    
    setTheme(theme) {
        const validThemes = ['light', 'dark', 'auto'];
        if (!validThemes.includes(theme)) {
            throw new Error(`Invalid theme: ${theme}. Must be one of: ${validThemes.join(', ')}`);
        }
        this._theme = theme;
        this._touch();
        return this;
    }
    
    // Tag methods
    addTag(tag) {
        if (!tag || typeof tag !== 'string') {
            throw new Error('Tag must be a non-empty string');
        }
        
        const normalizedTag = tag.trim().toLowerCase();
        if (!this._tags.includes(normalizedTag)) {
            this._tags.push(normalizedTag);
            this._touch();
        }
        return this;
    }
    
    removeTag(tag) {
        const normalizedTag = tag.trim().toLowerCase();
        const index = this._tags.indexOf(normalizedTag);
        if (index > -1) {
            this._tags.splice(index, 1);
            this._touch();
        }
        return this;
    }
    
    hasTag(tag) {
        return this._tags.includes(tag.trim().toLowerCase());
    }
    
    // Metadata methods
    setMetadata(key, value) {
        this._metadata[key] = value;
        this._touch();
        return this;
    }
    
    getMetadata(key, defaultValue = null) {
        return this._metadata.hasOwnProperty(key) ? this._metadata[key] : defaultValue;
    }
    
    // Permission methods
    hasPermission(permission) {
        const rolePermissions = {
            'user': ['read:own-tasks', 'write:own-tasks'],
            'moderator': ['read:own-tasks', 'write:own-tasks', 'read:all-tasks', 'moderate:tasks'],
            'admin': ['read:own-tasks', 'write:own-tasks', 'read:all-tasks', 'write:all-tasks', 'manage:users'],
            'super-admin': ['*'] // All permissions
        };
        
        const permissions = rolePermissions[this._role] || [];
        return permissions.includes('*') || permissions.includes(permission);
    }
    
    // Utility methods
    toPublicJSON() {
        // Return user data safe for public consumption (no sensitive info)
        return {
            id: this._id,
            username: this._username,
            displayName: this._displayName,
            firstName: this._firstName,
            lastName: this._lastName,
            fullName: this.fullName,
            initials: this.initials,
            avatar: this._avatar,
            bio: this._bio,
            role: this._role,
            isVerified: this._isVerified,
            createdAt: this._createdAt.toISOString(),
            tags: [...this._tags]
        };
    }
    
    // Serialization methods
    toJSON() {
        return {
            id: this._id,
            username: this._username,
            email: this._email,
            displayName: this._displayName,
            firstName: this._firstName,
            lastName: this._lastName,
            avatar: this._avatar,
            bio: this._bio,
            passwordHash: this._passwordHash,
            lastLoginAt: this._lastLoginAt ? this._lastLoginAt.toISOString() : null,
            loginCount: this._loginCount,
            isActive: this._isActive,
            isVerified: this._isVerified,
            role: this._role,
            preferences: { ...this._preferences },
            timezone: this._timezone,
            language: this._language,
            theme: this._theme,
            tags: [...this._tags],
            metadata: { ...this._metadata },
            createdAt: this._createdAt.toISOString(),
            updatedAt: this._updatedAt.toISOString(),
            lastActiveAt: this._lastActiveAt.toISOString()
        };
    }
    
    static fromJSON(data) {
        const user = new User(data.username, data.email, {
            id: data.id,
            displayName: data.displayName,
            firstName: data.firstName,
            lastName: data.lastName,
            avatar: data.avatar,
            bio: data.bio,
            passwordHash: data.passwordHash,
            lastLoginAt: data.lastLoginAt,
            loginCount: data.loginCount,
            isActive: data.isActive,
            isVerified: data.isVerified,
            role: data.role,
            preferences: data.preferences,
            timezone: data.timezone,
            language: data.language,
            theme: data.theme,
            tags: data.tags,
            metadata: data.metadata,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
            lastActiveAt: data.lastActiveAt
        });
        
        return user;
    }
    
    // Private validation methods
    _validateConstructorParams(username, email) {
        if (!username || typeof username !== 'string' || username.trim() === '') {
            throw new Error('Username is required and must be a non-empty string');
        }
        
        if (!email || typeof email !== 'string' || email.trim() === '') {
            throw new Error('Email is required and must be a non-empty string');
        }
        
        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            throw new Error('Invalid email format');
        }
        
        // Basic username validation
        const usernameRegex = /^[a-zA-Z0-9_-]+$/;
        if (!usernameRegex.test(username)) {
            throw new Error('Username can only contain letters, numbers, underscores, and hyphens');
        }
    }
    
    _validateRole(role) {
        const validRoles = ['user', 'moderator', 'admin', 'super-admin'];
        if (!validRoles.includes(role)) {
            throw new Error(`Invalid role: ${role}. Must be one of: ${validRoles.join(', ')}`);
        }
        return role;
    }
    
    _validatePreferences(preferences) {
        if (typeof preferences !== 'object' || preferences === null) {
            throw new Error('Preferences must be an object');
        }
        return { ...preferences };
    }
    
    _validateTags(tags) {
        if (!Array.isArray(tags)) {
            throw new Error('Tags must be an array');
        }
        
        return tags.map(tag => {
            if (typeof tag !== 'string') {
                throw new Error('All tags must be strings');
            }
            return tag.trim().toLowerCase();
        });
    }
    
    _generateId() {
        return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    _touch() {
        this._updatedAt = new Date();
    }
}
```

## Model Relationships

### Task-User Relationships

```javascript
// Example of how models relate to each other
class TaskUserRelationship {
    static getTasksForUser(userId, tasks) {
        return tasks.filter(task => task.userId === userId || task.assignedTo === userId);
    }
    
    static getTasksOwnedByUser(userId, tasks) {
        return tasks.filter(task => task.userId === userId);
    }
    
    static getTasksAssignedToUser(userId, tasks) {
        return tasks.filter(task => task.assignedTo === userId);
    }
    
    static validateTaskAssignment(task, assigneeUser, ownerUser) {
        if (!ownerUser.isActive) {
            throw new Error('Cannot assign tasks for inactive users');
        }
        
        if (!assigneeUser.isActive) {
            throw new Error('Cannot assign tasks to inactive users');
        }
        
        // Add more business rules as needed
        return true;
    }
}
```

## Usage Examples

### Creating Enhanced Models

```javascript
// Create a user
const user = new User('john_doe', 'john@example.com', {
    displayName: 'John Doe',
    firstName: 'John',
    lastName: 'Doe',
    role: 'user'
});

// Create an enhanced task
const task = new Task('Complete project documentation', 'Write comprehensive docs', user.id, {
    category: 'documentation',
    priority: 'high',
    dueDate: new Date('2024-02-15'),
    estimatedHours: 8,
    tags: ['documentation', 'project', 'urgent']
});

// Use enhanced features
task.addNote('Started working on this task', user.id);
task.setStatus('in-progress');
task.addTimeSpent(2);

user.setPreference('defaultCategory', 'work');
user.addTag('developer');
```

### Model Validation

```javascript
// The models include comprehensive validation
try {
    const invalidTask = new Task('', 'Description', 'user123'); // Empty title
} catch (error) {
    console.error(error.message); // "Task title is required and must be a non-empty string"
}

try {
    const invalidUser = new User('john', 'invalid-email'); // Invalid email
} catch (error) {
    console.error(error.message); // "Invalid email format"
}
```

## Best Practices

1. **Always validate inputs** at the model level
2. **Use immutable properties** for data that shouldn't change after creation
3. **Provide controlled mutation** through specific methods
4. **Include computed properties** for derived data
5. **Implement proper serialization** for data persistence
6. **Add comprehensive error handling** with meaningful messages
7. **Document your models** with clear comments and examples
8. **Test your models thoroughly** with unit tests

## Migration from Day 1

When migrating from Day 1 models:

1. **Preserve existing data** by implementing `fromJSON` methods that handle old data formats
2. **Add default values** for new properties
3. **Maintain backward compatibility** during the transition period
4. **Provide migration utilities** to update existing data

```javascript
// Example migration helper
class TaskMigration {
    static migrateFromV1(oldTaskData) {
        return {
            ...oldTaskData,
            userId: oldTaskData.userId || 'default-user',
            assignedTo: oldTaskData.assignedTo || oldTaskData.userId || 'default-user',
            category: oldTaskData.category || 'general',
            tags: oldTaskData.tags || [],
            status: oldTaskData.completed ? 'completed' : 'pending',
            // Add other new fields with defaults
        };
    }
}
```

This enhanced model design provides a solid foundation for your Day 2 implementation, supporting multi-user functionality while maintaining clean, testable, and extensible code.