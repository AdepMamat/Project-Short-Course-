/**
 * Validation Module - Day 3 Implementation
 * Centralized validation logic for Task management
 */

class TitleValidationStrategy {
    constructor(minLength = 1, maxLength = 100) {
        this.minLength = minLength;
        this.maxLength = maxLength;
    }

    validate(title) {
        const errors = [];

        if (title === null || title === undefined || title === '') {
            errors.push('Title is required');
            return { isValid: false, errors };
        }

        const trimmed = title.trim();

        if (trimmed.length === 0) {
            errors.push('Title cannot be empty or only whitespace');
        }

        if (trimmed.length < this.minLength) {
            errors.push(`Title must be at least ${this.minLength} character(s)`);
        }

        if (trimmed.length > this.maxLength) {
            errors.push(`Title must be no more than ${this.maxLength} characters`);
        }

        if (/<[^>]*>/g.test(trimmed)) {
            errors.push('Title cannot contain HTML tags');
        }

        return {
            isValid: errors.length === 0,
            errors,
            sanitizedValue: this.sanitize(trimmed)
        };
    }

    sanitize(text) {
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '<')
            .replace(/>/g, '>')
            .replace(/"/g, '"')
            .replace(/'/g, '&#x27;');
    }
}

class DescriptionValidationStrategy {
    constructor(maxLength = 500) {
        this.maxLength = maxLength;
    }

    validate(description) {
        const errors = [];

        if (description === null || description === undefined || description === '') {
            return { isValid: true, errors: [], sanitizedValue: '' };
        }

        const trimmed = description.trim();

        if (trimmed.length > this.maxLength) {
            errors.push(`Description must be no more than ${this.maxLength} characters`);
        }

        if (/<[^>]*>/g.test(trimmed)) {
            errors.push('Description cannot contain HTML tags');
        }

        return {
            isValid: errors.length === 0,
            errors,
            sanitizedValue: this.sanitize(trimmed)
        };
    }

    sanitize(text) {
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '<')
            .replace(/>/g, '>')
            .replace(/"/g, '"')
            .replace(/'/g, '&#x27;');
    }
}

class PriorityValidationStrategy {
    constructor() {
        this.valid = ['high', 'medium', 'low'];
    }

    validate(priority) {
        if (!priority) {
            return { isValid: true, errors: [], sanitizedValue: 'medium' };
        }

        const normalized = priority.trim().toLowerCase();

        if (!this.valid.includes(normalized)) {
            return {
                isValid: false,
                errors: ['Priority must be one of: high, medium, low']
            };
        }

        return {
            isValid: true,
            errors: [],
            sanitizedValue: normalized
        };
    }
}

class DueDateValidationStrategy {
    validate(dueDate) {
        if (!dueDate) {
            return { isValid: true, errors: [], sanitizedValue: null };
        }

        const date = new Date(dueDate);
        if (isNaN(date.getTime())) {
            return { isValid: false, errors: ['Due date must be a valid date'] };
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (date < today) {
            return { isValid: false, errors: ['Due date must be today or in the future'] };
        }

        return {
            isValid: true,
            errors: [],
            sanitizedValue: dueDate
        };
    }
}

class TaskValidator {
    constructor() {
        this.title = new TitleValidationStrategy();
        this.description = new DescriptionValidationStrategy();
        this.priority = new PriorityValidationStrategy();
        this.dueDate = new DueDateValidationStrategy();
    }

    validateTask(task) {
        const errors = [];
        const sanitizedData = {};
        const fieldResults = {};

        // TITLE (REQUIRED)
        fieldResults.title = this.title.validate(task.title);
        if (!fieldResults.title.isValid) {
            fieldResults.title.errors.forEach(e => errors.push(`title: ${e}`));
        } else {
            sanitizedData.title = fieldResults.title.sanitizedValue;
        }

        // DESCRIPTION (OPTIONAL)
        if ('description' in task) {
            fieldResults.description = this.description.validate(task.description);
            if (!fieldResults.description.isValid) {
                fieldResults.description.errors.forEach(e => errors.push(`description: ${e}`));
            } else {
                sanitizedData.description = fieldResults.description.sanitizedValue;
            }
        } else {
            sanitizedData.description = '';
        }

        // PRIORITY (OPTIONAL)
        if ('priority' in task) {
            fieldResults.priority = this.priority.validate(task.priority);
            if (!fieldResults.priority.isValid) {
                fieldResults.priority.errors.forEach(e => errors.push(`priority: ${e}`));
            } else {
                sanitizedData.priority = fieldResults.priority.sanitizedValue;
            }
        } else {
            sanitizedData.priority = 'medium';
        }

        // DUEDATE (OPTIONAL)
        if ('dueDate' in task) {
            fieldResults.dueDate = this.dueDate.validate(task.dueDate);
            if (!fieldResults.dueDate.isValid) {
                fieldResults.dueDate.errors.forEach(e => errors.push(`dueDate: ${e}`));
            } else {
                sanitizedData.dueDate = fieldResults.dueDate.sanitizedValue;
            }
        } else {
            sanitizedData.dueDate = null;
        }

        return {
            isValid: errors.length === 0,
            errors,
            fieldResults,
            sanitizedData
        };
    }

    validateTaskUpdate(updates) {
        // For updates, we only validate the fields that are being updated
        const mockTask = { ...updates };
        return this.validateTask(mockTask);
    }
}

module.exports = {
    TitleValidationStrategy,
    DescriptionValidationStrategy,
    PriorityValidationStrategy,
    DueDateValidationStrategy,
    TaskValidator
};
