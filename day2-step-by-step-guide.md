# Day 2 Implementation Guide: Requirements & Design Patterns (Step-by-Step)

## 🚨 **PENTING - BACA DULU!**

### **File yang Harus Digunakan:**
Folder ini berisi dua versi implementasi. **GUNAKAN VERSI SIMPLIFIED** untuk mengikuti guide ini:

✅ **GUNAKAN:**
- `requirements.md` (bukan requirements-analysis.md)
- `user-model.js` (sudah disederhanakan)
- `enhanced-task-model-simplified.js` (bukan enhanced-task-model.js)

❌ **JANGAN GUNAKAN DULU:**
- `requirements-analysis.md` (terlalu formal)
- `enhanced-task-model.js` (terlalu kompleks)
- File advanced lainnya

**Kenapa ada dua versi?**
- **Simplified**: Untuk mahasiswa semester awal yang baru belajar
- **Advanced**: Untuk referensi atau mahasiswa yang sudah berpengalaman

---

## 🎯 Tujuan Pembelajaran

Setelah menyelesaikan Day 2, Anda akan:
- Memahami cara menganalisis kebutuhan pengguna (requirements)
- Menerapkan pola desain MVC (Model-View-Controller)
- Membuat sistem multi-user yang lebih kompleks
- Mengorganisir kode dengan lebih baik menggunakan Repository pattern

## 📚 Konsep Dasar yang Perlu Dipahami

### 1. Apa itu Requirements (Kebutuhan)?
**Analogi sederhana**: Seperti saat Anda ingin membangun rumah, Anda perlu tahu:
- Berapa kamar yang dibutuhkan? (Functional requirement)
- Harus tahan gempa? (Non-functional requirement)

**Dalam aplikasi kita**:
- User bisa login dengan nama (Functional)
- Aplikasi harus cepat (Non-functional)

### 2. Apa itu MVC Pattern?
**Analogi restoran**:
- **Model** = Dapur (tempat masak/proses data)
- **View** = Meja makan (tempat customer melihat makanan)
- **Controller** = Pelayan (yang mengatur pesanan)

**Dalam aplikasi kita**:
- **Model** = Task.js, User.js (data dan aturan bisnis)
- **View** = HTML dan fungsi tampilan
- **Controller** = TaskController.js (mengatur alur kerja)

### 3. Apa itu Repository Pattern?
**Analogi perpustakaan**:
- Repository = Pustakawan yang tahu cara mencari buku
- Anda tidak perlu tahu di rak mana buku disimpan
- Anda tinggal minta ke pustakawan

**Dalam aplikasi**:
- Repository = TaskRepository.js (tahu cara simpan/ambil data)
- Controller tidak perlu tahu detail penyimpanan

## 🚀 Langkah-Langkah Implementasi

### Step 1: Analisis Requirements (Kebutuhan)

Sebelum coding, mari kita tentukan apa yang dibutuhkan aplikasi kita:

#### Requirements Baru untuk Day 2:
1. **Multi-User**: Setiap user punya task sendiri
2. **User Login**: User bisa login dengan username
3. **Task Categories**: Task bisa dikategorikan (Work, Personal, Study)
4. **Due Dates**: Task bisa punya deadline
5. **Task Assignment**: Task bisa di-assign ke user lain

Mari kita tulis dalam format User Stories:

**File**: `requirements.md` (buat file baru di root project)

**PENTING**: Gunakan content dari file `requirements.md` yang sudah ada, atau copy content berikut:

```markdown
# User Stories - Task Management System Day 2

## User Management
- **US-001**: Sebagai user baru, saya ingin bisa membuat akun dengan username, agar saya bisa menggunakan aplikasi
- **US-002**: Sebagai user, saya ingin bisa login dengan username, agar saya bisa mengakses task saya
- **US-003**: Sebagai user, saya ingin melihat profil saya, agar saya tahu informasi akun saya

## Enhanced Task Management  
- **US-004**: Sebagai user, saya ingin mengkategorikan task (Work/Personal/Study), agar saya bisa mengorganisir task dengan lebih baik
- **US-005**: Sebagai user, saya ingin menambahkan due date pada task, agar saya tahu kapan deadline-nya
- **US-006**: Sebagai user, saya ingin melihat task yang overdue, agar saya bisa prioritaskan yang urgent
- **US-007**: Sebagai user, saya ingin assign task ke user lain, agar bisa berkolaborasi

## Filtering & Organization
- **US-008**: Sebagai user, saya ingin filter task berdasarkan kategori, agar fokus pada jenis task tertentu
- **US-009**: Sebagai user, saya ingin melihat task yang akan due dalam 3 hari, agar bisa prepare
- **US-010**: Sebagai user, saya ingin melihat statistik task saya, agar tahu produktivitas saya
```

### Step 2: Buat User Model

Sekarang kita buat model untuk User. Ini akan menjadi "blueprint" untuk data user.

**File**: `src/models/User.js` (buat file baru)

**PENTING**: Gunakan code dari file `user-model.js` yang sudah disederhanakan, atau copy code berikut:

```javascript
/**
 * User Model - Represents a user in our system
 * 
 * Konsep yang diterapkan:
 * - Encapsulation: Data user dilindungi dengan getter/setter
 * - Validation: Memastikan data user valid
 * - Business Logic: Aturan bisnis terkait user
 */
class User {
    constructor(username, email, fullName) {
        // Validasi input - pastikan data yang masuk benar
        if (!username || username.trim() === '') {
            throw new Error('Username wajib diisi');
        }
        
        if (!email || !this._isValidEmail(email)) {
            throw new Error('Email tidak valid');
        }
        
        // Properties private (menggunakan konvensi _)
        this._id = this._generateId();
        this._username = username.trim().toLowerCase();
        this._email = email.trim().toLowerCase();
        this._fullName = fullName ? fullName.trim() : '';
        this._role = 'user'; // default role
        this._isActive = true;
        this._createdAt = new Date();
        this._lastLoginAt = null;
        this._preferences = {
            theme: 'light',
            defaultCategory: 'personal',
            emailNotifications: true
        };
    }
    
    // Getter methods - untuk akses read-only
    get id() { return this._id; }
    get username() { return this._username; }
    get email() { return this._email; }
    get fullName() { return this._fullName; }
    get role() { return this._role; }
    get isActive() { return this._isActive; }
    get createdAt() { return this._createdAt; }
    get lastLoginAt() { return this._lastLoginAt; }
    get preferences() { return { ...this._preferences }; } // return copy
    
    // Public methods untuk operasi user
    updateProfile(fullName, email) {
        if (email && !this._isValidEmail(email)) {
            throw new Error('Email tidak valid');
        }
        
        if (fullName) this._fullName = fullName.trim();
        if (email) this._email = email.trim().toLowerCase();
    }
    
    updatePreferences(newPreferences) {
        // Merge preferences baru dengan yang lama
        this._preferences = {
            ...this._preferences,
            ...newPreferences
        };
    }
    
    recordLogin() {
        this._lastLoginAt = new Date();
    }
    
    deactivate() {
        this._isActive = false;
    }
    
    activate() {
        this._isActive = true;
    }
    
    // Convert ke JSON untuk penyimpanan
    toJSON() {
        return {
            id: this._id,
            username: this._username,
            email: this._email,
            fullName: this._fullName,
            role: this._role,
            isActive: this._isActive,
            createdAt: this._createdAt.toISOString(),
            lastLoginAt: this._lastLoginAt ? this._lastLoginAt.toISOString() : null,
            preferences: this._preferences
        };
    }
    
    // Create User dari data JSON
    static fromJSON(data) {
        const user = new User(data.username, data.email, data.fullName);
        user._id = data.id;
        user._role = data.role;
        user._isActive = data.isActive;
        user._createdAt = new Date(data.createdAt);
        user._lastLoginAt = data.lastLoginAt ? new Date(data.lastLoginAt) : null;
        user._preferences = data.preferences || user._preferences;
        return user;
    }
    
    // Private helper methods
    _generateId() {
        return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    _isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
}

// Export untuk digunakan di file lain
if (typeof module !== 'undefined' && module.exports) {
    module.exports = User;
} else {
    window.User = User;
}
```

**Penjelasan kode di atas**:
- `constructor`: Fungsi yang dipanggil saat membuat user baru
- `get id()`: Getter method, seperti fungsi yang hanya bisa membaca data
- `updateProfile()`: Method untuk mengubah profil user
- `toJSON()`: Mengubah object User menjadi format JSON untuk disimpan
- `fromJSON()`: Membuat User dari data JSON yang tersimpan

### Step 3: Upgrade Task Model

Sekarang kita upgrade Task model dari Day 1 untuk mendukung fitur baru.

**File**: `src/models/EnhancedTask.js` (buat file baru)

**PENTING**: Gunakan code dari file `enhanced-task-model-simplified.js`, atau copy code berikut:

```javascript
/**
 * Enhanced Task Model - Task dengan fitur tambahan untuk Day 2
 * 
 * Fitur baru:
 * - Multi-user support (owner dan assignee)
 * - Categories dan tags
 * - Due dates dengan overdue detection
 * - Status yang lebih detail
 * - Time tracking
 */
class EnhancedTask {
    constructor(title, description, ownerId, options = {}) {
        // Validasi input
        if (!title || title.trim() === '') {
            throw new Error('Judul task wajib diisi');
        }
        
        if (!ownerId) {
            throw new Error('Owner ID wajib diisi');
        }
        
        // Properties dasar
        this._id = this._generateId();
        this._title = title.trim();
        this._description = description ? description.trim() : '';
        this._ownerId = ownerId;
        this._assigneeId = options.assigneeId || ownerId; // default assigned to owner
        
        // Properties baru untuk Day 2
        this._category = this._validateCategory(options.category || 'personal');
        this._tags = Array.isArray(options.tags) ? options.tags : [];
        this._priority = this._validatePriority(options.priority || 'medium');
        this._status = this._validateStatus(options.status || 'pending');
        
        // Date properties
        this._dueDate = options.dueDate ? new Date(options.dueDate) : null;
        this._createdAt = new Date();
        this._updatedAt = new Date();
        this._completedAt = null;
        
        // Time tracking
        this._estimatedHours = options.estimatedHours || 0;
        this._actualHours = 0;
        
        // Additional metadata
        this._notes = [];
        this._attachments = [];
    }
    
    // Getter methods
    get id() { return this._id; }
    get title() { return this._title; }
    get description() { return this._description; }
    get ownerId() { return this._ownerId; }
    get assigneeId() { return this._assigneeId; }
    get category() { return this._category; }
    get tags() { return [...this._tags]; } // return copy
    get priority() { return this._priority; }
    get status() { return this._status; }
    get dueDate() { return this._dueDate; }
    get createdAt() { return this._createdAt; }
    get updatedAt() { return this._updatedAt; }
    get completedAt() { return this._completedAt; }
    get estimatedHours() { return this._estimatedHours; }
    get actualHours() { return this._actualHours; }
    get notes() { return [...this._notes]; }
    get attachments() { return [...this._attachments]; }
    
    // Computed properties (properties yang dihitung)
    get isCompleted() {
        return this._status === 'completed';
    }
    
    get isOverdue() {
        if (!this._dueDate || this.isCompleted) return false;
        return new Date() > this._dueDate;
    }
    
    get daysUntilDue() {
        if (!this._dueDate) return null;
        const today = new Date();
        const diffTime = this._dueDate - today;
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
    
    get progressPercentage() {
        if (this._estimatedHours === 0) return 0;
        return Math.min(100, (this._actualHours / this._estimatedHours) * 100);
    }
    
    // Public methods untuk operasi task
    updateTitle(newTitle) {
        if (!newTitle || newTitle.trim() === '') {
            throw new Error('Judul task tidak boleh kosong');
        }
        this._title = newTitle.trim();
        this._updateTimestamp();
    }
    
    updateDescription(newDescription) {
        this._description = newDescription ? newDescription.trim() : '';
        this._updateTimestamp();
    }
    
    updateCategory(newCategory) {
        this._category = this._validateCategory(newCategory);
        this._updateTimestamp();
    }
    
    addTag(tag) {
        if (tag && !this._tags.includes(tag)) {
            this._tags.push(tag);
            this._updateTimestamp();
        }
    }
    
    removeTag(tag) {
        const index = this._tags.indexOf(tag);
        if (index > -1) {
            this._tags.splice(index, 1);
            this._updateTimestamp();
        }
    }
    
    updatePriority(newPriority) {
        this._priority = this._validatePriority(newPriority);
        this._updateTimestamp();
    }
    
    updateStatus(newStatus) {
        const oldStatus = this._status;
        this._status = this._validateStatus(newStatus);
        
        // Set completed timestamp jika status berubah ke completed
        if (newStatus === 'completed' && oldStatus !== 'completed') {
            this._completedAt = new Date();
        } else if (newStatus !== 'completed') {
            this._completedAt = null;
        }
        
        this._updateTimestamp();
    }
    
    setDueDate(dueDate) {
        this._dueDate = dueDate ? new Date(dueDate) : null;
        this._updateTimestamp();
    }
    
    assignTo(userId) {
        this._assigneeId = userId;
        this._updateTimestamp();
    }
    
    addTimeSpent(hours) {
        if (hours > 0) {
            this._actualHours += hours;
            this._updateTimestamp();
        }
    }
    
    setEstimatedHours(hours) {
        this._estimatedHours = Math.max(0, hours);
        this._updateTimestamp();
    }
    
    addNote(note) {
        if (note && note.trim()) {
            this._notes.push({
                id: Date.now(),
                content: note.trim(),
                createdAt: new Date()
            });
            this._updateTimestamp();
        }
    }
    
    // Convert ke JSON untuk penyimpanan
    toJSON() {
        return {
            id: this._id,
            title: this._title,
            description: this._description,
            ownerId: this._ownerId,
            assigneeId: this._assigneeId,
            category: this._category,
            tags: this._tags,
            priority: this._priority,
            status: this._status,
            dueDate: this._dueDate ? this._dueDate.toISOString() : null,
            createdAt: this._createdAt.toISOString(),
            updatedAt: this._updatedAt.toISOString(),
            completedAt: this._completedAt ? this._completedAt.toISOString() : null,
            estimatedHours: this._estimatedHours,
            actualHours: this._actualHours,
            notes: this._notes,
            attachments: this._attachments
        };
    }
    
    // Create Task dari data JSON
    static fromJSON(data) {
        const task = new EnhancedTask(data.title, data.description, data.ownerId, {
            assigneeId: data.assigneeId,
            category: data.category,
            tags: data.tags,
            priority: data.priority,
            status: data.status,
            dueDate: data.dueDate,
            estimatedHours: data.estimatedHours
        });
        
        task._id = data.id;
        task._createdAt = new Date(data.createdAt);
        task._updatedAt = new Date(data.updatedAt);
        task._completedAt = data.completedAt ? new Date(data.completedAt) : null;
        task._actualHours = data.actualHours || 0;
        task._notes = data.notes || [];
        task._attachments = data.attachments || [];
        
        return task;
    }
    
    // Private helper methods
    _generateId() {
        return 'task_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    _updateTimestamp() {
        this._updatedAt = new Date();
    }
    
    _validateCategory(category) {
        const validCategories = ['work', 'personal', 'study', 'health', 'finance', 'other'];
        if (!validCategories.includes(category)) {
            throw new Error(`Kategori tidak valid: ${category}. Harus salah satu dari: ${validCategories.join(', ')}`);
        }
        return category;
    }
    
    _validatePriority(priority) {
        const validPriorities = ['low', 'medium', 'high', 'urgent'];
        if (!validPriorities.includes(priority)) {
            throw new Error(`Prioritas tidak valid: ${priority}. Harus salah satu dari: ${validPriorities.join(', ')}`);
        }
        return priority;
    }
    
    _validateStatus(status) {
        const validStatuses = ['pending', 'in-progress', 'blocked', 'completed', 'cancelled'];
        if (!validStatuses.includes(status)) {
            throw new Error(`Status tidak valid: ${status}. Harus salah satu dari: ${validStatuses.join(', ')}`);
        }
        return status;
    }
}

// Export untuk digunakan di file lain
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EnhancedTask;
} else {
    window.EnhancedTask = EnhancedTask;
}
```

