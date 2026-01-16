# Day 3: Comprehensive Testing Guide

## Overview

Welcome to Day 3 of the Software Engineering Shortcourse! Today we'll transform your task management system by adding comprehensive testing. You'll learn how to write different types of tests, set up a testing framework, and ensure your code is reliable and maintainable.

## Learning Objectives

By the end of this day, you will be able to:
- Understand different types of testing (unit, integration, property-based)
- Set up and configure Jest testing framework
- Write comprehensive unit tests for models and services
- Implement integration tests for complete workflows
- Use property-based testing for robust validation
- Generate and interpret code coverage reports
- Apply Test-Driven Development (TDD) principles

## Prerequisites

- Completed Day 1 (Basic Structure) and Day 2 (Requirements & Design)
- Understanding of JavaScript classes and modules
- Basic knowledge of asynchronous programming (Promises/async-await)

## Testing Strategy Overview

### Types of Testing

1. **Unit Tests**: Test individual components in isolation
   - Test single functions, methods, or classes
   - Fast execution and focused scope
   - Easy to debug when they fail

2. **Integration Tests**: Test component interactions
   - Test how multiple components work together
   - Verify data flow between layers
   - Catch interface and communication issues

3. **Property-Based Tests**: Test universal properties
   - Generate many random inputs automatically
   - Verify properties that should always hold true
   - Catch edge cases you might not think of

4. **End-to-End Tests**: Test complete user workflows
   - Test from user interface to data storage
   - Verify complete feature functionality
   - Catch system-level issues

### Testing Pyramid

```
    /\
   /  \     E2E Tests (Few, Slow, Expensive)
  /____\
 /      \   Integration Tests (Some, Medium Speed)
/________\  Unit Tests (Many, Fast, Cheap)
```

## Setting Up Jest Testing Framework

### 1. Install Dependencies

Your `package.json` should already include Jest. If not, install it:

```bash
npm install --save-dev jest jest-environment-jsdom
```

### 2. Jest Configuration

Create or verify your `jest.config.js`:

```javascript
module.exports = {
    // Test environment
    testEnvironment: 'jsdom',
    
    // Test file patterns
    testMatch: [
        '**/tests/**/*.test.js',
        '**/day3-testing/**/*.test.js'
    ],
    
    // Coverage configuration
    collectCoverage: true,
    coverageDirectory: 'coverage',
    coverageReporters: ['text', 'lcov', 'html'],
    
    // Files to collect coverage from
    collectCoverageFrom: [
        'day1-basic-structure/**/*.js',
        'day2-requirements-design/**/*.js',
        '!**/*.test.js',
        '!**/node_modules/**'
    ],
    
    // Coverage thresholds
    coverageThreshold: {
        global: {
            branches: 70,
            functions: 80,
            lines: 80,
            statements: 80
        }
    },
    
    // Setup files
    setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
    
    // Verbose output for learning
    verbose: true,
    
    // Clear mocks between tests
    clearMocks: true
};
```

### 3. Test Scripts

Add these scripts to your `package.json`:

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:verbose": "jest --verbose"
  }
}
```

## Writing Unit Tests

### Test Structure and Organization

Organize your tests to mirror your source code structure:

```
day3-testing/
├── models/
│   ├── task.test.js
│   └── user.test.js
├── services/
│   ├── task-service.test.js
│   └── user-service.test.js
├── controllers/
│   └── task-controller.test.js
├── repositories/
│   └── task-repository.test.js
├── utils/
│   └── validation.test.js
└── integration/
    └── task-workflow.test.js
```

### Basic Test Structure

Every test file should follow this structure:

```javascript
// Import dependencies
const { TestDataFactory, TestAssertions } = require('./test-utilities');

// Import the class/module being tested
const Task = require('../day2-requirements-design/enhanced-task-model');

