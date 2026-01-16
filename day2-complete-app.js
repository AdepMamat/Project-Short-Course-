/**
 * Day 2 Complete Application - MVC Implementation
 * FIXED VERSION (No Illegal Constructor)
 */

/* ===================== SERVICES ===================== */

class TaskService {
    constructor(taskRepository, userRepository) {
        this.taskRepository = taskRepository;
        this.userRepository = userRepository;
        this.listeners = new Set();
    }

    addListener(listener) {
        this.listeners.add(listener);
    }

    notify(event, data) {
        this.listeners.forEach(l => l(event, data));
    }

    async createTask(taskData) {
        const user = await this.userRepository.findById(taskData.userId);
        if (!user) throw new Error('User not found');

        const task = new Task(
            taskData.title,
            taskData.description,
            taskData.userId,
            {
                priority: taskData.priority || 'medium',
                category: taskData.category || 'general',
                dueDate: taskData.dueDate,
                estimatedHours: taskData.estimatedHours,
                tags: taskData.tags || [],
                assignedTo: taskData.assignedTo || taskData.userId
            }
        );

        const saved = await this.taskRepository.create(task);
        this.notify('taskCreated', saved);
        return saved;
    }

    async getTasksForUser(userId) {
        return this.taskRepository.findAll({ userId });
    }

    async getTaskStats(userId) {
        return this.taskRepository.getStatistics(userId);
    }

    async getTaskById(taskId) {
        return this.taskRepository.findById(taskId);
    }

    async getPendingTasks(userId) {
        return this.taskRepository.findAll({ userId, completed: false });
    }

    async getCompletedTasks(userId) {
        return this.taskRepository.findAll({ userId, completed: true });
    }

    async getOverdueTasks(userId) {
        return this.taskRepository.findOverdue();
    }

    async getTasksByPriority(userId, priority) {
        return this.taskRepository.findAll({ userId, priority });
    }

    async getTasksByCategory(userId, category) {
        return this.taskRepository.findAll({ userId, category });
    }

    async getTasksAssignedToUser(userId) {
        return this.taskRepository.findAll({ assignedTo: userId });
    }

    async searchTasks(userId, query) {
        const allTasks = await this.taskRepository.findAll({ userId });
        const searchTerm = query.toLowerCase();
        return allTasks.filter(task =>
            task.title.toLowerCase().includes(searchTerm) ||
            task.description.toLowerCase().includes(searchTerm) ||
            (task.tags && task.tags.some(tag => tag.toLowerCase().includes(searchTerm)))
        );
    }

    async updateTask(taskId, updates) {
        return this.taskRepository.update(taskId, updates);
    }

    async deleteTask(taskId) {
        return this.taskRepository.delete(taskId);
    }
}

class UserService {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }

    async createUser(data) {
        const user = new User(data.username, data.email, data.fullName);
        return this.userRepository.create(user);
    }

    async getAllUsers() {
        return this.userRepository.findAll();
    }

    async getUserById(id) {
        return this.userRepository.findById(id);
    }
}

/* ===================== APPLICATION ===================== */

class Day2TaskManagementApp {
    async initialize() {
        console.log('🚀 Initializing Day 2 App');

        // ✅ FIXED: gunakan AppStorageManager
        this.storageManager = new AppStorageManager('taskManagementApp_day2');

        this.taskRepository = new TaskRepository(this.storageManager);
        this.userRepository = new UserRepository(this.storageManager);

        this.taskService = new TaskService(
            this.taskRepository,
            this.userRepository
        );

        this.userService = new UserService(this.userRepository);

        this.taskView = new TaskView('app');
        this.taskController = new TaskController(
            this.taskService,
            this.userService,
            this.taskView
        );

        await this.initializeUser();

        console.log('✅ Day 2 App Ready');
    }

    async initializeUser() {
        try {
            console.log('Initializing user...');
            let users = await this.userService.getAllUsers();
            console.log('Found', users.length, 'existing users');

            if (users.length === 0) {
                console.log('Creating demo user...');
                const demoUser = await this.userService.createUser({
                    username: 'demo_user',
                    email: 'demo@example.com',
                    fullName: 'Demo User'
                });
                users.push(demoUser);
                console.log('Demo user created:', demoUser);
            }

            this.currentUser = users[0];
            console.log('Current user set to:', this.currentUser);

            await this.taskController.initialize(this.currentUser.id);
            console.log('Task controller initialized');
        } catch (error) {
            console.error('Error initializing user:', error);
            throw error;
        }
    }
}

/* ===================== BOOTSTRAP ===================== */

document.addEventListener('DOMContentLoaded', async () => {
    try {
        if (!document.getElementById('app')) {
            const div = document.createElement('div');
            div.id = 'app';
            document.body.appendChild(div);
        }

        const app = new Day2TaskManagementApp();
        await app.initialize();

        window.day2App = app;
        console.log('🎉 Application running');
    } catch (e) {
        console.error(e);
        document.body.innerHTML = `
            <div class="error-container">
                <h1>Application Error</h1>
                <pre>${e.message}</pre>
            </div>
        `;
    }
});