**Penjelasan fitur baru**:
- **Categories**: Task bisa dikategorikan (work, personal, study, dll)
- **Tags**: Label tambahan untuk task
- **Due Date**: Tanggal deadline dengan deteksi overdue
- **Status**: Status yang lebih detail (pending, in-progress, blocked, completed, cancelled)
- **Time Tracking**: Estimasi waktu vs waktu aktual
- **Assignment**: Task bisa di-assign ke user lain
- **Notes**: Catatan tambahan untuk task

### Step 4: Buat Repository Pattern

Repository adalah "pustakawan" yang mengatur penyimpanan dan pengambilan data. Ini memisahkan logika bisnis dari detail penyimpanan.

**File**: `src/repositories/UserRepository.js` (buat file baru)

```javascript
/**
 * User Repository - Mengelola penyimpanan dan pengambilan data User
 * 
 * Repository Pattern:
 * - Abstraksi untuk akses data
 * - Memisahkan business logic dari storage logic
 * - Mudah untuk testing dan switching storage
 */
class UserRepository {
    constructor(storageManager) {
        this.storage = storageManager;
        this.users = new Map(); // Cache in-memory untuk performa
        this.storageKey = 'users';
        
        // Load existing users dari storage
        this._loadUsersFromStorage();
    }
    
    /**
     * Buat user baru
     * @param {Object} userData - Data user (username, email, fullName)
     * @returns {User} - User yang baru dibuat
     */
    create(userData) {
        try {
            // Cek apakah username sudah ada
            if (this.findByUsername(userData.username)) {
                throw new Error(`Username '${userData.username}' sudah digunakan`);
            }
            
            // Cek apakah email sudah ada
            if (this.findByEmail(userData.email)) {
                throw new Error(`Email '${userData.email}' sudah digunakan`);
            }
            
            // Buat user baru
            const user = new User(userData.username, userData.email, userData.fullName);
            
            // Simpan ke cache
            this.users.set(user.id, user);
            
            // Persist ke storage
            this._saveUsersToStorage();
            
            return user;
        } catch (error) {
            console.error('Error creating user:', error);
            throw error;
        }
    }
    
    /**
     * Cari user berdasarkan ID
     * @param {string} id - User ID
     * @returns {User|null} - User atau null jika tidak ditemukan
     */
    findById(id) {
        return this.users.get(id) || null;
    }
    
    /**
     * Cari user berdasarkan username
     * @param {string} username - Username
     * @returns {User|null} - User atau null jika tidak ditemukan
     */
    findByUsername(username) {
        const normalizedUsername = username.toLowerCase();
        for (const user of this.users.values()) {
            if (user.username === normalizedUsername) {
                return user;
            }
        }
        return null;
    }
    
    /**
     * Cari user berdasarkan email
     * @param {string} email - Email
     * @returns {User|null} - User atau null jika tidak ditemukan
     */
    findByEmail(email) {
        const normalizedEmail = email.toLowerCase();
        for (const user of this.users.values()) {
            if (user.email === normalizedEmail) {
                return user;
            }
        }
        return null;
    }
    
    /**
     * Ambil semua user
     * @returns {User[]} - Array semua user
     */
    findAll() {
        return Array.from(this.users.values());
    }
    
    /**
     * Ambil user aktif saja
     * @returns {User[]} - Array user yang aktif
     */
    findActive() {
        return this.findAll().filter(user => user.isActive);
    }
    
    /**
     * Update user
     * @param {string} id - User ID
     * @param {Object} updates - Data yang akan diupdate
     * @returns {User|null} - User yang sudah diupdate atau null
     */
    update(id, updates) {
        const user = this.findById(id);
        if (!user) {
            return null;
        }
        
        try {
            // Update profile jika ada
            if (updates.fullName !== undefined || updates.email !== undefined) {
                user.updateProfile(updates.fullName, updates.email);
            }
            
            // Update preferences jika ada
            if (updates.preferences) {
                user.updatePreferences(updates.preferences);
            }
            
            // Update status jika ada
            if (updates.isActive !== undefined) {
                if (updates.isActive) {
                    user.activate();
                } else {
                    user.deactivate();
                }
            }
            
            // Persist changes
            this._saveUsersToStorage();
            
            return user;
        } catch (error) {
            console.error('Error updating user:', error);
            throw error;
        }
    }
    
    /**
     * Hapus user (soft delete - set inactive)
     * @param {string} id - User ID
     * @returns {boolean} - Success status
     */
    delete(id) {
        const user = this.findById(id);
        if (!user) {
            return false;
        }
        
        user.deactivate();
        this._saveUsersToStorage();
        return true;
    }
    
    /**
     * Hapus user permanen
     * @param {string} id - User ID
     * @returns {boolean} - Success status
     */
    hardDelete(id) {
        if (this.users.has(id)) {
            this.users.delete(id);
            this._saveUsersToStorage();
            return true;
        }
        return false;
    }
    
    /**
     * Record login user
     * @param {string} id - User ID
     * @returns {User|null} - User yang login
     */
    recordLogin(id) {
        const user = this.findById(id);
        if (user) {
            user.recordLogin();
            this._saveUsersToStorage();
        }
        return user;
    }
    
    /**
     * Cari user dengan query
     * @param {string} query - Search query
     * @returns {User[]} - Array user yang match
     */
    search(query) {
        const searchTerm = query.toLowerCase();
        return this.findAll().filter(user => 
            user.username.includes(searchTerm) ||
            user.email.includes(searchTerm) ||
            user.fullName.toLowerCase().includes(searchTerm)
        );
    }
    
    /**
     * Get user statistics
     * @returns {Object} - User statistics
     */
    getStats() {
        const allUsers = this.findAll();
        const activeUsers = this.findActive();
        
        return {
            total: allUsers.length,
            active: activeUsers.length,
            inactive: allUsers.length - activeUsers.length,
            recentLogins: allUsers.filter(user => {
                if (!user.lastLoginAt) return false;
                const dayAgo = new Date();
                dayAgo.setDate(dayAgo.getDate() - 1);
                return user.lastLoginAt > dayAgo;
            }).length
        };
    }
    
    // Private methods
    _loadUsersFromStorage() {
        try {
            const usersData = this.storage.load(this.storageKey, []);
            
            usersData.forEach(userData => {
                try {
                    const user = User.fromJSON(userData);
                    this.users.set(user.id, user);
                } catch (error) {
                    console.error('Error loading user:', userData, error);
                }
            });
            
            console.log(`Loaded ${this.users.size} users from storage`);
        } catch (error) {
            console.error('Error loading users from storage:', error);
        }
    }
    
    _saveUsersToStorage() {
        try {
            const usersData = Array.from(this.users.values()).map(user => user.toJSON());
            this.storage.save(this.storageKey, usersData);
        } catch (error) {
            console.error('Error saving users to storage:', error);
        }
    }
}

// Export untuk digunakan di file lain
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UserRepository;
} else {
    window.UserRepository = UserRepository;
}
```

**File**: `src/repositories/TaskRepository.js` (buat file baru)