describe('Task Model', () => {
    // Setup and teardown
    beforeEach(() => {
        // Code that runs before each test
    });
    
    afterEach(() => {
        // Code that runs after each test
    });
    
    describe('Task Creation', () => {
        test('should create a task with required properties', () => {
            // Arrange
            const taskData = TestDataFactory.createValidTaskData();
            
            // Act
            const task = new Task(taskData.title, taskData.description, taskData.userId);
            
            // Assert
            expect(task.title).toBe(taskData.title);
            expect(task.userId).toBe(taskData.userId);
            TestAssertions.assertTaskHasRequiredProperties(task);
        });
    });
});
```

### Test Naming Conventions

Use descriptive test names that explain:
- What is being tested
- Under what conditions
- What the expected outcome is

**Good Examples:**
```javascript
test('should create task with valid data')
test('should throw error when title is empty')
test('should mark task as complete when markComplete is called')
test('should not allow assignment to non-existent user')
```

**Bad Examples:**
```javascript
test('task creation')
test('test update')
test('validation')
```

## Property-Based Testing

Property-based testing generates many random inputs to test universal properties of your code.

### What is a Property?

A property is a statement that should be true for all valid inputs. Examples:

- "For any valid task, serializing then deserializing should produce an equivalent task"
- "For any task list, adding a task should increase the list length by 1"
- "For any completed task, it should not be marked as overdue"

### Writing Property Tests

```javascript
const fc = require('fast-check'); // Property testing library

describe('Task Properties', () => {
    test('Property: Task serialization round-trip', () => {
        fc.assert(fc.property(
            fc.record({
                title: fc.string({ minLength: 1, maxLength: 100 }),
                description: fc.string({ maxLength: 500 }),
                userId: fc.string({ minLength: 1 }),
                priority: fc.constantFrom('low', 'medium', 'high')
            }),
            (taskData) => {
                // Create task
                const originalTask = new Task(
                    taskData.title, 
                    taskData.description, 
                    taskData.userId,
                    { priority: taskData.priority }
                );
                
                // Serialize and deserialize
                const serialized = originalTask.toJSON();
                const deserialized = Task.fromJSON(serialized);
                
                // Property: Round-trip should preserve essential data
                expect(deserialized.title).toBe(originalTask.title);
                expect(deserialized.userId).toBe(originalTask.userId);
                expect(deserialized.priority).toBe(originalTask.priority);
            }
        ), { numRuns: 100 }); // Run 100 times with random data
    });
});
```

## Integration Testing

Integration tests verify that multiple components work together correctly.

### Testing Component Interactions

```javascript
describe('Task Management Integration', () => {
    let taskRepository;
    let taskService;
    let taskController;
    
    beforeEach(async () => {
        // Set up the complete system
        const mockStorage = MockFactory.createMockStorage();
        taskRepository = new TaskRepository(mockStorage);
        taskService = new TaskService(taskRepository);
        taskController = new TaskController(taskService);
        
        await taskController.initialize('user123');
    });
    
    test('should create, update, and delete task through complete workflow', async () => {
        // Create task
        const taskData = TestDataFactory.createValidTaskData();
        const createdTask = await taskController.createTask(taskData);
        
        expect(createdTask.id).toBeDefined();
        expect(createdTask.title).toBe(taskData.title);
        
        // Update task
        const updates = { priority: 'high', description: 'Updated description' };
        const updatedTask = await taskController.updateTask(createdTask.id, updates);
        
        expect(updatedTask.priority).toBe('high');
        expect(updatedTask.description).toBe('Updated description');
        
        // Delete task
        const deleted = await taskController.deleteTask(createdTask.id);
        expect(deleted).toBe(true);
        
        // Verify deletion
        const retrievedTask = await taskController.getTask(createdTask.id);
        expect(retrievedTask).toBeNull();
    });
});
```

## Test Utilities and Helpers

Create reusable utilities to make testing easier and more consistent.

### Test Data Factory

```javascript
class TestDataFactory {
    static createValidTaskData(overrides = {}) {
        return {
            title: 'Test Task',
            description: 'Test Description',
            userId: 'user123',
            priority: 'medium',
            category: 'work',
            ...overrides
        };
    }
    