```javascript
/**
 * Task Repository - Mengelola penyimpanan dan pengambilan data Task
 * 
 * Repository Pattern untuk Task dengan fitur:
 * - CRUD operations
 * - Query methods (filter, search, sort)
 * - User-specific operations
 * - Statistics dan reporting
 */
class TaskRepository {
    constructor(storageManager) {
        this.storage = storageManager;
        this.tasks = new Map(); // Cache in-memory
        this.storageKey = 'tasks';
        
        // Load existing tasks dari storage
        this._loadTasksFromStorage();
    }
    
    /**
     * Buat task baru
     * @param {Object} taskData - Data task
     * @returns {EnhancedTask} - Task yang baru dibuat
     */
    create(taskData) {
        try {
            const task = new EnhancedTask(
                taskData.title,
                taskData.description,
                taskData.ownerId,
                taskData
            );
            
            // Simpan ke cache
            this.tasks.set(task.id, task);
            
            // Persist ke storage
            this._saveTasksToStorage();
            
            return task;
        } catch (error) {
            console.error('Error creating task:', error);
            throw error;
        }
    }
    
    /**
     * Cari task berdasarkan ID
     * @param {string} id - Task ID
     * @returns {EnhancedTask|null} - Task atau null
     */
    findById(id) {
        return this.tasks.get(id) || null;
    }
    
    /**
     * Ambil semua task
     * @returns {EnhancedTask[]} - Array semua task
     */
    findAll() {
        return Array.from(this.tasks.values());
    }
    
    /**
     * Cari task berdasarkan owner
     * @param {string} ownerId - Owner ID
     * @returns {EnhancedTask[]} - Array task milik owner
     */
    findByOwner(ownerId) {
        return this.findAll().filter(task => task.ownerId === ownerId);
    }
    
    /**
     * Cari task berdasarkan assignee
     * @param {string} assigneeId - Assignee ID
     * @returns {EnhancedTask[]} - Array task yang di-assign ke user
     */
    findByAssignee(assigneeId) {
        return this.findAll().filter(task => task.assigneeId === assigneeId);
    }
    
    /**
     * Cari task berdasarkan kategori
     * @param {string} category - Kategori
     * @returns {EnhancedTask[]} - Array task dengan kategori tertentu
     */
    findByCategory(category) {
        return this.findAll().filter(task => task.category === category);
    }
    
    /**
     * Cari task berdasarkan status
     * @param {string} status - Status
     * @returns {EnhancedTask[]} - Array task dengan status tertentu
     */
    findByStatus(status) {
        return this.findAll().filter(task => task.status === status);
    }
    
    /**
     * Cari task berdasarkan prioritas
     * @param {string} priority - Prioritas
     * @returns {EnhancedTask[]} - Array task dengan prioritas tertentu
     */
    findByPriority(priority) {
        return this.findAll().filter(task => task.priority === priority);
    }
    
    /**
     * Cari task yang overdue
     * @returns {EnhancedTask[]} - Array task yang overdue
     */
    findOverdue() {
        return this.findAll().filter(task => task.isOverdue);
    }
    
    /**
     * Cari task yang due dalam X hari
     * @param {number} days - Jumlah hari
     * @returns {EnhancedTask[]} - Array task yang akan due
     */
    findDueSoon(days = 3) {
        return this.findAll().filter(task => {
            const daysUntilDue = task.daysUntilDue;
            return daysUntilDue !== null && daysUntilDue <= days && daysUntilDue >= 0;
        });
    }
    
    /**
     * Cari task dengan tag tertentu
     * @param {string} tag - Tag
     * @returns {EnhancedTask[]} - Array task dengan tag
     */
    findByTag(tag) {
        return this.findAll().filter(task => task.tags.includes(tag));
    }
    
    /**
     * Update task
     * @param {string} id - Task ID
     * @param {Object} updates - Data yang akan diupdate
     * @returns {EnhancedTask|null} - Task yang sudah diupdate
     */
    update(id, updates) {
        const task = this.findById(id);
        if (!task) {
            return null;
        }
        
        try {
            // Apply updates berdasarkan property yang ada
            if (updates.title !== undefined) {
                task.updateTitle(updates.title);
            }
            if (updates.description !== undefined) {
                task.updateDescription(updates.description);
            }
            if (updates.category !== undefined) {
                task.updateCategory(updates.category);
            }
            if (updates.priority !== undefined) {
                task.updatePriority(updates.priority);
            }
            if (updates.status !== undefined) {
                task.updateStatus(updates.status);
            }
            if (updates.dueDate !== undefined) {
                task.setDueDate(updates.dueDate);
            }
            if (updates.assigneeId !== undefined) {
                task.assignTo(updates.assigneeId);
            }
            if (updates.estimatedHours !== undefined) {
                task.setEstimatedHours(updates.estimatedHours);
            }
            if (updates.addTimeSpent !== undefined) {
                task.addTimeSpent(updates.addTimeSpent);
            }
            if (updates.addTag !== undefined) {
                task.addTag(updates.addTag);
            }
            if (updates.removeTag !== undefined) {
                task.removeTag(updates.removeTag);
            }
            if (updates.addNote !== undefined) {
                task.addNote(updates.addNote);
            }
            
            // Persist changes
            this._saveTasksToStorage();
            
            return task;
        } catch (error) {
            console.error('Error updating task:', error);
            throw error;
        }
    }
    
    /**
     * Hapus task
     * @param {string} id - Task ID
     * @returns {boolean} - Success status
     */
    delete(id) {
        if (this.tasks.has(id)) {
            this.tasks.delete(id);
            this._saveTasksToStorage();
            return true;
        }
        return false;
    }
    
    /**
     * Search task dengan query
     * @param {string} query - Search query
     * @returns {EnhancedTask[]} - Array task yang match
     */
    search(query) {
        const searchTerm = query.toLowerCase();
        return this.findAll().filter(task =>
            task.title.toLowerCase().includes(searchTerm) ||
            task.description.toLowerCase().includes(searchTerm) ||
            task.tags.some(tag => tag.toLowerCase().includes(searchTerm))
        );
    }
    
    /**
     * Filter task dengan multiple criteria
     * @param {Object} filters - Filter criteria
     * @returns {EnhancedTask[]} - Array task yang match filter
     */
    filter(filters) {
        let results = this.findAll();
        
        if (filters.ownerId) {
            results = results.filter(task => task.ownerId === filters.ownerId);
        }
        
        if (filters.assigneeId) {
            results = results.filter(task => task.assigneeId === filters.assigneeId);
        }
        
        if (filters.category) {
            results = results.filter(task => task.category === filters.category);
        }
        
        if (filters.status) {
            results = results.filter(task => task.status === filters.status);
        }
        
        if (filters.priority) {
            results = results.filter(task => task.priority === filters.priority);
        }
        
        if (filters.overdue) {
            results = results.filter(task => task.isOverdue);
        }
        
        if (filters.dueSoon) {
            results = results.filter(task => {
                const days = task.daysUntilDue;
                return days !== null && days <= 3 && days >= 0;
            });
        }
        
        if (filters.tags && filters.tags.length > 0) {
            results = results.filter(task =>
                filters.tags.some(tag => task.tags.includes(tag))
            );
        }
        
        return results;
    }
    
    /**
     * Sort task
     * @param {EnhancedTask[]} tasks - Array task untuk di-sort
     * @param {string} sortBy - Field untuk sorting
     * @param {string} order - 'asc' atau 'desc'
     * @returns {EnhancedTask[]} - Array task yang sudah di-sort
     */
    sort(tasks, sortBy = 'createdAt', order = 'desc') {
        return tasks.sort((a, b) => {
            let valueA, valueB;
            
            switch (sortBy) {
                case 'title':
                    valueA = a.title.toLowerCase();
                    valueB = b.title.toLowerCase();
                    break;
                case 'priority':
                    const priorityOrder = { 'low': 1, 'medium': 2, 'high': 3, 'urgent': 4 };
                    valueA = priorityOrder[a.priority];
                    valueB = priorityOrder[b.priority];
                    break;
                case 'dueDate':
                    valueA = a.dueDate || new Date('9999-12-31');
                    valueB = b.dueDate || new Date('9999-12-31');
                    break;
                case 'createdAt':
                case 'updatedAt':
                    valueA = a[sortBy];
                    valueB = b[sortBy];
                    break;
                default:
                    valueA = a.createdAt;
                    valueB = b.createdAt;
            }
            
            if (order === 'asc') {
                return valueA > valueB ? 1 : valueA < valueB ? -1 : 0;
            } else {
                return valueA < valueB ? 1 : valueA > valueB ? -1 : 0;
            }
        });
    }
    
    /**
     * Get task statistics
     * @param {string} userId - User ID (optional, untuk stats per user)
     * @returns {Object} - Task statistics
     */
    getStats(userId = null) {
        let tasks = userId ? this.findByOwner(userId) : this.findAll();
        
        const stats = {
            total: tasks.length,
            byStatus: {},
            byPriority: {},
            byCategory: {},
            overdue: tasks.filter(task => task.isOverdue).length,
            dueSoon: tasks.filter(task => {
                const days = task.daysUntilDue;
                return days !== null && days <= 3 && days >= 0;
            }).length,
            completed: tasks.filter(task => task.isCompleted).length
        };
        
        // Count by status
        ['pending', 'in-progress', 'blocked', 'completed', 'cancelled'].forEach(status => {
            stats.byStatus[status] = tasks.filter(task => task.status === status).length;
        });
        
        // Count by priority
        ['low', 'medium', 'high', 'urgent'].forEach(priority => {
            stats.byPriority[priority] = tasks.filter(task => task.priority === priority).length;
        });
        
        // Count by category
        ['work', 'personal', 'study', 'health', 'finance', 'other'].forEach(category => {
            stats.byCategory[category] = tasks.filter(task => task.category === category).length;
        });
        
        return stats;
    }
    
    // Private methods
    _loadTasksFromStorage() {
        try {
            const tasksData = this.storage.load(this.storageKey, []);
            
            tasksData.forEach(taskData => {
                try {
                    const task = EnhancedTask.fromJSON(taskData);
                    this.tasks.set(task.id, task);
                } catch (error) {
                    console.error('Error loading task:', taskData, error);
                }
            });
            
            console.log(`Loaded ${this.tasks.size} tasks from storage`);
        } catch (error) {
            console.error('Error loading tasks from storage:', error);
        }
    }
    
    _saveTasksToStorage() {
        try {
            const tasksData = Array.from(this.tasks.values()).map(task => task.toJSON());
            this.storage.save(this.storageKey, tasksData);
        } catch (error) {
            console.error('Error saving tasks to storage:', error);
        }
    }
}

// Export untuk digunakan di file lain
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TaskRepository;
} else {
    window.TaskRepository = TaskRepository;
}
```

**Penjelasan Repository Pattern**:
- **Abstraksi**: Repository menyembunyikan detail penyimpanan dari business logic
- **Konsistensi**: Semua operasi data melalui interface yang sama
- **Testability**: Mudah untuk mock repository dalam testing
- **Flexibility**: Bisa ganti storage (localStorage ke database) tanpa ubah business logic

Lanjut ke Step 5...

### Step 5: Buat Controller Layer (MVC - Controller)

Controller adalah "pelayan" yang mengatur komunikasi antara Model dan View. Controller menerima input dari user, memproses dengan bantuan Model, dan memberikan response.

**File**: `src/controllers/TaskController.js` (buat file baru)

```javascript
/**
 * Task Controller - Mengatur alur kerja task management
 * 
 * Controller dalam MVC Pattern:
 * - Menerima input dari user (via View)
 * - Memproses dengan bantuan Model dan Repository
 * - Mengirim response kembali ke View
 * - Tidak mengandung business logic (itu ada di Model/Service)
 */
class TaskController {
    constructor(taskRepository, userRepository) {
        this.taskRepository = taskRepository;
        this.userRepository = userRepository;
        this.currentUser = null; // User yang sedang login
    }
    
    /**
     * Set current user (simulasi login)
     * @param {string} userId - User ID
     */
    setCurrentUser(userId) {
        this.currentUser = this.userRepository.findById(userId);
        if (!this.currentUser) {
            throw new Error('User tidak ditemukan');
        }
    }
    
    /**
     * Buat task baru
     * @param {Object} taskData - Data task dari form
     * @returns {Object} - Response dengan task yang dibuat atau error
     */
    createTask(taskData) {
        try {
            // Validasi: user harus login
            if (!this.currentUser) {
                return {
                    success: false,
                    error: 'User harus login terlebih dahulu'
                };
            }
            
            // Validasi input
            if (!taskData.title || taskData.title.trim() === '') {
                return {
                    success: false,
                    error: 'Judul task wajib diisi'
                };
            }
            
            // Set owner ke current user
            const taskToCreate = {
                ...taskData,
                ownerId: this.currentUser.id,
                assigneeId: taskData.assigneeId || this.currentUser.id
            };
            
            // Validasi assignee jika ada
            if (taskToCreate.assigneeId !== this.currentUser.id) {
                const assignee = this.userRepository.findById(taskToCreate.assigneeId);
                if (!assignee) {
                    return {
                        success: false,
                        error: 'User yang di-assign tidak ditemukan'
                    };
                }
            }
            
            // Buat task melalui repository
            const task = this.taskRepository.create(taskToCreate);
            
            return {
                success: true,
                data: task,
                message: `Task "${task.title}" berhasil dibuat`
            };
            
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    /**
     * Ambil semua task user
     * @param {Object} filters - Filter options
     * @returns {Object} - Response dengan array task
     */
    getTasks(filters = {}) {
        try {
            if (!this.currentUser) {
                return {
                    success: false,
                    error: 'User harus login terlebih dahulu'
                };
            }
            
            // Set filter untuk current user
            const userFilters = {
                ...filters,
                ownerId: this.currentUser.id
            };
            
            // Ambil task dengan filter
            let tasks = this.taskRepository.filter(userFilters);
            
            // Sort berdasarkan parameter
            const sortBy = filters.sortBy || 'createdAt';
            const sortOrder = filters.sortOrder || 'desc';
            tasks = this.taskRepository.sort(tasks, sortBy, sortOrder);
            
            return {
                success: true,
                data: tasks,
                count: tasks.length
            };
            
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    /**
     * Ambil task berdasarkan ID
     * @param {string} taskId - Task ID
     * @returns {Object} - Response dengan task atau error
     */
    getTask(taskId) {
        try {
            if (!this.currentUser) {
                return {
                    success: false,
                    error: 'User harus login terlebih dahulu'
                };
            }
            
            const task = this.taskRepository.findById(taskId);
            
            if (!task) {
                return {
                    success: false,
                    error: 'Task tidak ditemukan'
                };
            }
            
            // Cek permission: hanya owner atau assignee yang bisa lihat
            if (task.ownerId !== this.currentUser.id && task.assigneeId !== this.currentUser.id) {
                return {
                    success: false,
                    error: 'Anda tidak memiliki akses ke task ini'
                };
            }
            
            return {
                success: true,
                data: task
            };
            
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    /**
     * Update task
     * @param {string} taskId - Task ID
     * @param {Object} updates - Data yang akan diupdate
     * @returns {Object} - Response dengan task yang diupdate atau error
     */
    updateTask(taskId, updates) {
        try {
            if (!this.currentUser) {
                return {
                    success: false,
                    error: 'User harus login terlebih dahulu'
                };
            }
            
            const task = this.taskRepository.findById(taskId);
            
            if (!task) {
                return {
                    success: false,
                    error: 'Task tidak ditemukan'
                };
            }
            
            // Cek permission: hanya owner yang bisa update
            if (task.ownerId !== this.currentUser.id) {
                return {
                    success: false,
                    error: 'Hanya owner yang bisa mengubah task'
                };
            }
            
            // Validasi assignee jika ada update
            if (updates.assigneeId) {
                const assignee = this.userRepository.findById(updates.assigneeId);
                if (!assignee) {
                    return {
                        success: false,
                        error: 'User yang di-assign tidak ditemukan'
                    };
                }
            }
            
            // Update task melalui repository
            const updatedTask = this.taskRepository.update(taskId, updates);
            
            return {
                success: true,
                data: updatedTask,
                message: 'Task berhasil diupdate'
            };
            
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    /**
     * Hapus task
     * @param {string} taskId - Task ID
     * @returns {Object} - Response success atau error
     */
    deleteTask(taskId) {
        try {
            if (!this.currentUser) {
                return {
                    success: false,
                    error: 'User harus login terlebih dahulu'
                };
            }
            
            const task = this.taskRepository.findById(taskId);
            
            if (!task) {
                return {
                    success: false,
                    error: 'Task tidak ditemukan'
                };
            }
            
            // Cek permission: hanya owner yang bisa hapus
            if (task.ownerId !== this.currentUser.id) {
                return {
                    success: false,
                    error: 'Hanya owner yang bisa menghapus task'
                };
            }
            
            // Hapus task melalui repository
            const deleted = this.taskRepository.delete(taskId);
            
            if (deleted) {
                return {
                    success: true,
                    message: `Task "${task.title}" berhasil dihapus`
                };
            } else {
                return {
                    success: false,
                    error: 'Gagal menghapus task'
                };
            }
            
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    /**
     * Toggle status task (complete/incomplete)
     * @param {string} taskId - Task ID
     * @returns {Object} - Response dengan task yang diupdate
     */
    toggleTaskStatus(taskId) {
        try {
            const task = this.taskRepository.findById(taskId);
            
            if (!task) {
                return {
                    success: false,
                    error: 'Task tidak ditemukan'
                };
            }
            
            // Assignee juga bisa toggle status
            if (task.ownerId !== this.currentUser.id && task.assigneeId !== this.currentUser.id) {
                return {
                    success: false,
                    error: 'Anda tidak memiliki akses ke task ini'
                };
            }
            
            const newStatus = task.isCompleted ? 'pending' : 'completed';
            const updatedTask = this.taskRepository.update(taskId, { status: newStatus });
            
            return {
                success: true,
                data: updatedTask,
                message: `Task ${newStatus === 'completed' ? 'selesai' : 'belum selesai'}`
            };
            
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    /**
     * Search task
     * @param {string} query - Search query
     * @returns {Object} - Response dengan hasil search
     */
    searchTasks(query) {
        try {
            if (!this.currentUser) {
                return {
                    success: false,
                    error: 'User harus login terlebih dahulu'
                };
            }
            
            if (!query || query.trim() === '') {
                return {
                    success: false,
                    error: 'Query pencarian tidak boleh kosong'
                };
            }
            
            // Search semua task, lalu filter untuk current user
            const allResults = this.taskRepository.search(query);
            const userResults = allResults.filter(task => 
                task.ownerId === this.currentUser.id || task.assigneeId === this.currentUser.id
            );
            
            return {
                success: true,
                data: userResults,
                count: userResults.length,
                query: query
            };
            
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    /**
     * Get task statistics
     * @returns {Object} - Response dengan statistik task
     */
    getTaskStats() {
        try {
            if (!this.currentUser) {
                return {
                    success: false,
                    error: 'User harus login terlebih dahulu'
                };
            }
            
            const stats = this.taskRepository.getStats(this.currentUser.id);
            
            return {
                success: true,
                data: stats
            };
            
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    /**
     * Get overdue tasks
     * @returns {Object} - Response dengan task yang overdue
     */
    getOverdueTasks() {
        try {
            if (!this.currentUser) {
                return {
                    success: false,
                    error: 'User harus login terlebih dahulu'
                };
            }
            
            const overdueTasks = this.taskRepository.findOverdue()
                .filter(task => task.ownerId === this.currentUser.id || task.assigneeId === this.currentUser.id);
            
            return {
                success: true,
                data: overdueTasks,
                count: overdueTasks.length
            };
            
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    /**
     * Get tasks due soon
     * @param {number} days - Jumlah hari ke depan
     * @returns {Object} - Response dengan task yang akan due
     */
    getTasksDueSoon(days = 3) {
        try {
            if (!this.currentUser) {
                return {
                    success: false,
                    error: 'User harus login terlebih dahulu'
                };
            }
            
            const dueSoonTasks = this.taskRepository.findDueSoon(days)
                .filter(task => task.ownerId === this.currentUser.id || task.assigneeId === this.currentUser.id);
            
            return {
                success: true,
                data: dueSoonTasks,
                count: dueSoonTasks.length
            };
            
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
}

// Export untuk digunakan di file lain
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TaskController;
} else {
    window.TaskController = TaskController;
}
```

**File**: `src/controllers/UserController.js` (buat file baru)

```javascript
/**
 * User Controller - Mengatur alur kerja user management
 * 
 * Handles:
 * - User registration dan login
 * - Profile management
 * - User preferences
 * - Authentication simulation
 */
class UserController {
    constructor(userRepository) {
        this.userRepository = userRepository;
        this.currentUser = null;
    }
    
    /**
     * Register user baru
     * @param {Object} userData - Data user (username, email, fullName)
     * @returns {Object} - Response dengan user yang dibuat atau error
     */
    register(userData) {
        try {
            // Validasi input
            if (!userData.username || userData.username.trim() === '') {
                return {
                    success: false,
                    error: 'Username wajib diisi'
                };
            }
            
            if (!userData.email || userData.email.trim() === '') {
                return {
                    success: false,
                    error: 'Email wajib diisi'
                };
            }
            
            // Buat user baru
            const user = this.userRepository.create(userData);
            
            return {
                success: true,
                data: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    fullName: user.fullName
                },
                message: `User ${user.username} berhasil didaftarkan`
            };
            
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    /**
     * Login user (simulasi)
     * @param {string} username - Username
     * @returns {Object} - Response dengan user data atau error
     */
    login(username) {
        try {
            if (!username || username.trim() === '') {
                return {
                    success: false,
                    error: 'Username wajib diisi'
                };
            }
            
            const user = this.userRepository.findByUsername(username);
            
            if (!user) {
                return {
                    success: false,
                    error: 'User tidak ditemukan'
                };
            }
            
            if (!user.isActive) {
                return {
                    success: false,
                    error: 'Akun tidak aktif'
                };
            }
            
            // Record login
            this.userRepository.recordLogin(user.id);
            this.currentUser = user;
            
            return {
                success: true,
                data: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    fullName: user.fullName,
                    role: user.role,
                    preferences: user.preferences
                },
                message: `Selamat datang, ${user.fullName || user.username}!`
            };
            
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    /**
     * Logout user
     * @returns {Object} - Response success
     */
    logout() {
        const username = this.currentUser ? this.currentUser.username : 'User';
        this.currentUser = null;
        
        return {
            success: true,
            message: `${username} berhasil logout`
        };
    }
    
    /**
     * Get current user
     * @returns {Object} - Response dengan current user atau error
     */
    getCurrentUser() {
        if (!this.currentUser) {
            return {
                success: false,
                error: 'Tidak ada user yang login'
            };
        }
        
        return {
            success: true,
            data: {
                id: this.currentUser.id,
                username: this.currentUser.username,
                email: this.currentUser.email,
                fullName: this.currentUser.fullName,
                role: this.currentUser.role,
                preferences: this.currentUser.preferences,
                lastLoginAt: this.currentUser.lastLoginAt
            }
        };
    }
    
    /**
     * Update user profile
     * @param {Object} updates - Data yang akan diupdate
     * @returns {Object} - Response dengan user yang diupdate atau error
     */
    updateProfile(updates) {
        try {
            if (!this.currentUser) {
                return {
                    success: false,
                    error: 'User harus login terlebih dahulu'
                };
            }
            
            const updatedUser = this.userRepository.update(this.currentUser.id, updates);
            
            if (!updatedUser) {
                return {
                    success: false,
                    error: 'Gagal mengupdate profile'
                };
            }
            
            // Update current user reference
            this.currentUser = updatedUser;
            
            return {
                success: true,
                data: {
                    id: updatedUser.id,
                    username: updatedUser.username,
                    email: updatedUser.email,
                    fullName: updatedUser.fullName,
                    preferences: updatedUser.preferences
                },
                message: 'Profile berhasil diupdate'
            };
            
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    /**
     * Update user preferences
     * @param {Object} preferences - Preferences baru
     * @returns {Object} - Response success atau error
     */
    updatePreferences(preferences) {
        try {
            if (!this.currentUser) {
                return {
                    success: false,
                    error: 'User harus login terlebih dahulu'
                };
            }
            
            const updatedUser = this.userRepository.update(this.currentUser.id, {
                preferences: preferences
            });
            
            if (!updatedUser) {
                return {
                    success: false,
                    error: 'Gagal mengupdate preferences'
                };
            }
            
            this.currentUser = updatedUser;
            
            return {
                success: true,
                data: updatedUser.preferences,
                message: 'Preferences berhasil diupdate'
            };
            
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    /**
     * Get all users (untuk assign task)
     * @returns {Object} - Response dengan list user
     */
    getAllUsers() {
        try {
            if (!this.currentUser) {
                return {
                    success: false,
                    error: 'User harus login terlebih dahulu'
                };
            }
            
            const users = this.userRepository.findActive();
            
            // Return data minimal untuk privacy
            const userData = users.map(user => ({
                id: user.id,
                username: user.username,
                fullName: user.fullName
            }));
            
            return {
                success: true,
                data: userData,
                count: userData.length
            };
            
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    /**
     * Search users
     * @param {string} query - Search query
     * @returns {Object} - Response dengan hasil search
     */
    searchUsers(query) {
        try {
            if (!this.currentUser) {
                return {
                    success: false,
                    error: 'User harus login terlebih dahulu'
                };
            }
            
            if (!query || query.trim() === '') {
                return {
                    success: false,
                    error: 'Query pencarian tidak boleh kosong'
                };
            }
            
            const users = this.userRepository.search(query);
            
            // Return data minimal untuk privacy
            const userData = users
                .filter(user => user.isActive)
                .map(user => ({
                    id: user.id,
                    username: user.username,
                    fullName: user.fullName
                }));
            
            return {
                success: true,
                data: userData,
                count: userData.length,
                query: query
            };
            
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    /**
     * Check if user is logged in
     * @returns {boolean} - Login status
     */
    isLoggedIn() {
        return this.currentUser !== null;
    }
    
    /**
     * Get user by ID (untuk display assignee name)
     * @param {string} userId - User ID
     * @returns {Object} - Response dengan user data atau error
     */
    getUserById(userId) {
        try {
            const user = this.userRepository.findById(userId);
            
            if (!user) {
                return {
                    success: false,
                    error: 'User tidak ditemukan'
                };
            }
            
            return {
                success: true,
                data: {
                    id: user.id,
                    username: user.username,
                    fullName: user.fullName
                }
            };
            
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
}

// Export untuk digunakan di file lain
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UserController;
} else {
    window.UserController = UserController;
}
```

**Penjelasan Controller Pattern**:
- **Input Handling**: Menerima dan memvalidasi input dari user
- **Business Logic Coordination**: Menggunakan Repository dan Model untuk proses data
- **Response Formatting**: Mengembalikan response yang konsisten
- **Permission Checking**: Memastikan user punya akses yang sesuai
- **Error Handling**: Menangani error dengan graceful

### Step 6: Upgrade Storage Manager

Kita perlu upgrade StorageManager untuk mendukung multiple entities (User dan Task).

**File**: `src/utils/EnhancedStorageManager.js` (buat file baru)