    static createMultipleTasks(count = 5) {
        return Array.from({ length: count }, (_, i) => 
            this.createValidTaskData({
                title: `Task ${i + 1}`,
                priority: ['low', 'medium', 'high'][i % 3]
            })
        );
    }
}
```

### Custom Assertions

```javascript
class TestAssertions {
    static assertTaskHasRequiredProperties(task) {
        expect(task).toHaveProperty('id');
        expect(task).toHaveProperty('title');
        expect(task).toHaveProperty('userId');
        expect(task).toHaveProperty('createdAt');
        expect(task).toHaveProperty('completed');
    }
    
    static assertValidationResult(result, shouldBeValid, expectedErrors = []) {
        expect(result.isValid).toBe(shouldBeValid);
        if (!shouldBeValid) {
            expectedErrors.forEach(error => {
                expect(result.errors).toContain(error);
            });
        }
    }
}
```

## Code Coverage

### Understanding Coverage Metrics

- **Line Coverage**: Percentage of code lines executed
- **Branch Coverage**: Percentage of code branches (if/else) executed
- **Function Coverage**: Percentage of functions called
- **Statement Coverage**: Percentage of statements executed

### Interpreting Coverage Reports

Run tests with coverage:
```bash
npm run test:coverage
```

This generates:
- Terminal output with coverage summary
- HTML report in `coverage/lcov-report/index.html`
- LCOV file for CI/CD integration

### Coverage Best Practices

1. **Aim for 80%+ coverage** but don't obsess over 100%
2. **Focus on critical paths** - ensure important business logic is covered
3. **Test edge cases** - error conditions, boundary values
4. **Don't test trivial code** - simple getters/setters
5. **Quality over quantity** - meaningful tests are better than coverage padding

## Test-Driven Development (TDD)

### TDD Cycle: Red-Green-Refactor

1. **Red**: Write a failing test
2. **Green**: Write minimal code to make it pass
3. **Refactor**: Improve code while keeping tests passing

### TDD Example

```javascript
// Step 1: Write failing test (RED)
describe('Task Priority Validation', () => {
    test('should reject invalid priority values', () => {
        expect(() => {
            new Task('Test', 'Description', 'user123', { priority: 'invalid' });
        }).toThrow('Invalid priority');
    });
});

// Step 2: Make it pass (GREEN)
class Task {
    constructor(title, description, userId, options = {}) {
        this._validatePriority(options.priority || 'medium');
        // ... rest of constructor
    }
    
    _validatePriority(priority) {
        const validPriorities = ['low', 'medium', 'high'];
        if (!validPriorities.includes(priority)) {
            throw new Error('Invalid priority');
        }
    }
}