```javascript
/**
 * Enhanced Storage Manager - Storage dengan multi-entity support
 * 
 * Improvements dari Day 1:
 * - Support multiple entities (users, tasks, settings)
 * - Better error handling
 * - Data migration support
 * - Backup dan restore functionality
 */
class EnhancedStorageManager {
    constructor(appName = 'taskManagementApp', version = '2.0') {
        this.appName = appName;
        this.version = version;
        this.isAvailable = this._checkStorageAvailability();
        
        // Initialize app metadata
        this._initializeApp();
    }
    
    /**
     * Save data untuk entity tertentu
     * @param {string} entity - Entity name (users, tasks, settings)
     * @param {any} data - Data to save
     * @returns {boolean} - Success status
     */
    save(entity, data) {
        if (!this.isAvailable) {
            console.warn('localStorage not available, data will not persist');
            return false;
        }
        
        try {
            const key = this._getKey(entity);
            const dataToSave = {
                data: data,
                timestamp: new Date().toISOString(),
                version: this.version
            };
            
            localStorage.setItem(key, JSON.stringify(dataToSave));
            
            // Update metadata
            this._updateMetadata(entity, dataToSave.timestamp);
            
            return true;
        } catch (error) {
            console.error(`Failed to save ${entity}:`, error);
            return false;
        }
    }
    
    /**
     * Load data untuk entity tertentu
     * @param {string} entity - Entity name
     * @param {any} defaultValue - Default value jika tidak ada data
     * @returns {any} - Loaded data atau default value
     */
    load(entity, defaultValue = null) {
        if (!this.isAvailable) {
            return defaultValue;
        }
        
        try {
            const key = this._getKey(entity);
            const storedData = localStorage.getItem(key);
            
            if (!storedData) {
                return defaultValue;
            }
            
            const parsedData = JSON.parse(storedData);
            
            // Check version compatibility
            if (parsedData.version && parsedData.version !== this.version) {
                console.warn(`Version mismatch for ${entity}: stored=${parsedData.version}, current=${this.version}`);
                // Bisa implement migration logic di sini
            }
            
            return parsedData.data;
        } catch (error) {
            console.error(`Failed to load ${entity}:`, error);
            return defaultValue;
        }
    }
    
    /**
     * Remove data untuk entity tertentu
     * @param {string} entity - Entity name
     * @returns {boolean} - Success status
     */
    remove(entity) {
        if (!this.isAvailable) {
            return false;
        }
        
        try {
            const key = this._getKey(entity);
            localStorage.removeItem(key);
            
            // Update metadata
            this._removeFromMetadata(entity);
            
            return true;
        } catch (error) {
            console.error(`Failed to remove ${entity}:`, error);
            return false;
        }
    }
    
    /**
     * Clear semua data aplikasi
     * @returns {boolean} - Success status
     */
    clear() {
        if (!this.isAvailable) {
            return false;
        }
        
        try {
            const keysToRemove = [];
            
            // Find all keys yang belong ke app ini
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith(this.appName)) {
                    keysToRemove.push(key);
                }
            }
            
            // Remove all keys
            keysToRemove.forEach(key => localStorage.removeItem(key));
            
            return true;
        } catch (error) {
            console.error('Failed to clear app data:', error);
            return false;
        }
    }
    
    /**
     * Export semua data aplikasi
     * @returns {Object|null} - Exported data atau null jika gagal
     */
    exportData() {
        if (!this.isAvailable) {
            return null;
        }
        
        try {
            const exportData = {
                appName: this.appName,
                version: this.version,
                exportedAt: new Date().toISOString(),
                data: {}
            };
            
            // Get all app keys
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith(this.appName)) {
                    const value = localStorage.getItem(key);
                    exportData.data[key] = JSON.parse(value);
                }
            }
            
            return exportData;
        } catch (error) {
            console.error('Failed to export data:', error);
            return null;
        }
    }
    
    /**
     * Import data ke aplikasi
     * @param {Object} importData - Data yang akan diimport
     * @returns {boolean} - Success status
     */
    importData(importData) {
        if (!this.isAvailable) {
            return false;
        }
        
        try {
            // Validasi format import data
            if (!importData.appName || !importData.data) {
                throw new Error('Invalid import data format');
            }
            
            // Warning jika app name berbeda
            if (importData.appName !== this.appName) {
                console.warn(`Importing data from different app: ${importData.appName}`);
            }
            
            // Import each key
            Object.keys(importData.data).forEach(key => {
                localStorage.setItem(key, JSON.stringify(importData.data[key]));
            });
            
            return true;
        } catch (error) {
            console.error('Failed to import data:', error);
            return false;
        }
    }
    
    /**
     * Get storage usage info
     * @returns {Object} - Storage usage information
     */
    getStorageInfo() {
        if (!this.isAvailable) {
            return { available: false };
        }
        
        try {
            let totalSize = 0;
            let appSize = 0;
            let appKeys = 0;
            
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                const value = localStorage.getItem(key);
                const itemSize = key.length + value.length;
                
                totalSize += itemSize;
                
                if (key.startsWith(this.appName)) {
                    appSize += itemSize;
                    appKeys++;
                }
            }
            
            return {
                available: true,
                totalSize,
                appSize,
                appKeys,
                totalKeys: localStorage.length,
                usagePercentage: totalSize > 0 ? (appSize / totalSize * 100).toFixed(2) : 0
            };
        } catch (error) {
            console.error('Failed to get storage info:', error);
            return { available: false, error: error.message };
        }
    }
    
    /**
     * Get app metadata
     * @returns {Object} - App metadata
     */
    getMetadata() {
        return this.load('_metadata', {
            version: this.version,
            createdAt: new Date().toISOString(),
            entities: {}
        });
    }
    
    /**
     * Check if entity exists
     * @param {string} entity - Entity name
     * @returns {boolean} - Existence status
     */
    exists(entity) {
        if (!this.isAvailable) {
            return false;
        }
        
        const key = this._getKey(entity);
        return localStorage.getItem(key) !== null;
    }
    
    /**
     * Get all entity names
     * @returns {string[]} - Array of entity names
     */
    getEntities() {
        if (!this.isAvailable) {
            return [];
        }
        
        const entities = [];
        const prefix = this.appName + '_';
        
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(prefix)) {
                const entity = key.substring(prefix.length);
                if (entity !== '_metadata') {
                    entities.push(entity);
                }
            }
        }
        
        return entities;
    }
    
    // Private methods
    _getKey(entity) {
        return `${this.appName}_${entity}`;
    }
    
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
    
    _initializeApp() {
        if (!this.exists('_metadata')) {
            this.save('_metadata', {
                version: this.version,
                createdAt: new Date().toISOString(),
                entities: {}
            });
        }
    }
    
    _updateMetadata(entity, timestamp) {
        const metadata = this.getMetadata();
        metadata.entities[entity] = {
            lastUpdated: timestamp,
            version: this.version
        };
        this.save('_metadata', metadata);
    }
    
    _removeFromMetadata(entity) {
        const metadata = this.getMetadata();
        delete metadata.entities[entity];
        this.save('_metadata', metadata);
    }
}

// Export untuk digunakan di file lain
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EnhancedStorageManager;
} else {
    window.EnhancedStorageManager = EnhancedStorageManager;
}
```

**Penjelasan Enhanced Storage Manager**:
- **Multi-Entity Support**: Bisa simpan berbagai jenis data (users, tasks, settings)
- **Versioning**: Track versi data untuk migration
- **Metadata**: Informasi tentang data yang tersimpan
- **Export/Import**: Backup dan restore functionality
- **Better Error Handling**: Lebih robust error handling

### Step 7: Buat View Layer (MVC - View)

View layer mengatur tampilan dan interaksi user dengan aplikasi.

**File**: `src/views/TaskView.js` (buat file baru)

```javascript
/**
 * Task View - Mengatur tampilan dan interaksi task
 * 
 * View dalam MVC Pattern:
 * - Mengatur DOM manipulation
 * - Handle user interactions
 * - Display data dari Controller
 * - Tidak mengandung business logic
 */
class TaskView {
    constructor(taskController, userController) {
        this.taskController = taskController;
        this.userController = userController;
        
        // DOM elements
        this.taskForm = null;
        this.taskList = null;
        this.taskStats = null;
        this.filterButtons = null;
        this.searchInput = null;
        this.messagesContainer = null;
        
        // Current state
        this.currentFilter = 'all';
        this.currentSort = 'createdAt';
        this.currentSortOrder = 'desc';
        
        this._initializeElements();
        this._setupEventListeners();
    }
    
    /**
     * Initialize DOM elements
     */
    _initializeElements() {
        this.taskForm = document.getElementById('taskForm');
        this.taskList = document.getElementById('taskList');
        this.taskStats = document.getElementById('taskStats');
        this.filterButtons = document.querySelectorAll('.filter-btn');
        this.searchInput = document.getElementById('searchInput');
        this.messagesContainer = document.getElementById('messages');
        
        // Create elements jika belum ada
        if (!this.messagesContainer) {
            this.messagesContainer = this._createMessagesContainer();
        }
    }
    
    /**
     * Setup event listeners
     */
    _setupEventListeners() {
        // Task form submission
        if (this.taskForm) {
            this.taskForm.addEventListener('submit', (e) => this._handleTaskFormSubmit(e));
        }
        
        // Filter buttons
        this.filterButtons.forEach(btn => {
            btn.addEventListener('click', (e) => this._handleFilterChange(e));
        });
        
        // Search input
        if (this.searchInput) {
            this.searchInput.addEventListener('input', (e) => this._handleSearch(e));
        }
        
        // Sort dropdown
        const sortSelect = document.getElementById('sortSelect');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => this._handleSortChange(e));
        }
        
        // Clear all tasks button
        const clearAllBtn = document.getElementById('clearAllTasks');
        if (clearAllBtn) {
            clearAllBtn.addEventListener('click', () => this._handleClearAllTasks());
        }
    }
    
    /**
     * Render task list
     */
    renderTasks() {
        if (!this.taskList) return;
        
        // Get tasks dari controller
        const response = this.taskController.getTasks({
            status: this.currentFilter === 'all' ? undefined : this.currentFilter,
            sortBy: this.currentSort,
            sortOrder: this.currentSortOrder
        });
        
        if (!response.success) {
            this.showMessage(response.error, 'error');
            return;
        }
        
        const tasks = response.data;
        
        if (tasks.length === 0) {
            this.taskList.innerHTML = this._getEmptyStateHTML();
            return;
        }
        
        // Render tasks
        const tasksHTML = tasks.map(task => this._createTaskHTML(task)).join('');
        this.taskList.innerHTML = tasksHTML;
        
        // Setup task-specific event listeners
        this._setupTaskEventListeners();
    }
    
    /**
     * Render task statistics
     */
    renderStats() {
        if (!this.taskStats) return;
        
        const response = this.taskController.getTaskStats();
        
        if (!response.success) {
            console.error('Failed to get stats:', response.error);
            return;
        }
        
        const stats = response.data;
        
        this.taskStats.innerHTML = `
            <div class="stats-grid">
                <div class="stat-item">
                    <span class="stat-number">${stats.total}</span>
                    <span class="stat-label">Total Tasks</span>
                </div>
                <div class="stat-item">
                    <span class="stat-number">${stats.byStatus.pending || 0}</span>
                    <span class="stat-label">Pending</span>
                </div>
                <div class="stat-item">
                    <span class="stat-number">${stats.completed}</span>
                    <span class="stat-label">Completed</span>
                </div>
                <div class="stat-item priority-high">
                    <span class="stat-number">${stats.byPriority.high || 0}</span>
                    <span class="stat-label">High Priority</span>
                </div>
                <div class="stat-item ${stats.overdue > 0 ? 'overdue' : ''}">
                    <span class="stat-number">${stats.overdue}</span>
                    <span class="stat-label">Overdue</span>
                </div>
                <div class="stat-item">
                    <span class="stat-number">${stats.dueSoon}</span>
                    <span class="stat-label">Due Soon</span>
                </div>
            </div>
        `;
    }
    
    /**
     * Show message to user
     * @param {string} message - Message text
     * @param {string} type - Message type (success, error, info, warning)
     */
    showMessage(message, type = 'info') {
        if (!this.messagesContainer) return;
        
        const messageElement = document.createElement('div');
        messageElement.className = `message message-${type}`;
        messageElement.textContent = message;
        
        this.messagesContainer.appendChild(messageElement);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (messageElement.parentNode) {
                messageElement.parentNode.removeChild(messageElement);
            }
        }, 5000);
    }
    
    /**
     * Refresh all views
     */
    refresh() {
        this.renderTasks();
        this.renderStats();
    }
    
    /**
     * Handle task form submission
     */
    _handleTaskFormSubmit(event) {
        event.preventDefault();
        
        const formData = new FormData(event.target);
        const taskData = {
            title: formData.get('title')?.trim(),
            description: formData.get('description')?.trim(),
            category: formData.get('category') || 'personal',
            priority: formData.get('priority') || 'medium',
            dueDate: formData.get('dueDate') || null,
            estimatedHours: parseFloat(formData.get('estimatedHours')) || 0,
            tags: formData.get('tags') ? formData.get('tags').split(',').map(tag => tag.trim()) : []
        };
        
        // Handle assignee
        const assigneeId = formData.get('assigneeId');
        if (assigneeId && assigneeId !== 'self') {
            taskData.assigneeId = assigneeId;
        }
        
        const response = this.taskController.createTask(taskData);
        
        if (response.success) {
            this.showMessage(response.message, 'success');
            event.target.reset();
            this.refresh();
        } else {
            this.showMessage(response.error, 'error');
        }
    }
    
    /**
     * Handle filter change
     */
    _handleFilterChange(event) {
        const filterType = event.target.dataset.filter;
        
        // Update active filter button
        this.filterButtons.forEach(btn => btn.classList.remove('active'));
        event.target.classList.add('active');
        
        this.currentFilter = filterType;
        this.renderTasks();
    }
    
    /**
     * Handle search
     */
    _handleSearch(event) {
        const query = event.target.value.trim();
        
        if (query === '') {
            this.renderTasks();
            return;
        }
        
        const response = this.taskController.searchTasks(query);
        
        if (response.success) {
            const tasks = response.data;
            
            if (tasks.length === 0) {
                this.taskList.innerHTML = `
                    <div class="empty-state">
                        <p>Tidak ada task yang ditemukan untuk "${query}"</p>
                        <small>Coba kata kunci yang berbeda</small>
                    </div>
                `;
            } else {
                const tasksHTML = tasks.map(task => this._createTaskHTML(task)).join('');
                this.taskList.innerHTML = tasksHTML;
                this._setupTaskEventListeners();
            }
        } else {
            this.showMessage(response.error, 'error');
        }
    }
    
    /**
     * Handle sort change
     */
    _handleSortChange(event) {
        const [sortBy, sortOrder] = event.target.value.split('-');
        this.currentSort = sortBy;
        this.currentSortOrder = sortOrder;
        this.renderTasks();
    }
    
    /**
     * Handle clear all tasks
     */
    _handleClearAllTasks() {
        if (confirm('Apakah Anda yakin ingin menghapus semua task?')) {
            // Implementasi clear all tasks
            // Untuk sekarang, kita refresh saja
            this.refresh();
        }
    }
    
    /**
     * Setup task-specific event listeners
     */
    _setupTaskEventListeners() {
        // Toggle task status
        document.querySelectorAll('.btn-toggle').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const taskId = e.target.closest('.task-item').dataset.taskId;
                this._handleTaskToggle(taskId);
            });
        });
        
        // Delete task
        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const taskId = e.target.closest('.task-item').dataset.taskId;
                this._handleTaskDelete(taskId);
            });
        });
        
        // Edit task (jika ada)
        document.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const taskId = e.target.closest('.task-item').dataset.taskId;
                this._handleTaskEdit(taskId);
            });
        });
    }
    
    /**
     * Handle task toggle
     */
    _handleTaskToggle(taskId) {
        const response = this.taskController.toggleTaskStatus(taskId);
        
        if (response.success) {
            this.showMessage(response.message, 'success');
            this.refresh();
        } else {
            this.showMessage(response.error, 'error');
        }
    }
    
    /**
     * Handle task delete
     */
    _handleTaskDelete(taskId) {
        const taskResponse = this.taskController.getTask(taskId);
        
        if (!taskResponse.success) {
            this.showMessage(taskResponse.error, 'error');
            return;
        }
        
        const task = taskResponse.data;
        
        if (confirm(`Apakah Anda yakin ingin menghapus task "${task.title}"?`)) {
            const response = this.taskController.deleteTask(taskId);
            
            if (response.success) {
                this.showMessage(response.message, 'success');
                this.refresh();
            } else {
                this.showMessage(response.error, 'error');
            }
        }
    }
    
    /**
     * Handle task edit
     */
    _handleTaskEdit(taskId) {
        // Implementasi edit task
        // Untuk sekarang, kita tampilkan alert saja
        alert('Edit task feature akan diimplementasikan nanti');
    }
    
    /**
     * Create HTML for single task
     */
    _createTaskHTML(task) {
        const priorityClass = `priority-${task.priority}`;
        const statusClass = `status-${task.status}`;
        const overdueClass = task.isOverdue ? 'overdue' : '';
        
        // Format dates
        const createdDate = new Date(task.createdAt).toLocaleDateString('id-ID');
        const dueDate = task.dueDate ? new Date(task.dueDate).toLocaleDateString('id-ID') : null;
        
        // Get assignee name
        let assigneeName = 'Unknown';
        if (task.assigneeId) {
            const userResponse = this.userController.getUserById(task.assigneeId);
            if (userResponse.success) {
                assigneeName = userResponse.data.fullName || userResponse.data.username;
            }
        }
        
        return `
            <div class="task-item ${priorityClass} ${statusClass} ${overdueClass}" data-task-id="${task.id}">
                <div class="task-content">
                    <div class="task-header">
                        <h3 class="task-title">${this._escapeHtml(task.title)}</h3>
                        <div class="task-badges">
                            <span class="task-priority badge-${task.priority}">${task.priority}</span>
                            <span class="task-category badge-category">${task.category}</span>
                            <span class="task-status badge-status">${task.status}</span>
                        </div>
                    </div>
                    
                    ${task.description ? `<p class="task-description">${this._escapeHtml(task.description)}</p>` : ''}
                    
                    ${task.tags.length > 0 ? `
                        <div class="task-tags">
                            ${task.tags.map(tag => `<span class="tag">${this._escapeHtml(tag)}</span>`).join('')}
                        </div>
                    ` : ''}
                    
                    <div class="task-meta">
                        <small>Dibuat: ${createdDate}</small>
                        ${dueDate ? `<small class="${task.isOverdue ? 'overdue-text' : ''}">Due: ${dueDate}</small>` : ''}
                        ${task.assigneeId !== task.ownerId ? `<small>Assigned to: ${assigneeName}</small>` : ''}
                        ${task.estimatedHours > 0 ? `<small>Estimasi: ${task.estimatedHours}h</small>` : ''}
                    </div>
                </div>
                
                <div class="task-actions">
                    <button class="btn btn-toggle" title="${task.isCompleted ? 'Mark incomplete' : 'Mark complete'}">
                        ${task.isCompleted ? '↶' : '✓'}
                    </button>
                    <button class="btn btn-edit" title="Edit task">
                        ✏️
                    </button>
                    <button class="btn btn-delete" title="Delete task">
                        🗑️
                    </button>
                </div>
            </div>
        `;
    }
    
    /**
     * Get empty state HTML
     */
    _getEmptyStateHTML() {
        return `
            <div class="empty-state">
                <p>Belum ada task</p>
                <small>Buat task pertama Anda menggunakan form di atas</small>
            </div>
        `;
    }
    
    /**
     * Create messages container
     */
    _createMessagesContainer() {
        const container = document.createElement('div');
        container.id = 'messages';
        container.className = 'messages-container';
        document.body.appendChild(container);
        return container;
    }
    
    /**
     * Escape HTML to prevent XSS
     */
    _escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Export untuk digunakan di file lain
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TaskView;
} else {
    window.TaskView = TaskView;
}
```

**Penjelasan View Pattern**:
- **DOM Manipulation**: Mengatur tampilan dan update UI
- **Event Handling**: Menangani user interactions
- **Data Display**: Menampilkan data dari Controller
- **User Feedback**: Menampilkan messages dan notifications
- **No Business Logic**: View hanya mengatur tampilan, tidak ada business logic

Lanjut ke Step 8...
### Step 8: Update HTML untuk Day 2

Sekarang kita update HTML untuk mendukung fitur-fitur baru Day 2.

**PENTING**: Day 2 tetap menggunakan server setup yang sama dengan Day 1. Kita akan update file yang ada, bukan membuat file baru.

**File**: `public/index.html` (update file yang sudah ada)

```html
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Task Management System - Day 2</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <div class="app-container">
        <!-- Header dengan User Info -->
        <header class="app-header">
            <div class="header-content">
                <h1>Task Management System</h1>
                <p class="subtitle">Day 2: Requirements & Design Patterns</p>
                
                <div class="user-section">
                    <div id="loginSection" class="login-section">
                        <input type="text" id="usernameInput" placeholder="Username" required>
                        <button id="loginBtn" class="btn btn-primary">Login</button>
                        <button id="registerBtn" class="btn btn-secondary">Register</button>
                    </div>
                    
                    <div id="userInfo" class="user-info" style="display: none;">
                        <span id="welcomeMessage">Selamat datang!</span>
                        <button id="logoutBtn" class="btn btn-outline">Logout</button>
                    </div>
                </div>
            </div>
        </header>

        <!-- Messages Container -->
        <div id="messages" class="messages-container"></div>

        <!-- Main Content -->
        <main class="main-content" id="mainContent" style="display: none;">
            
            <!-- Task Statistics -->
            <section class="stats-section">
                <h2>Dashboard</h2>
                <div id="taskStats" class="stats-container">
                    <!-- Stats akan di-render di sini -->
                </div>
            </section>

            <!-- Quick Actions -->
            <section class="quick-actions">
                <button id="showOverdueBtn" class="btn btn-warning">Lihat Overdue Tasks</button>
                <button id="showDueSoonBtn" class="btn btn-info">Tasks Due Soon</button>
                <button id="exportDataBtn" class="btn btn-outline">Export Data</button>
            </section>

            <!-- Task Creation Form -->
            <section class="form-section">
                <h2>Buat Task Baru</h2>
                <form id="taskForm" class="task-form">
                    <div class="form-row">
                        <div class="form-group">
                            <label for="taskTitle">Judul Task *</label>
                            <input type="text" id="taskTitle" name="title" required placeholder="Masukkan judul task">
                        </div>
                        
                        <div class="form-group">
                            <label for="taskCategory">Kategori</label>
                            <select id="taskCategory" name="category">
                                <option value="personal">Personal</option>
                                <option value="work">Work</option>
                                <option value="study">Study</option>
                                <option value="health">Health</option>
                                <option value="finance">Finance</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label for="taskDescription">Deskripsi</label>
                        <textarea id="taskDescription" name="description" placeholder="Deskripsi task (opsional)" rows="3"></textarea>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="taskPriority">Prioritas</label>
                            <select id="taskPriority" name="priority">
                                <option value="low">Low</option>
                                <option value="medium" selected>Medium</option>
                                <option value="high">High</option>
                                <option value="urgent">Urgent</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label for="taskDueDate">Due Date</label>
                            <input type="date" id="taskDueDate" name="dueDate">
                        </div>
                        
                        <div class="form-group">
                            <label for="taskEstimatedHours">Estimasi Jam</label>
                            <input type="number" id="taskEstimatedHours" name="estimatedHours" min="0" step="0.5" placeholder="0">
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="taskTags">Tags (pisahkan dengan koma)</label>
                            <input type="text" id="taskTags" name="tags" placeholder="urgent, meeting, project">
                        </div>
                        
                        <div class="form-group">
                            <label for="taskAssignee">Assign ke</label>
                            <select id="taskAssignee" name="assigneeId">
                                <option value="self">Diri Sendiri</option>
                                <!-- Options akan diisi dari JavaScript -->
                            </select>
                        </div>
                    </div>
                    
                    <button type="submit" class="btn btn-primary btn-large">Buat Task</button>
                </form>
            </section>

            <!-- Search dan Filter -->
            <section class="search-filter-section">
                <div class="search-container">
                    <h2>Cari & Filter Tasks</h2>
                    <div class="search-controls">
                        <input type="text" id="searchInput" placeholder="Cari task..." class="search-input">
                        <select id="sortSelect" class="sort-select">
                            <option value="createdAt-desc">Terbaru</option>
                            <option value="createdAt-asc">Terlama</option>
                            <option value="title-asc">Judul A-Z</option>
                            <option value="title-desc">Judul Z-A</option>
                            <option value="priority-desc">Prioritas Tinggi</option>
                            <option value="dueDate-asc">Due Date</option>
                        </select>
                    </div>
                </div>
                
                <div class="filter-container">
                    <h3>Filter berdasarkan:</h3>
                    <div class="filter-groups">
                        <div class="filter-group">
                            <h4>Status</h4>
                            <div class="filter-buttons">
                                <button class="filter-btn active" data-filter="all">Semua</button>
                                <button class="filter-btn" data-filter="pending">Pending</button>
                                <button class="filter-btn" data-filter="in-progress">In Progress</button>
                                <button class="filter-btn" data-filter="completed">Completed</button>
                                <button class="filter-btn" data-filter="blocked">Blocked</button>
                            </div>
                        </div>
                        
                        <div class="filter-group">
                            <h4>Prioritas</h4>
                            <div class="filter-buttons">
                                <button class="filter-btn" data-filter="urgent">Urgent</button>
                                <button class="filter-btn" data-filter="high">High</button>
                                <button class="filter-btn" data-filter="medium">Medium</button>
                                <button class="filter-btn" data-filter="low">Low</button>
                            </div>
                        </div>
                        
                        <div class="filter-group">
                            <h4>Kategori</h4>
                            <div class="filter-buttons">
                                <button class="filter-btn" data-filter="work">Work</button>
                                <button class="filter-btn" data-filter="personal">Personal</button>
                                <button class="filter-btn" data-filter="study">Study</button>
                                <button class="filter-btn" data-filter="health">Health</button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Task List -->
            <section class="tasks-section">
                <div class="tasks-header">
                    <h2>Your Tasks</h2>
                    <div class="tasks-actions">
                        <button id="clearAllTasks" class="btn btn-danger">Clear All</button>
                        <button id="refreshTasks" class="btn btn-outline">Refresh</button>
                    </div>
                </div>
                <div id="taskList" class="task-list">
                    <!-- Tasks akan di-render di sini -->
                </div>
            </section>
        </main>

        <!-- Registration Modal -->
        <div id="registerModal" class="modal" style="display: none;">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Daftar User Baru</h3>
                    <button class="modal-close" id="closeRegisterModal">&times;</button>
                </div>
                <form id="registerForm" class="modal-form">
                    <div class="form-group">
                        <label for="regUsername">Username *</label>
                        <input type="text" id="regUsername" name="username" required>
                    </div>
                    <div class="form-group">
                        <label for="regEmail">Email *</label>
                        <input type="email" id="regEmail" name="email" required>
                    </div>
                    <div class="form-group">
                        <label for="regFullName">Nama Lengkap</label>
                        <input type="text" id="regFullName" name="fullName">
                    </div>
                    <div class="modal-actions">
                        <button type="button" class="btn btn-secondary" id="cancelRegister">Batal</button>
                        <button type="submit" class="btn btn-primary">Daftar</button>
                    </div>
                </form>
            </div>
        </div>

        <!-- Footer -->
        <footer class="app-footer">
            <p>&copy; 2024 Software Engineering Shortcourse - Day 2 Implementation</p>
            <p>MVC Pattern • Repository Pattern • Enhanced Models</p>
        </footer>
    </div>

    <!-- Load JavaScript modules dalam urutan yang benar -->
    <script src="src/models/User.js"></script>
    <script src="src/models/EnhancedTask.js"></script>
    <script src="src/utils/EnhancedStorageManager.js"></script>
    <script src="src/repositories/UserRepository.js"></script>
    <script src="src/repositories/TaskRepository.js"></script>
    <script src="src/controllers/UserController.js"></script>
    <script src="src/controllers/TaskController.js"></script>
    <script src="src/views/TaskView.js"></script>
    <script src="src/app.js"></script>
</body>
</html>
```

### Step 9: Update CSS untuk Day 2