// Step 3: Refactor (improve without breaking tests)
```

## Common Testing Patterns

### 1. Arrange-Act-Assert (AAA)

```javascript
test('should update task title', () => {
    // Arrange
    const task = new Task('Original', 'Description', 'user123');
    const newTitle = 'Updated Title';
    
    // Act
    task.updateTitle(newTitle);
    
    // Assert
    expect(task.title).toBe(newTitle);
});
```

### 2. Given-When-Then (BDD Style)

```javascript
test('should mark task as overdue when due date has passed', () => {
    // Given a task with a past due date
    const pastDate = new Date('2023-01-01');
    const task = new Task('Test', 'Description', 'user123', { dueDate: pastDate });
    
    // When checking if task is overdue
    const isOverdue = task.isOverdue;
    
    // Then it should be marked as overdue
    expect(isOverdue).toBe(true);
});
```

### 3. Test Doubles (Mocks, Stubs, Spies)

```javascript
test('should call storage when saving task', async () => {
    // Create mock storage
    const mockStorage = {
        save: jest.fn().mockResolvedValue(true),
        load: jest.fn().mockResolvedValue([])
    };
    
    const repository = new TaskRepository(mockStorage);
    const task = TestDataFactory.createValidTaskData();
    
    await repository.create(task);
    
    // Verify storage was called
    expect(mockStorage.save).toHaveBeenCalledWith('tasks', expect.any(Array));
});
```

## Error Testing

Always test error conditions and edge cases:

```javascript
describe('Error Handling', () => {
    test('should throw error when creating task without title', () => {
        expect(() => {
            new Task('', 'Description', 'user123');
        }).toThrow('Task title is required');
    });
    
    test('should handle storage failures gracefully', async () => {
        const failingStorage = {
            save: jest.fn().mockRejectedValue(new Error('Storage failed'))
        };
        
        const repository = new TaskRepository(failingStorage);
        
        await expect(repository.create(validTask))
            .rejects
            .toThrow('Storage failed');
    });
});
```

## Performance Testing

Test that your code performs well:

```javascript
describe('Performance', () => {
    test('should create 1000 tasks in reasonable time', async () => {
        const startTime = performance.now();
        
        const tasks = [];
        for (let i = 0; i < 1000; i++) {
            tasks.push(new Task(`Task ${i}`, 'Description', 'user123'));
        }
        
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        expect(duration).toBeLessThan(100); // Should complete in under 100ms
        expect(tasks).toHaveLength(1000);
    });
});
```

## Running Tests

### Basic Commands

```bash
# Run all tests
npm test

# Run tests in watch mode (re-runs on file changes)
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test task.test.js

# Run tests matching a pattern
npm test -- --testNamePattern="Task Creation"
```

### Debugging Tests

1. **Use `console.log`** for quick debugging
2. **Use `--verbose` flag** for detailed output
3. **Run single tests** to isolate issues
4. **Use debugger** with Node.js inspector

## Best Practices

### 1. Test Organization
- Group related tests with `describe` blocks
- Use clear, descriptive test names
- Keep tests focused and independent
- Follow the same structure across test files

### 2. Test Data Management
- Use factories for creating test data
- Avoid hardcoded values when possible
- Clean up after tests (reset state)
- Use meaningful test data that reflects real usage

### 3. Assertion Quality
- Use specific assertions (`toBe` vs `toBeTruthy`)
- Test one thing per test
- Include both positive and negative test cases
- Test edge cases and error conditions

### 4. Mock Usage
- Mock external dependencies
- Don't mock the system under test
- Verify mock interactions when relevant
- Reset mocks between tests

### 5. Maintenance
- Keep tests simple and readable
- Update tests when requirements change
- Remove obsolete tests
- Refactor tests along with production code

## Common Pitfalls to Avoid

1. **Testing Implementation Details**: Test behavior, not internal structure
2. **Brittle Tests**: Tests that break with minor changes
3. **Slow Tests**: Tests that take too long to run
4. **Flaky Tests**: Tests that sometimes pass, sometimes fail
5. **Over-Mocking**: Mocking everything makes tests less valuable
6. **Under-Testing**: Not testing error conditions and edge cases

## Next Steps

After completing Day 3 testing:

1. **Day 4**: Version Control and Collaboration
   - Git workflow and branching strategies
   - Code review processes
   - Collaborative development practices

2. **Day 5**: Deployment and Production
   - Production configuration
   - Monitoring and logging
   - Deployment strategies

## Resources and Further Reading

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Testing JavaScript Applications](https://testingjavascript.com/)
- [Property-Based Testing](https://hypothesis.works/articles/what-is-property-based-testing/)
- [Test-Driven Development](https://martinfowler.com/bliki/TestDrivenDevelopment.html)

## Exercises

1. Write unit tests for all Task model methods
2. Create integration tests for TaskService
3. Implement property-based tests for data validation
4. Achieve 80%+ code coverage
5. Practice TDD by adding a new feature test-first

Remember: Good tests are an investment in your code's future. They catch bugs early, enable confident refactoring, and serve as living documentation of your system's behavior.