**File**: `public/styles.css` (update file yang sudah ada)

Tambahkan styles berikut ke file CSS yang sudah ada:

```css
/* Day 2 Enhanced Styles */

/* Reset dan Base Styles */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    line-height: 1.6;
    color: #333;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
}

.app-container {
    max-width: 1200px;
    margin: 0 auto;
    background: white;
    min-height: 100vh;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
}

/* Header Styles */
.app-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 2rem;
    text-align: center;
}

.header-content h1 {
    font-size: 2.5rem;
    margin-bottom: 0.5rem;
    font-weight: 700;
}

.subtitle {
    font-size: 1.1rem;
    opacity: 0.9;
    margin-bottom: 2rem;
}

.user-section {
    max-width: 400px;
    margin: 0 auto;
}

.login-section {
    display: flex;
    gap: 1rem;
    align-items: center;
    justify-content: center;
}

.login-section input {
    flex: 1;
    padding: 0.75rem;
    border: none;
    border-radius: 6px;
    font-size: 1rem;
}

.user-info {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
}

#welcomeMessage {
    font-size: 1.1rem;
    font-weight: 500;
}

/* Messages */
.messages-container {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 1000;
    max-width: 400px;
}

.message {
    padding: 1rem 1.5rem;
    margin-bottom: 0.5rem;
    border-radius: 8px;
    font-weight: 500;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
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

.message-warning {
    background-color: #fff3cd;
    color: #856404;
    border-left: 4px solid #ffc107;
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

/* Main Content */
.main-content {
    padding: 2rem;
}

/* Sections */
section {
    margin-bottom: 3rem;
    background: white;
    border-radius: 12px;
    padding: 2rem;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
    border: 1px solid #e9ecef;
}

section h2 {
    color: #495057;
    margin-bottom: 1.5rem;
    font-size: 1.5rem;
    font-weight: 600;
}

/* Stats Section */
.stats-container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 1.5rem;
}

.stat-item {
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    padding: 1.5rem;
    border-radius: 10px;
    text-align: center;
    border: 1px solid #dee2e6;
    transition: all 0.3s ease;
}

.stat-item:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.stat-number {
    display: block;
    font-size: 2.5rem;
    font-weight: 700;
    color: #667eea;
    margin-bottom: 0.5rem;
}

.stat-label {
    font-size: 0.9rem;
    color: #6c757d;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-weight: 500;
}

.stat-item.priority-high .stat-number {
    color: #dc3545;
}

.stat-item.overdue .stat-number {
    color: #dc3545;
    animation: pulse 2s infinite;
}

@keyframes pulse {
    0% { opacity: 1; }
    50% { opacity: 0.7; }
    100% { opacity: 1; }
}

/* Quick Actions */
.quick-actions {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
    justify-content: center;
}

/* Forms */
.task-form {
    display: grid;
    gap: 1.5rem;
}

.form-row {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
}

.form-group {
    display: flex;
    flex-direction: column;
}

.form-group label {
    font-weight: 600;
    margin-bottom: 0.5rem;
    color: #495057;
}

.form-group input,
.form-group textarea,
.form-group select {
    padding: 0.75rem;
    border: 2px solid #e9ecef;
    border-radius: 8px;
    font-size: 1rem;
    transition: all 0.2s ease;
    background: white;
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
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
}

.btn-primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
}

.btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
}

.btn-secondary {
    background-color: #6c757d;
    color: white;
}

.btn-secondary:hover {
    background-color: #5a6268;
    transform: translateY(-1px);
}

.btn-outline {
    background-color: transparent;
    color: #667eea;
    border: 2px solid #667eea;
}

.btn-outline:hover {
    background-color: #667eea;
    color: white;
}

.btn-danger {
    background-color: #dc3545;
    color: white;
}

.btn-danger:hover {
    background-color: #c82333;
    transform: translateY(-1px);
}

.btn-warning {
    background-color: #ffc107;
    color: #212529;
}

.btn-warning:hover {
    background-color: #e0a800;
}

.btn-info {
    background-color: #17a2b8;
    color: white;
}

.btn-info:hover {
    background-color: #138496;
}

.btn-large {
    padding: 1rem 2rem;
    font-size: 1.1rem;
}

.btn-toggle {
    background-color: #28a745;
    color: white;
    padding: 0.5rem;
    font-size: 1.2rem;
    min-width: 40px;
    height: 40px;
}

.btn-toggle:hover {
    background-color: #218838;
}

.btn-edit {
    background-color: #ffc107;
    color: #212529;
    padding: 0.5rem;
    font-size: 1.2rem;
    min-width: 40px;
    height: 40px;
}

.btn-edit:hover {
    background-color: #e0a800;
}

.btn-delete {
    background-color: #dc3545;
    color: white;
    padding: 0.5rem;
    font-size: 1.2rem;
    min-width: 40px;
    height: 40px;
}

.btn-delete:hover {
    background-color: #c82333;
}

/* Search dan Filter */
.search-filter-section {
    background: #f8f9fa;
}

.search-controls {
    display: flex;
    gap: 1rem;
    margin-bottom: 2rem;
}

.search-input {
    flex: 1;
    padding: 0.75rem;
    border: 2px solid #e9ecef;
    border-radius: 8px;
    font-size: 1rem;
}

.sort-select {
    padding: 0.75rem;
    border: 2px solid #e9ecef;
    border-radius: 8px;
    background: white;
    min-width: 200px;
}

.filter-groups {
    display: grid;
    gap: 2rem;
}

.filter-group h4 {
    margin-bottom: 1rem;
    color: #495057;
    font-size: 1.1rem;
}

.filter-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
}

.filter-btn {
    padding: 0.5rem 1rem;
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
    margin-bottom: 2rem;
}

.tasks-actions {
    display: flex;
    gap: 1rem;
}

.task-list {
    display: grid;
    gap: 1.5rem;
}

.task-item {
    background: white;
    border: 1px solid #e9ecef;
    border-radius: 12px;
    padding: 1.5rem;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    transition: all 0.3s ease;
    border-left: 4px solid #e9ecef;
}

.task-item:hover {
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
}

.task-item.priority-urgent {
    border-left-color: #dc3545;
    background: linear-gradient(135deg, #fff5f5 0%, #ffffff 100%);
}

.task-item.priority-high {
    border-left-color: #fd7e14;
    background: linear-gradient(135deg, #fff8f0 0%, #ffffff 100%);
}

.task-item.priority-medium {
    border-left-color: #ffc107;
    background: linear-gradient(135deg, #fffbf0 0%, #ffffff 100%);
}

.task-item.priority-low {
    border-left-color: #28a745;
    background: linear-gradient(135deg, #f0fff4 0%, #ffffff 100%);
}

.task-item.status-completed {
    opacity: 0.7;
    background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
}

.task-item.status-completed .task-title {
    text-decoration: line-through;
    color: #6c757d;
}

.task-item.overdue {
    border-left-color: #dc3545;
    background: linear-gradient(135deg, #fff5f5 0%, #ffffff 100%);
    animation: subtle-pulse 3s infinite;
}

@keyframes subtle-pulse {
    0%, 100% { box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05); }
    50% { box-shadow: 0 4px 20px rgba(220, 53, 69, 0.2); }
}

.task-content {
    flex: 1;
    margin-right: 1.5rem;
}

.task-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 1rem;
}

.task-title {
    font-size: 1.3rem;
    font-weight: 600;
    color: #333;
    margin: 0;
    flex: 1;
    margin-right: 1rem;
}

.task-badges {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
}

.task-badges span {
    padding: 0.25rem 0.75rem;
    border-radius: 12px;
    font-size: 0.8rem;
    font-weight: 600;
    text-transform: uppercase;
}

.badge-urgent {
    background-color: #f8d7da;
    color: #721c24;
}

.badge-high {
    background-color: #ffeaa7;
    color: #856404;
}

.badge-medium {
    background-color: #fff3cd;
    color: #856404;
}

.badge-low {
    background-color: #d4edda;
    color: #155724;
}

.badge-category {
    background-color: #e2e3e5;
    color: #495057;
}

.badge-status {
    background-color: #d1ecf1;
    color: #0c5460;
}

.task-description {
    color: #6c757d;
    margin: 1rem 0;
    line-height: 1.6;
}

.task-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin: 1rem 0;
}

.tag {
    background-color: #f8f9fa;
    color: #495057;
    padding: 0.25rem 0.5rem;
    border-radius: 8px;
    font-size: 0.8rem;
    border: 1px solid #dee2e6;
}

.task-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    margin-top: 1rem;
}

.task-meta small {
    color: #6c757d;
    font-size: 0.85rem;
}

.overdue-text {
    color: #dc3545 !important;
    font-weight: 600;
}

.task-actions {
    display: flex;
    gap: 0.5rem;
    flex-shrink: 0;
}

/* Empty State */
.empty-state {
    text-align: center;
    padding: 4rem 2rem;
    color: #6c757d;
}

.empty-state p {
    font-size: 1.3rem;
    margin-bottom: 0.5rem;
    font-weight: 500;
}

.empty-state small {
    font-size: 1rem;
    opacity: 0.8;
}

/* Modal */
.modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 2000;
}

.modal-content {
    background: white;
    border-radius: 12px;
    width: 90%;
    max-width: 500px;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem;
    border-bottom: 1px solid #e9ecef;
}

.modal-header h3 {
    margin: 0;
    color: #495057;
}

.modal-close {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: #6c757d;
    padding: 0.5rem;
}

.modal-close:hover {
    color: #495057;
}

.modal-form {
    padding: 1.5rem;
}

.modal-actions {
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
    margin-top: 2rem;
}

/* Footer */
.app-footer {
    background-color: #f8f9fa;
    padding: 2rem;
    text-align: center;
    color: #6c757d;
    border-top: 1px solid #e9ecef;
}

.app-footer p {
    margin: 0.5rem 0;
}

/* Responsive Design */
@media (max-width: 768px) {
    .app-container {
        margin: 0;
        border-radius: 0;
    }
    
    .main-content {
        padding: 1rem;
    }
    
    section {
        padding: 1.5rem;
        margin-bottom: 2rem;
    }
    
    .form-row {
        grid-template-columns: 1fr;
    }
    
    .stats-container {
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    }
    
    .task-item {
        flex-direction: column;
        gap: 1rem;
    }
    
    .task-content {
        margin-right: 0;
    }
    
    .task-actions {
        align-self: stretch;
        justify-content: center;
    }
    
    .tasks-header {
        flex-direction: column;
        gap: 1rem;
        align-items: stretch;
    }
    
    .search-controls {
        flex-direction: column;
    }
    
    .login-section {
        flex-direction: column;
    }
    
    .quick-actions {
        flex-direction: column;
    }
}

@media (max-width: 480px) {
    .header-content h1 {
        font-size: 2rem;
    }
    
    .filter-buttons {
        justify-content: center;
    }
    
    .task-badges {
        justify-content: flex-start;
    }
    
    .modal-content {
        width: 95%;
        margin: 1rem;
    }
}
```

### Step 10: Update Main Application File

Sekarang kita update file utama yang menggabungkan semua komponen.

**File**: `src/app.js` (update file yang sudah ada)

Replace seluruh content file `src/app.js` dengan:

```javascript
/**
 * Day 2 Main Application - MVC Implementation
 * 
 * Orchestrates semua komponen:
 * - Storage Manager
 * - Repositories
 * - Controllers
 * - Views
 * - User Authentication
 */

// Global application state
let app = {
    storage: null,
    userRepository: null,
    taskRepository: null,
    userController: null,
    taskController: null,
    taskView: null,
    currentUser: null
};

/**
 * Initialize aplikasi
 */
function initializeApp() {
    console.log('🚀 Initializing Day 2 Task Management System...');
    
    try {
        // Initialize storage manager
        app.storage = new EnhancedStorageManager('taskAppDay2', '2.0');
        console.log('✅ Storage manager initialized');
        
        // Initialize repositories
        app.userRepository = new UserRepository(app.storage);
        app.taskRepository = new TaskRepository(app.storage);
        console.log('✅ Repositories initialized');
        
        // Initialize controllers
        app.userController = new UserController(app.userRepository);
        app.taskController = new TaskController(app.taskRepository, app.userRepository);
        console.log('✅ Controllers initialized');
        
        // Initialize view
        app.taskView = new TaskView(app.taskController, app.userController);
        console.log('✅ Views initialized');
        
        // Setup authentication event listeners
        setupAuthEventListeners();
        
        // Create demo user jika belum ada
        createDemoUserIfNeeded();
        
        // Show login section
        showLoginSection();
        
        console.log('✅ Day 2 Application initialized successfully!');
        
    } catch (error) {
        console.error('❌ Failed to initialize application:', error);
        showMessage('Gagal menginisialisasi aplikasi: ' + error.message, 'error');
    }
}

/**
 * Setup authentication event listeners
 */
function setupAuthEventListeners() {
    // Login button
    const loginBtn = document.getElementById('loginBtn');
    if (loginBtn) {
        loginBtn.addEventListener('click', handleLogin);
    }
    
    // Register button
    const registerBtn = document.getElementById('registerBtn');
    if (registerBtn) {
        registerBtn.addEventListener('click', showRegisterModal);
    }
    
    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    // Username input (Enter key)
    const usernameInput = document.getElementById('usernameInput');
    if (usernameInput) {
        usernameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleLogin();
            }
        });
    }
    
    // Register form
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
    
    // Register modal close
    const closeRegisterModal = document.getElementById('closeRegisterModal');
    const cancelRegister = document.getElementById('cancelRegister');
    if (closeRegisterModal) {
        closeRegisterModal.addEventListener('click', hideRegisterModal);
    }
    if (cancelRegister) {
        cancelRegister.addEventListener('click', hideRegisterModal);
    }
    
    // Quick action buttons
    const showOverdueBtn = document.getElementById('showOverdueBtn');
    const showDueSoonBtn = document.getElementById('showDueSoonBtn');
    const exportDataBtn = document.getElementById('exportDataBtn');
    const refreshTasks = document.getElementById('refreshTasks');
    
    if (showOverdueBtn) {
        showOverdueBtn.addEventListener('click', showOverdueTasks);
    }
    if (showDueSoonBtn) {
        showDueSoonBtn.addEventListener('click', showDueSoonTasks);
    }
    if (exportDataBtn) {
        exportDataBtn.addEventListener('click', exportAppData);
    }
    if (refreshTasks) {
        refreshTasks.addEventListener('click', () => app.taskView.refresh());
    }
}

/**
 * Handle user login
 */
function handleLogin() {
    const usernameInput = document.getElementById('usernameInput');
    const username = usernameInput.value.trim();
    
    if (!username) {
        showMessage('Username wajib diisi', 'error');
        return;
    }
    
    const response = app.userController.login(username);
    
    if (response.success) {
        app.currentUser = response.data;
        
        // Set current user di task controller
        app.taskController.setCurrentUser(app.currentUser.id);
        
        // Show main content
        showMainContent();
        
        // Load user list untuk assign dropdown
        loadUserListForAssign();
        
        // Refresh views
        app.taskView.refresh();
        
        showMessage(response.message, 'success');
    } else {
        showMessage(response.error, 'error');
    }
}

/**
 * Handle user logout
 */
function handleLogout() {
    const response = app.userController.logout();
    
    app.currentUser = null;
    
    // Hide main content
    hideMainContent();
    
    // Show login section
    showLoginSection();
    
    showMessage(response.message, 'info');
}

/**
 * Show register modal
 */
function showRegisterModal() {
    const modal = document.getElementById('registerModal');
    if (modal) {
        modal.style.display = 'flex';
    }
}

/**
 * Hide register modal
 */
function hideRegisterModal() {
    const modal = document.getElementById('registerModal');
    if (modal) {
        modal.style.display = 'none';
    }
    
    // Reset form
    const form = document.getElementById('registerForm');
    if (form) {
        form.reset();
    }
}

/**
 * Handle user registration
 */
function handleRegister(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const userData = {
        username: formData.get('username')?.trim(),
        email: formData.get('email')?.trim(),
        fullName: formData.get('fullName')?.trim()
    };
    
    const response = app.userController.register(userData);
    
    if (response.success) {
        hideRegisterModal();
        showMessage(response.message, 'success');
        
        // Auto-fill username untuk login
        const usernameInput = document.getElementById('usernameInput');
        if (usernameInput) {
            usernameInput.value = userData.username;
        }
    } else {
        showMessage(response.error, 'error');
    }
}

/**
 * Show login section
 */
function showLoginSection() {
    const loginSection = document.getElementById('loginSection');
    const userInfo = document.getElementById('userInfo');
    const mainContent = document.getElementById('mainContent');
    
    if (loginSection) loginSection.style.display = 'flex';
    if (userInfo) userInfo.style.display = 'none';
    if (mainContent) mainContent.style.display = 'none';
    
    // Clear username input
    const usernameInput = document.getElementById('usernameInput');
    if (usernameInput) {
        usernameInput.value = '';
        usernameInput.focus();
    }
}

/**
 * Show main content
 */
function showMainContent() {
    const loginSection = document.getElementById('loginSection');
    const userInfo = document.getElementById('userInfo');
    const mainContent = document.getElementById('mainContent');
    const welcomeMessage = document.getElementById('welcomeMessage');
    
    if (loginSection) loginSection.style.display = 'none';
    if (userInfo) userInfo.style.display = 'flex';
    if (mainContent) mainContent.style.display = 'block';
    
    if (welcomeMessage && app.currentUser) {
        welcomeMessage.textContent = `Selamat datang, ${app.currentUser.fullName || app.currentUser.username}!`;
    }
}

/**
 * Hide main content
 */
function hideMainContent() {
    const mainContent = document.getElementById('mainContent');
    if (mainContent) {
        mainContent.style.display = 'none';
    }
}

/**
 * Load user list untuk assign dropdown
 */
function loadUserListForAssign() {
    const response = app.userController.getAllUsers();
    
    if (response.success) {
        const assigneeSelect = document.getElementById('taskAssignee');
        if (assigneeSelect) {
            // Clear existing options except "self"
            assigneeSelect.innerHTML = '<option value="self">Diri Sendiri</option>';
            
            // Add other users
            response.data.forEach(user => {
                if (user.id !== app.currentUser.id) {
                    const option = document.createElement('option');
                    option.value = user.id;
                    option.textContent = user.fullName || user.username;
                    assigneeSelect.appendChild(option);
                }
            });
        }
    }
}

/**
 * Show overdue tasks
 */
function showOverdueTasks() {
    const response = app.taskController.getOverdueTasks();
    
    if (response.success) {
        if (response.count === 0) {
            showMessage('Tidak ada task yang overdue', 'info');
        } else {
            showMessage(`Ditemukan ${response.count} task yang overdue`, 'warning');
            // Filter view untuk menampilkan overdue tasks
            // Implementasi ini bisa diperbaiki dengan menambah filter khusus
        }
    } else {
        showMessage(response.error, 'error');
    }
}

/**
 * Show tasks due soon
 */
function showDueSoonTasks() {
    const response = app.taskController.getTasksDueSoon(3);
    
    if (response.success) {
        if (response.count === 0) {
            showMessage('Tidak ada task yang akan due dalam 3 hari', 'info');
        } else {
            showMessage(`Ditemukan ${response.count} task yang akan due dalam 3 hari`, 'warning');
        }
    } else {
        showMessage(response.error, 'error');
    }
}

/**
 * Export app data
 */
function exportAppData() {
    const exportData = app.storage.exportData();
    
    if (exportData) {
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `task-app-backup-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        showMessage('Data berhasil diekspor', 'success');
    } else {
        showMessage('Gagal mengekspor data', 'error');
    }
}

/**
 * Create demo user jika belum ada
 */
function createDemoUserIfNeeded() {
    const users = app.userRepository.findAll();
    
    if (users.length === 0) {
        try {
            // Buat demo user
            app.userRepository.create({
                username: 'demo',
                email: 'demo@example.com',
                fullName: 'Demo User'
            });
            
            app.userRepository.create({
                username: 'john',
                email: 'john@example.com',
                fullName: 'John Doe'
            });
            
            console.log('✅ Demo users created');
        } catch (error) {
            console.error('Failed to create demo users:', error);
        }
    }
}

/**
 * Show message to user
 */
function showMessage(message, type = 'info') {
    if (app.taskView) {
        app.taskView.showMessage(message, type);
    } else {
        console.log(`${type.toUpperCase()}: ${message}`);
    }
}

/**
 * Handle errors globally
 */
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
    showMessage('Terjadi kesalahan pada aplikasi', 'error');
});

/**
 * Handle unhandled promise rejections
 */
window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    showMessage('Terjadi kesalahan pada aplikasi', 'error');
});

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', initializeApp);

// Export untuk testing (jika diperlukan)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initializeApp,
        handleLogin,
        handleLogout,
        handleRegister,
        app
    };
}
```

## 🎯 Implementation Checklist

Pastikan Anda sudah menyelesaikan semua langkah berikut:

### ✅ Step 1: Requirements Analysis
- [ ] Buat file `requirements.md` dengan user stories
- [ ] Pahami perbedaan functional vs non-functional requirements
- [ ] Identifikasi fitur-fitur baru untuk Day 2

### ✅ Step 2: Models
- [ ] Buat `src/models/User.js` dengan encapsulation yang benar
- [ ] Buat `src/models/EnhancedTask.js` dengan fitur tambahan
- [ ] Test model dengan membuat instance dan memanggil methods

### ✅ Step 3: Repository Pattern
- [ ] Buat `src/repositories/UserRepository.js` dengan CRUD operations
- [ ] Buat `src/repositories/TaskRepository.js` dengan query methods
- [ ] Pahami konsep abstraksi data access

### ✅ Step 4: Controller Layer
- [ ] Buat `src/controllers/UserController.js` untuk user management
- [ ] Buat `src/controllers/TaskController.js` untuk task operations
- [ ] Implementasi permission checking dan error handling

### ✅ Step 5: Enhanced Storage
- [ ] Buat `src/utils/EnhancedStorageManager.js` dengan multi-entity support
- [ ] Implementasi versioning dan metadata tracking

### ✅ Step 6: View Layer
- [ ] Buat `src/views/TaskView.js` untuk UI management
- [ ] Implementasi DOM manipulation dan event handling

### ✅ Step 7: UI Updates
- [ ] Update `public/index.html` dengan enhanced UI
- [ ] Update `public/styles.css` dengan responsive design

### ✅ Step 8: Main Application
- [ ] Update `src/app.js` untuk orchestration
- [ ] Implementasi authentication flow
- [ ] Setup global error handling

## 🚀 Cara Menjalankan

### Development Server
```bash
# Dari root project folder
npm start
```

Aplikasi akan berjalan di `http://localhost:3000`

### File Structure yang Dihasilkan
```
project/
├── package.json                       # Dependencies
├── server.js                          # Express server
├── requirements.md                    # User stories
├── src/
│   ├── models/
│   │   ├── User.js                    # User model
│   │   └── EnhancedTask.js            # Enhanced task model
│   ├── repositories/
│   │   ├── UserRepository.js          # User data access
│   │   └── TaskRepository.js          # Task data access
│   ├── controllers/
│   │   ├── UserController.js          # User operations
│   │   └── TaskController.js          # Task operations
│   ├── views/
│   │   └── TaskView.js                # UI management
│   ├── utils/
│   │   └── EnhancedStorageManager.js  # Storage management
│   └── app.js                         # Main application
└── public/
    ├── index.html                     # Enhanced UI
    └── styles.css                     # Responsive styles
```

## 🧪 Testing Your Implementation

### 1. Menjalankan Aplikasi
Day 2 menggunakan server setup yang sama dengan Day 1:

```bash
# Di terminal, dari root project folder
npm start
```

Aplikasi akan berjalan di `http://localhost:3000`

### 2. Basic Functionality Test
1. Buka browser ke `http://localhost:3000`
2. Register user baru atau login dengan `demo`
3. Buat task dengan berbagai kategori dan prioritas
4. Test filter dan search functionality
5. Test toggle status dan delete task

### 3. Advanced Features Test
1. Buat task dengan due date dan assign ke user lain
2. Test overdue detection
3. Test export data functionality
4. Test responsive design di mobile

### 4. Error Handling Test
1. Coba login dengan username yang tidak ada
2. Coba buat task tanpa judul
3. Coba assign task ke user yang tidak ada

## 🚨 Common Issues dan Solutions

### Issue: "User is not defined"
**Solution**: Pastikan script loading order benar di HTML. User.js harus dimuat sebelum UserRepository.js

### Issue: "Cannot read property of undefined"
**Solution**: Pastikan semua DOM elements sudah ada sebelum JavaScript dijalankan

### Issue: Tasks tidak persist setelah refresh
**Solution**: Check browser console untuk localStorage errors

### Issue: Filter tidak bekerja
**Solution**: Pastikan event listeners sudah di-setup dengan benar di TaskView

### Issue: CSS tidak ter-load
**Solution**: Pastikan path CSS benar dan file ada di lokasi yang tepat

## 🎓 Konsep yang Dipelajari

### 1. **MVC Pattern**
- **Model**: User.js, EnhancedTask.js (data dan business logic)
- **View**: TaskView.js, HTML (presentation layer)
- **Controller**: UserController.js, TaskController.js (coordination layer)

### 2. **Repository Pattern**
- Abstraksi untuk data access
- Memisahkan business logic dari storage logic
- Mudah untuk testing dan switching storage

### 3. **Separation of Concerns**
- Setiap class punya tanggung jawab yang jelas
- Changes di satu layer tidak affect layer lain
- Code lebih maintainable dan testable

### 4. **Error Handling**
- Graceful error handling di setiap layer
- User-friendly error messages
- Global error handling untuk unexpected errors

### 5. **Event-Driven Architecture**
- Loose coupling between components
- Components communicate through events
- Easy to extend and modify

## 🚀 Next Steps

Setelah menyelesaikan Day 2, Anda siap untuk:
- **Day 3**: Testing strategies (unit, integration, property-based testing)
- **Day 4**: Version control dan collaboration workflows
- **Day 5**: Deployment dan production best practices

Selamat! Anda telah berhasil mengimplementasikan arsitektur MVC yang solid dengan Repository pattern. Sistem ini jauh lebih maintainable dan scalable dibandingkan Day 1.