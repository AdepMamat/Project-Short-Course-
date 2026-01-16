# Day 3 Implementation Guide: Testing & Quality Assurance (Step-by-Step)

## 🚨 **PENTING - BACA DULU!**

### **Khusus untuk Mahasiswa Semester 1:**
Jika ini adalah pertama kali Anda coding atau testing:
- ✅ **JANGAN PANIK** jika ada error - ini normal!
- ✅ **IKUTI STEP DEMI STEP** - jangan skip checkpoint
- ✅ **BACA ERROR MESSAGE** dengan teliti - Jest error sangat informatif
- ✅ **TANYA JIKA STUCK** - lebih baik tanya daripada stuck lama

### **Setup yang Diperlukan:**
Pastikan Anda sudah menyelesaikan Day 1 dan Day 2, dan project Anda berjalan dengan:
- ✅ `npm start` berfungsi (server berjalan di http://localhost:3000)
- ✅ File dari Day 2 sudah ada (User.js, EnhancedTask.js, repositories, controllers)
- ✅ Aplikasi bisa create, read, update, delete tasks

**Jika ada masalah dengan setup Day 2**, silakan perbaiki dulu sebelum lanjut ke testing.

---

## 🎯 Tujuan Pembelajaran

Setelah menyelesaikan Day 3, Anda akan:
- Memahami pentingnya testing dalam software development
- Bisa setup Jest testing framework
- Menulis unit tests untuk models dan services
- Memahami konsep Test-Driven Development (TDD)
- Menggunakan npm test untuk menjalankan automated tests

## 📚 Konsep Dasar yang Perlu Dipahami

### 1. Apa itu Testing?
**Analogi sederhana**: Seperti quality control di pabrik
- Sebelum produk dijual, harus dicek dulu apakah berfungsi dengan baik
- Testing memastikan kode kita bekerja sesuai ekspektasi
- Mencegah bug sampai ke user

**Dalam aplikasi kita**:
- Test memastikan Task bisa dibuat dengan benar
- Test memastikan User bisa login
- Test memastikan data tersimpan dengan benar

### 2. Jenis-jenis Testing
**Unit Testing**: Test komponen individual
- Test satu function/class secara terpisah
- Cepat dan mudah di-debug
- Contoh: Test apakah Task.updateTitle() bekerja

**Integration Testing**: Test interaksi antar komponen
- Test bagaimana TaskController bekerja dengan TaskRepository
- Lebih lambat tapi lebih comprehensive

### 3. Mengapa Testing Penting?
- **Confidence**: Yakin kode kita bekerja
- **Regression Prevention**: Cegah bug lama muncul lagi
- **Documentation**: Test menunjukkan cara pakai kode

## 🔍 **Step 0: Validasi File Structure (WAJIB!)**

**PENTING**: Sebelum mulai testing, pastikan semua file dari Day 2 sudah ada dan benar!

### Cek File Structure Anda:

```
src/
├── models/
│   ├── User.js ✅ (harus ada)
│   └── EnhancedTask.js ✅ (harus ada)
├── repositories/
│   ├── UserRepository.js ✅ (harus ada)
│   └── TaskRepository.js ✅ (harus ada)
├── controllers/
│   └── TaskController.js ✅ (harus ada)
└── app.js ✅ (harus ada)
```

### **CRITICAL: Cek Import Statements!**

**Masalah yang sering terjadi**: Repository files tidak mengimport Model classes, menyebabkan error "ReferenceError: User is not defined"

**Solusi**: Pastikan file-file berikut memiliki import statements yang benar:

#### 1. Cek `src/repositories/UserRepository.js`
**Baris pertama harus ada**:
```javascript
const User = require('../models/User');

/**
 * User Repository - Mengelola penyimpanan dan pengambilan data User
 * ... (komentar lainnya)
 */
class UserRepository {
    // ... kode lainnya
}
```

#### 2. Cek `src/repositories/TaskRepository.js`
**Baris pertama harus ada**:
```javascript
const EnhancedTask = require('../models/EnhancedTask');

/**
 * Task Repository - Mengelola penyimpanan dan pengambilan data Task
 * ... (komentar lainnya)
 */
class TaskRepository {
    // ... kode lainnya
}
```

### **Jika Import Statements Tidak Ada:**

**Tambahkan di UserRepository.js** (baris paling atas):
```javascript
const User = require('../models/User');
```

**Tambahkan di TaskRepository.js** (baris paling atas):
```javascript
const EnhancedTask = require('../models/EnhancedTask');
```

### **Test Validasi Cepat:**
Jalankan aplikasi untuk memastikan tidak ada error:
```bash
npm start
```

Jika ada error seperti "User is not defined" atau "EnhancedTask is not defined", berarti import statements belum ditambahkan!
- **Refactoring Safety**: Bisa ubah kode tanpa takut rusak
## 🚀 Langkah-Langkah Implementasi

### Step 1: Setup Jest Testing Framework

Jest sudah terinstall di project kita (cek di package.json). Sekarang kita setup konfigurasi testing.

**File**: `jest.config.js` (buat file baru di root project)

```javascript
module.exports = {
    // Environment untuk testing (browser-like)
    testEnvironment: 'jsdom',
    
    // Pattern file test yang akan dijalankan
    testMatch: [
        '**/tests/**/*.test.js',
        '**/day3-testing/**/*.test.js'
    ],
    
    // Setup coverage (laporan seberapa banyak kode yang di-test)
    collectCoverage: true,
    coverageDirectory: 'coverage',
    coverageReporters: ['text', 'html'],
    
    // File mana saja yang akan di-cover
    collectCoverageFrom: [
        'src/**/*.js',
        '!src/**/*.test.js',
        '!**/node_modules/**'
    ],
    
    // Target coverage minimum
    coverageThreshold: {
        global: {
            branches: 70,
            functions: 80,
            lines: 80,
            statements: 80
        }
    },
    
    // Output yang detail untuk pembelajaran
    verbose: true,
    
    // Clear mocks antar test
    clearMocks: true
};
```

**Penjelasan konfigurasi**:
- `testEnvironment: 'jsdom'`: Simulasi browser environment
- `testMatch`: Pattern file test yang akan dijalankan
- `collectCoverage`: Generate laporan coverage
- `verbose: true`: Output detail saat running tests

### ✅ **CHECKPOINT 1: Validasi Jest Setup**

**Test Jest configuration**:
```bash
# Test apakah Jest bisa jalan
npm test -- --version
```

**Expected output**: Harus muncul versi Jest (contoh: "29.5.0")

**Jika error**: 
- Pastikan `jest.config.js` sudah dibuat
- Restart terminal
- Jalankan `npm install`

### Step 2: Buat Test Utilities (Helper Functions)

Sebelum menulis test, kita buat helper functions untuk mempermudah testing.

**File**: `tests/helpers/TestDataFactory.js` (buat folder dan file baru)

```javascript
/**
 * Test Data Factory - Helper untuk membuat test data
 * 
 * Kenapa perlu?
 * - Konsistensi: Semua test pakai data yang sama
 * - DRY: Tidak repeat kode yang sama
 * - Maintainability: Kalau format data berubah, cukup ubah di satu tempat
 */
class TestDataFactory {
    /**
     * Buat data user yang valid untuk testing
     */
    static createValidUserData(overrides = {}) {
        return {
            username: 'testuser',
            email: 'test@example.com',
            fullName: 'Test User',
            ...overrides
        };
    }
    
    /**
     * Buat data task yang valid untuk testing
     */
    static createValidTaskData(overrides = {}) {
        return {
            title: 'Test Task',
            description: 'Test Description',
            ownerId: 'user123',
            category: 'work',
            priority: 'medium',
            ...overrides
        };
    }
    
    /**
     * Buat multiple tasks untuk testing
     */
    static createMultipleTasks(count = 3, baseData = {}) {
        return Array.from({ length: count }, (_, i) => 
            this.createValidTaskData({
                title: `Task ${i + 1}`,
                priority: ['low', 'medium', 'high'][i % 3],
                ...baseData
            })
        );
    }
    
    /**
     * Buat mock storage untuk testing
     */
    static createMockStorage() {
        const storage = new Map();
        
        return {
            save: jest.fn((key, data) => {
                storage.set(key, JSON.stringify(data));
                return true;
            }),
            load: jest.fn((key, defaultValue = null) => {
                const data = storage.get(key);
                return data ? JSON.parse(data) : defaultValue;
            }),
            remove: jest.fn((key) => {
                storage.delete(key);
                return true;
            }),
            clear: jest.fn(() => {
                storage.clear();
                return true;
            })
        };
    }
}

module.exports = TestDataFactory;
```

**File**: `tests/helpers/TestAssertions.js` (buat file baru)

```javascript
/**
 * Test Assertions - Helper untuk assertions yang sering dipakai
 * 
 * Custom assertions untuk mempermudah testing dan membuat test lebih readable
 */
class TestAssertions {
    /**
     * Assert bahwa task memiliki properties yang diperlukan
     */
    static assertTaskHasRequiredProperties(task) {
        expect(task).toHaveProperty('id');
        expect(task).toHaveProperty('title');
        expect(task).toHaveProperty('ownerId');
        expect(task).toHaveProperty('createdAt');
        expect(task).toHaveProperty('status');
        expect(task).toHaveProperty('priority');
        expect(task).toHaveProperty('category');
    }
    
    /**
     * Assert bahwa user memiliki properties yang diperlukan
     */
    static assertUserHasRequiredProperties(user) {
        expect(user).toHaveProperty('id');
        expect(user).toHaveProperty('username');
        expect(user).toHaveProperty('email');
        expect(user).toHaveProperty('isActive');
        expect(user).toHaveProperty('createdAt');
    }
    
    /**
     * Assert response format dari controller
     * 
     * PENTING: Controller response bisa memiliki format berbeda:
     * - Create/Read/Update: {success: true, data: ...}
     * - Delete: {success: true, message: ...}
     * - Error: {success: false, error: ...}
     */
    static assertControllerResponse(response, shouldSucceed = true) {
        expect(response).toHaveProperty('success');
        expect(response.success).toBe(shouldSucceed);
        
        if (shouldSucceed) {
            // Success response bisa punya 'data' atau 'message'
            const hasData = response.hasOwnProperty('data');
            const hasMessage = response.hasOwnProperty('message');
            expect(hasData || hasMessage).toBe(true);
        } else {
            expect(response).toHaveProperty('error');
            expect(typeof response.error).toBe('string');
        }
    }
    
    /**
     * Assert bahwa error message sesuai ekspektasi
     */
    static assertErrorMessage(error, expectedMessage) {
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toContain(expectedMessage);
    }
    
    /**
     * Assert validation result
     */
    static assertValidationResult(result, shouldBeValid, expectedErrors = []) {
        expect(result.isValid).toBe(shouldBeValid);
        if (!shouldBeValid) {
            expectedErrors.forEach(error => {
                expect(result.errors).toContain(error);
            });
        }
    }
}

module.exports = TestAssertions;
```

### ✅ **CHECKPOINT 2: Validasi Test Utilities**

**Test apakah helper files bisa di-import**:
```bash
# Buat file test sederhana untuk validasi
echo "const TestDataFactory = require('./tests/helpers/TestDataFactory');
const TestAssertions = require('./tests/helpers/TestAssertions');
console.log('✅ Test utilities loaded successfully');" > test-helpers.js

# Jalankan test
node test-helpers.js

# Hapus file test
rm test-helpers.js
```

**Expected output**: "✅ Test utilities loaded successfully"

**Jika error**:
- Pastikan folder `tests/helpers/` sudah dibuat
- Pastikan kedua file sudah dibuat dengan benar
- Cek syntax error di file JavaScript

### Step 3: Test User Model (Unit Testing)

Sekarang kita mulai menulis test untuk User model. Ini adalah unit test karena kita test satu class secara terpisah.

**File**: `tests/models/User.test.js` (buat folder dan file baru)

```javascript
// Import dependencies
const TestDataFactory = require('../helpers/TestDataFactory');
const TestAssertions = require('../helpers/TestAssertions');

// Import class yang akan di-test
const User = require('../../src/models/User');

describe('User Model', () => {
    describe('User Creation', () => {
        test('should create user with valid data', () => {
            // Arrange (Persiapan)
            const userData = TestDataFactory.createValidUserData();
            
            // Act (Aksi yang di-test)
            const user = new User(userData.username, userData.email, userData.fullName);
            
            // Assert (Verifikasi hasil)
            expect(user.username).toBe(userData.username);
            expect(user.email).toBe(userData.email);
            expect(user.fullName).toBe(userData.fullName);
            expect(user.isActive).toBe(true);
            TestAssertions.assertUserHasRequiredProperties(user);
        });
        
        test('should throw error when username is empty', () => {
            // Arrange
            const userData = TestDataFactory.createValidUserData({ username: '' });
            
            // Act & Assert
            expect(() => {
                new User(userData.username, userData.email, userData.fullName);
            }).toThrow('Username wajib diisi');
        });
        
        test('should throw error when email is invalid', () => {
            // Arrange
            const userData = TestDataFactory.createValidUserData({ email: 'invalid-email' });
            
            // Act & Assert
            expect(() => {
                new User(userData.username, userData.email, userData.fullName);
            }).toThrow('Email tidak valid');
        });
        
        test('should generate unique ID for each user', () => {
            // Arrange
            const userData1 = TestDataFactory.createValidUserData({ username: 'user1' });
            const userData2 = TestDataFactory.createValidUserData({ username: 'user2' });
            
            // Act
            const user1 = new User(userData1.username, userData1.email, userData1.fullName);
            const user2 = new User(userData2.username, userData2.email, userData2.fullName);
            
            // Assert
            expect(user1.id).toBeDefined();
            expect(user2.id).toBeDefined();
            expect(user1.id).not.toBe(user2.id);
        });
    });
    
    describe('User Methods', () => {
        let user;
        
        beforeEach(() => {
            // Setup yang dijalankan sebelum setiap test
            const userData = TestDataFactory.createValidUserData();
            user = new User(userData.username, userData.email, userData.fullName);
        });
        
        test('should update profile successfully', () => {
            // Arrange
            const newFullName = 'Updated Name';
            const newEmail = 'updated@example.com';
            
            // Act
            user.updateProfile(newFullName, newEmail);
            
            // Assert
            expect(user.fullName).toBe(newFullName);
            expect(user.email).toBe(newEmail);
        });
        
        test('should record login time', () => {
            // Arrange
            const beforeLogin = new Date();
            
            // Act
            user.recordLogin();
            
            // Assert
            expect(user.lastLoginAt).toBeDefined();
            expect(user.lastLoginAt).toBeInstanceOf(Date);
            expect(user.lastLoginAt.getTime()).toBeGreaterThanOrEqual(beforeLogin.getTime());
        });
        
        test('should deactivate user', () => {
            // Act
            user.deactivate();
            
            // Assert
            expect(user.isActive).toBe(false);
        });
        
        test('should activate user', () => {
            // Arrange
            user.deactivate(); // First deactivate
            
            // Act
            user.activate();
            
            // Assert
            expect(user.isActive).toBe(true);
        });
    });
    
    describe('User Serialization', () => {
        test('should convert to JSON correctly', () => {
            // Arrange
            const userData = TestDataFactory.createValidUserData();
            const user = new User(userData.username, userData.email, userData.fullName);
            
            // Act
            const json = user.toJSON();
            
            // Assert
            expect(json).toHaveProperty('id', user.id);
            expect(json).toHaveProperty('username', user.username);
            expect(json).toHaveProperty('email', user.email);
            expect(json).toHaveProperty('fullName', user.fullName);
            expect(json).toHaveProperty('isActive', user.isActive);
            expect(json).toHaveProperty('createdAt');
        });
        
        test('should create user from JSON correctly', () => {
            // Arrange
            const originalUser = new User('testuser', 'test@example.com', 'Test User');
            const json = originalUser.toJSON();
            
            // Act
            const restoredUser = User.fromJSON(json);
            
            // Assert
            expect(restoredUser.id).toBe(originalUser.id);
            expect(restoredUser.username).toBe(originalUser.username);
            expect(restoredUser.email).toBe(originalUser.email);
            expect(restoredUser.fullName).toBe(originalUser.fullName);
            expect(restoredUser.isActive).toBe(originalUser.isActive);
        });
    });
});
```

### ✅ **CHECKPOINT 3: Validasi User Model Tests**

**Test User model secara terpisah**:
```bash
npm test tests/models/User.test.js
```

**Expected output**:
```
PASS tests/models/User.test.js
  User Model
    User Creation
      ✓ should create user with valid data
      ✓ should throw error when username is empty
      ✓ should throw error when email is invalid
      ✓ should generate unique ID for each user
    User Methods
      ✓ should update profile successfully
      ✓ should record login time
      ✓ should deactivate user
      ✓ should activate user
    User Serialization
      ✓ should convert to JSON correctly
      ✓ should create user from JSON correctly

Test Suites: 1 passed, 1 total
Tests:       10 passed, 10 total
```

**Jika ada failed tests**:
1. Baca error message dengan teliti
2. Pastikan `src/models/User.js` ada dan benar
3. Cek apakah ada syntax error di User.js
4. Pastikan TestDataFactory dan TestAssertions sudah benar

### Step 4: Test Enhanced Task Model

Sekarang kita test EnhancedTask model yang lebih kompleks dari Day 2.

**File**: `tests/models/EnhancedTask.test.js` (buat file baru)

```javascript
const TestDataFactory = require('../helpers/TestDataFactory');
const TestAssertions = require('../helpers/TestAssertions');
const EnhancedTask = require('../../src/models/EnhancedTask');

describe('EnhancedTask Model', () => {
    describe('Task Creation', () => {
        test('should create task with required properties', () => {
            // Arrange
            const taskData = TestDataFactory.createValidTaskData();
            
            // Act
            const task = new EnhancedTask(
                taskData.title, 
                taskData.description, 
                taskData.ownerId,
                { 
                    category: taskData.category,
                    priority: taskData.priority 
                }
            );
            
            // Assert
            expect(task.title).toBe(taskData.title);
            expect(task.description).toBe(taskData.description);
            expect(task.ownerId).toBe(taskData.ownerId);
            expect(task.category).toBe(taskData.category);
            expect(task.priority).toBe(taskData.priority);
            TestAssertions.assertTaskHasRequiredProperties(task);
        });
        
        test('should throw error when title is empty', () => {
            // Arrange
            const taskData = TestDataFactory.createValidTaskData({ title: '' });
            
            // Act & Assert
            expect(() => {
                new EnhancedTask(taskData.title, taskData.description, taskData.ownerId);
            }).toThrow('Judul task wajib diisi');
        });
        
        test('should throw error when ownerId is missing', () => {
            // Arrange
            const taskData = TestDataFactory.createValidTaskData();
            
            // Act & Assert
            expect(() => {
                new EnhancedTask(taskData.title, taskData.description, null);
            }).toThrow('Owner ID wajib diisi');
        });
        
        test('should set default values correctly', () => {
            // Arrange
            const taskData = TestDataFactory.createValidTaskData();
            
            // Act
            const task = new EnhancedTask(taskData.title, taskData.description, taskData.ownerId);
            
            // Assert
            expect(task.category).toBe('personal'); // default category
            expect(task.priority).toBe('medium'); // default priority
            expect(task.status).toBe('pending'); // default status
            expect(task.assigneeId).toBe(taskData.ownerId); // default assigned to owner
        });
    });
    
    describe('Task Properties and Computed Values', () => {
        let task;
        
        beforeEach(() => {
            const taskData = TestDataFactory.createValidTaskData();
            task = new EnhancedTask(taskData.title, taskData.description, taskData.ownerId);
        });
        
        test('should calculate isCompleted correctly', () => {
            // Initially not completed
            expect(task.isCompleted).toBe(false);
            
            // After marking as completed
            task.updateStatus('completed');
            expect(task.isCompleted).toBe(true);
        });
        
        test('should calculate isOverdue correctly', () => {
            // Task without due date should not be overdue
            expect(task.isOverdue).toBe(false);
            
            // Task with future due date should not be overdue
            const futureDate = new Date();
            futureDate.setDate(futureDate.getDate() + 1);
            task.setDueDate(futureDate);
            expect(task.isOverdue).toBe(false);
            
            // Task with past due date should be overdue
            const pastDate = new Date();
            pastDate.setDate(pastDate.getDate() - 1);
            task.setDueDate(pastDate);
            expect(task.isOverdue).toBe(true);
            
            // Completed task should not be overdue even if past due date
            task.updateStatus('completed');
            expect(task.isOverdue).toBe(false);
        });
        
        test('should calculate daysUntilDue correctly', () => {
            // Task without due date
            expect(task.daysUntilDue).toBeNull();
            
            // Task due tomorrow
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            task.setDueDate(tomorrow);
            expect(task.daysUntilDue).toBe(1);
            
            // Task due yesterday
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            task.setDueDate(yesterday);
            expect(task.daysUntilDue).toBe(-1);
        });
    });
    
    describe('Task Updates', () => {
        let task;
        
        beforeEach(() => {
            const taskData = TestDataFactory.createValidTaskData();
            task = new EnhancedTask(taskData.title, taskData.description, taskData.ownerId);
        });
        
        test('should update title successfully', () => {
            // Arrange
            const newTitle = 'Updated Task Title';
            const oldUpdatedAt = task.updatedAt;
            
            // Act
            task.updateTitle(newTitle);
            
            // Assert
            expect(task.title).toBe(newTitle);
            // Gunakan toBeGreaterThanOrEqual untuk menghindari timing issue
            expect(task.updatedAt.getTime()).toBeGreaterThanOrEqual(oldUpdatedAt.getTime());
        });
        
        test('should throw error when updating title to empty', () => {
            // Act & Assert
            expect(() => {
                task.updateTitle('');
            }).toThrow('Judul task tidak boleh kosong');
        });
        
        test('should update category successfully', () => {
            // Act
            task.updateCategory('study');
            
            // Assert
            expect(task.category).toBe('study');
        });
        
        test('should throw error for invalid category', () => {
            // Act & Assert
            expect(() => {
                task.updateCategory('invalid-category');
            }).toThrow('Kategori tidak valid');
        });
        
        test('should add and remove tags', () => {
            // Add tags
            task.addTag('urgent');
            task.addTag('important');
            expect(task.tags).toContain('urgent');
            expect(task.tags).toContain('important');
            expect(task.tags).toHaveLength(2);
            
            // Remove tag
            task.removeTag('urgent');
            expect(task.tags).not.toContain('urgent');
            expect(task.tags).toContain('important');
            expect(task.tags).toHaveLength(1);
        });
        
        test('should not add duplicate tags', () => {
            // Add same tag twice
            task.addTag('urgent');
            task.addTag('urgent');
            
            // Should only have one instance
            expect(task.tags.filter(tag => tag === 'urgent')).toHaveLength(1);
        });
    });
    
    describe('Task Serialization', () => {
        test('should serialize and deserialize correctly', () => {
            // Arrange
            const taskData = TestDataFactory.createValidTaskData();
            const originalTask = new EnhancedTask(
                taskData.title, 
                taskData.description, 
                taskData.ownerId,
                {
                    category: 'work',
                    priority: 'high',
                    dueDate: new Date('2024-12-31')
                }
            );
            
            // Add some additional data
            originalTask.addTag('important');
            originalTask.addNote('This is a test note');
            
            // Act
            const json = originalTask.toJSON();
            const restoredTask = EnhancedTask.fromJSON(json);
            
            // Assert
            expect(restoredTask.id).toBe(originalTask.id);
            expect(restoredTask.title).toBe(originalTask.title);
            expect(restoredTask.description).toBe(originalTask.description);
            expect(restoredTask.ownerId).toBe(originalTask.ownerId);
            expect(restoredTask.category).toBe(originalTask.category);
            expect(restoredTask.priority).toBe(originalTask.priority);
            expect(restoredTask.tags).toEqual(originalTask.tags);
            expect(restoredTask.notes).toEqual(originalTask.notes);
            expect(restoredTask.dueDate.getTime()).toBe(originalTask.dueDate.getTime());
        });
    });
});
```

### ✅ **CHECKPOINT 4: Validasi EnhancedTask Model Tests**

**Test EnhancedTask model secara terpisah**:
```bash
npm test tests/models/EnhancedTask.test.js
```

**Expected**: Semua 14 tests harus PASS

**Jika ada failed tests**:
1. Pastikan `src/models/EnhancedTask.js` ada dan benar
2. Cek timing issue pada timestamp tests
3. Pastikan TestDataFactory createValidTaskData() benar

### Step 5: Test Repository Layer

Repository layer mengelola penyimpanan data. Kita perlu test untuk memastikan data tersimpan dan diambil dengan benar.

**File**: `tests/repositories/UserRepository.test.js` (buat file baru)

```javascript
const TestDataFactory = require('../helpers/TestDataFactory');
const TestAssertions = require('../helpers/TestAssertions');
const UserRepository = require('../../src/repositories/UserRepository');
const User = require('../../src/models/User');

describe('UserRepository', () => {
    let userRepository;
    let mockStorage;
    
    beforeEach(() => {
        // Setup mock storage dan repository untuk setiap test
        mockStorage = TestDataFactory.createMockStorage();
        userRepository = new UserRepository(mockStorage);
    });
    
    describe('User Creation', () => {
        test('should create user successfully', () => {
            // Arrange
            const userData = TestDataFactory.createValidUserData();
            
            // Act
            const user = userRepository.create(userData);
            
            // Assert
            expect(user).toBeInstanceOf(User);
            expect(user.username).toBe(userData.username);
            expect(user.email).toBe(userData.email);
            TestAssertions.assertUserHasRequiredProperties(user);
            
            // Verify storage was called
            expect(mockStorage.save).toHaveBeenCalledWith('users', expect.any(Array));
        });
        
        test('should throw error for duplicate username', () => {
            // Arrange
            const userData = TestDataFactory.createValidUserData();
            userRepository.create(userData);
            
            // Act & Assert
            expect(() => {
                userRepository.create(userData); // Same username
            }).toThrow("Username 'testuser' sudah digunakan");
        });
        
        test('should throw error for duplicate email', () => {
            // Arrange
            const userData1 = TestDataFactory.createValidUserData();
            const userData2 = TestDataFactory.createValidUserData({ 
                username: 'different',
                email: userData1.email // Same email
            });
            
            userRepository.create(userData1);
            
            // Act & Assert
            expect(() => {
                userRepository.create(userData2);
            }).toThrow("Email 'test@example.com' sudah digunakan");
        });
    });
    
    describe('User Retrieval', () => {
        let testUser;
        
        beforeEach(() => {
            const userData = TestDataFactory.createValidUserData();
            testUser = userRepository.create(userData);
        });
        
        test('should find user by ID', () => {
            // Act
            const foundUser = userRepository.findById(testUser.id);
            
            // Assert
            expect(foundUser).toBeDefined();
            expect(foundUser.id).toBe(testUser.id);
            expect(foundUser.username).toBe(testUser.username);
        });
        
        test('should return null for non-existent ID', () => {
            // Act
            const foundUser = userRepository.findById('non-existent-id');
            
            // Assert
            expect(foundUser).toBeNull();
        });
        
        test('should find user by username', () => {
            // Act
            const foundUser = userRepository.findByUsername(testUser.username);
            
            // Assert
            expect(foundUser).toBeDefined();
            expect(foundUser.username).toBe(testUser.username);
        });
        
        test('should find user by email', () => {
            // Act
            const foundUser = userRepository.findByEmail(testUser.email);
            
            // Assert
            expect(foundUser).toBeDefined();
            expect(foundUser.email).toBe(testUser.email);
        });
        
        test('should return all users', () => {
            // Arrange - create additional users
            const userData2 = TestDataFactory.createValidUserData({
                username: 'user2',
                email: 'user2@example.com'
            });
            userRepository.create(userData2);
            
            // Act
            const allUsers = userRepository.findAll();
            
            // Assert
            expect(allUsers).toHaveLength(2);
            expect(allUsers.every(user => user instanceof User)).toBe(true);
        });
        
        test('should return only active users', () => {
            // Arrange - deactivate one user
            testUser.deactivate();
            userRepository.update(testUser.id, { isActive: false });
            
            const userData2 = TestDataFactory.createValidUserData({
                username: 'user2',
                email: 'user2@example.com'
            });
            userRepository.create(userData2);
            
            // Act
            const activeUsers = userRepository.findActive();
            
            // Assert
            expect(activeUsers).toHaveLength(1);
            expect(activeUsers[0].isActive).toBe(true);
        });
    });
    
    describe('User Updates', () => {
        let testUser;
        
        beforeEach(() => {
            const userData = TestDataFactory.createValidUserData();
            testUser = userRepository.create(userData);
        });
        
        test('should update user profile', () => {
            // Arrange
            const updates = {
                fullName: 'Updated Name',
                email: 'updated@example.com'
            };
            
            // Act
            const updatedUser = userRepository.update(testUser.id, updates);
            
            // Assert
            expect(updatedUser).toBeDefined();
            expect(updatedUser.fullName).toBe(updates.fullName);
            expect(updatedUser.email).toBe(updates.email);
            
            // Verify storage was called
            expect(mockStorage.save).toHaveBeenCalled();
        });
        
        test('should record login', () => {
            // Arrange
            const beforeLogin = new Date();
            
            // Act
            const updatedUser = userRepository.recordLogin(testUser.id);
            
            // Assert
            expect(updatedUser).toBeDefined();
            expect(updatedUser.lastLoginAt).toBeDefined();
            expect(updatedUser.lastLoginAt.getTime()).toBeGreaterThanOrEqual(beforeLogin.getTime());
        });
        
        test('should return null when updating non-existent user', () => {
            // Act
            const result = userRepository.update('non-existent-id', { fullName: 'Test' });
            
            // Assert
            expect(result).toBeNull();
        });
    });
    
    describe('User Search', () => {
        beforeEach(() => {
            // Create multiple users for search testing
            const users = [
                { username: 'john_doe', email: 'john@example.com', fullName: 'John Doe' },
                { username: 'jane_smith', email: 'jane@example.com', fullName: 'Jane Smith' },
                { username: 'bob_wilson', email: 'bob@example.com', fullName: 'Bob Wilson' }
            ];
            
            users.forEach(userData => userRepository.create(userData));
        });
        
        test('should search users by username', () => {
            // Act
            const results = userRepository.search('john');
            
            // Assert
            expect(results).toHaveLength(1);
            expect(results[0].username).toBe('john_doe');
        });
        
        test('should search users by email', () => {
            // Act
            const results = userRepository.search('jane@');
            
            // Assert
            expect(results).toHaveLength(1);
            expect(results[0].email).toBe('jane@example.com');
        });
        
        test('should search users by full name', () => {
            // Act
            const results = userRepository.search('wilson');
            
            // Assert
            expect(results).toHaveLength(1);
            expect(results[0].fullName).toBe('Bob Wilson');
        });
        
        test('should return empty array for no matches', () => {
            // Act
            const results = userRepository.search('nonexistent');
            
            // Assert
            expect(results).toHaveLength(0);
        });
    });
});
```

### ✅ **CHECKPOINT 5: Validasi Repository Tests**

**Test UserRepository secara terpisah**:
```bash
npm test tests/repositories/UserRepository.test.js
```

**Expected**: Semua 16 tests harus PASS

**Jika ada failed tests**:
1. **PALING SERING**: Pastikan `const User = require('../models/User');` ada di baris pertama UserRepository.js
2. Pastikan mock storage di-setup dengan benar
3. Cek apakah UserRepository.js ada dan benar

### Step 6: Test Controller Layer (Integration Testing)

Controller menggabungkan berbagai komponen, jadi ini adalah integration testing.

**File**: `tests/controllers/TaskController.test.js` (buat file baru)

```javascript
const TestDataFactory = require('../helpers/TestDataFactory');
const TestAssertions = require('../helpers/TestAssertions');
const TaskController = require('../../src/controllers/TaskController');
const TaskRepository = require('../../src/repositories/TaskRepository');
const UserRepository = require('../../src/repositories/UserRepository');

describe('TaskController', () => {
    let taskController;
    let taskRepository;
    let userRepository;
    let mockStorage;
    let testUser;
    
    beforeEach(() => {
        // Setup complete system untuk integration testing
        mockStorage = TestDataFactory.createMockStorage();
        taskRepository = new TaskRepository(mockStorage);
        userRepository = new UserRepository(mockStorage);
        taskController = new TaskController(taskRepository, userRepository);
        
        // Create test user dan set sebagai current user
        const userData = TestDataFactory.createValidUserData();
        testUser = userRepository.create(userData);
        taskController.setCurrentUser(testUser.id);
    });
    
    describe('Task Creation', () => {
        test('should create task successfully', () => {
            // Arrange
            const taskData = TestDataFactory.createValidTaskData();
            
            // Act
            const response = taskController.createTask(taskData);
            
            // Assert
            TestAssertions.assertControllerResponse(response, true);
            expect(response.data.title).toBe(taskData.title);
            expect(response.data.ownerId).toBe(testUser.id);
            expect(response.message).toContain('berhasil dibuat');
        });
        
        test('should fail when user not logged in', () => {
            // Arrange
            taskController.currentUser = null; // Simulate logout
            const taskData = TestDataFactory.createValidTaskData();
            
            // Act
            const response = taskController.createTask(taskData);
            
            // Assert
            TestAssertions.assertControllerResponse(response, false);
            expect(response.error).toBe('User harus login terlebih dahulu');
        });
        
        test('should fail when title is empty', () => {
            // Arrange
            const taskData = TestDataFactory.createValidTaskData({ title: '' });
            
            // Act
            const response = taskController.createTask(taskData);
            
            // Assert
            TestAssertions.assertControllerResponse(response, false);
            expect(response.error).toBe('Judul task wajib diisi');
        });
        
        test('should fail when assignee does not exist', () => {
            // Arrange
            const taskData = TestDataFactory.createValidTaskData({ 
                assigneeId: 'non-existent-user' 
            });
            
            // Act
            const response = taskController.createTask(taskData);
            
            // Assert
            TestAssertions.assertControllerResponse(response, false);
            expect(response.error).toBe('User yang di-assign tidak ditemukan');
        });
    });
    
    describe('Task Retrieval', () => {
        let testTask;
        
        beforeEach(() => {
            // Create test task
            const taskData = TestDataFactory.createValidTaskData();
            const createResponse = taskController.createTask(taskData);
            testTask = createResponse.data;
        });
        
        test('should get all user tasks', () => {
            // Act
            const response = taskController.getTasks();
            
            // Assert
            TestAssertions.assertControllerResponse(response, true);
            expect(response.data).toHaveLength(1);
            expect(response.data[0].id).toBe(testTask.id);
            expect(response.count).toBe(1);
        });
        
        test('should get task by ID', () => {
            // Act
            const response = taskController.getTask(testTask.id);
            
            // Assert
            TestAssertions.assertControllerResponse(response, true);
            expect(response.data.id).toBe(testTask.id);
            expect(response.data.title).toBe(testTask.title);
        });
        
        test('should fail to get non-existent task', () => {
            // Act
            const response = taskController.getTask('non-existent-id');
            
            // Assert
            TestAssertions.assertControllerResponse(response, false);
            expect(response.error).toBe('Task tidak ditemukan');
        });
        
        test('should filter tasks by status', () => {
            // Arrange - create completed task
            const completedTaskData = TestDataFactory.createValidTaskData({ 
                title: 'Completed Task' 
            });
            const completedResponse = taskController.createTask(completedTaskData);
            taskController.updateTask(completedResponse.data.id, { status: 'completed' });
            
            // Act
            const pendingResponse = taskController.getTasks({ status: 'pending' });
            const completedResponse2 = taskController.getTasks({ status: 'completed' });
            
            // Assert
            expect(pendingResponse.data).toHaveLength(1);
            expect(completedResponse2.data).toHaveLength(1);
            expect(pendingResponse.data[0].status).toBe('pending');
            expect(completedResponse2.data[0].status).toBe('completed');
        });
    });
    
    describe('Task Updates', () => {
        let testTask;
        
        beforeEach(() => {
            const taskData = TestDataFactory.createValidTaskData();
            const createResponse = taskController.createTask(taskData);
            testTask = createResponse.data;
        });
        
        test('should update task successfully', () => {
            // Arrange
            const updates = {
                title: 'Updated Title',
                priority: 'high',
                status: 'in-progress'
            };
            
            // Act
            const response = taskController.updateTask(testTask.id, updates);
            
            // Assert
            TestAssertions.assertControllerResponse(response, true);
            expect(response.data.title).toBe(updates.title);
            expect(response.data.priority).toBe(updates.priority);
            expect(response.data.status).toBe(updates.status);
        });
        
        test('should fail to update non-existent task', () => {
            // Act
            const response = taskController.updateTask('non-existent-id', { title: 'Test' });
            
            // Assert
            TestAssertions.assertControllerResponse(response, false);
            expect(response.error).toBe('Task tidak ditemukan');
        });
        
        test('should toggle task status', () => {
            // Initially pending
            expect(testTask.status).toBe('pending');
            
            // Toggle to completed
            const response1 = taskController.toggleTaskStatus(testTask.id);
            TestAssertions.assertControllerResponse(response1, true);
            expect(response1.data.status).toBe('completed');
            
            // Toggle back to pending
            const response2 = taskController.toggleTaskStatus(testTask.id);
            TestAssertions.assertControllerResponse(response2, true);
            expect(response2.data.status).toBe('pending');
        });
    });
    
    describe('Task Deletion', () => {
        let testTask;
        
        beforeEach(() => {
            const taskData = TestDataFactory.createValidTaskData();
            const createResponse = taskController.createTask(taskData);
            testTask = createResponse.data;
        });
        
        test('should delete task successfully', () => {
            // Act
            const response = taskController.deleteTask(testTask.id);
            
            // Assert
            TestAssertions.assertControllerResponse(response, true);
            expect(response.message).toContain('berhasil dihapus');
            
            // Verify task is deleted
            const getResponse = taskController.getTask(testTask.id);
            TestAssertions.assertControllerResponse(getResponse, false);
        });
        
        test('should fail to delete non-existent task', () => {
            // Act
            const response = taskController.deleteTask('non-existent-id');
            
            // Assert
            TestAssertions.assertControllerResponse(response, false);
            expect(response.error).toBe('Task tidak ditemukan');
        });
    });
    
    describe('Task Search and Statistics', () => {
        beforeEach(() => {
            // Create multiple tasks for testing
            const tasks = TestDataFactory.createMultipleTasks(3);
            tasks.forEach(taskData => taskController.createTask(taskData));
        });
        
        test('should search tasks', () => {
            // Act
            const response = taskController.searchTasks('Task 1');
            
            // Assert
            TestAssertions.assertControllerResponse(response, true);
            expect(response.data).toHaveLength(1);
            expect(response.data[0].title).toBe('Task 1');
            expect(response.query).toBe('Task 1');
        });
        
        test('should fail search with empty query', () => {
            // Act
            const response = taskController.searchTasks('');
            
            // Assert
            TestAssertions.assertControllerResponse(response, false);
            expect(response.error).toBe('Query pencarian tidak boleh kosong');
        });
        
        test('should get task statistics', () => {
            // Act
            const response = taskController.getTaskStats();
            
            // Assert
            TestAssertions.assertControllerResponse(response, true);
            expect(response.data).toHaveProperty('total');
            expect(response.data).toHaveProperty('byStatus');
            expect(response.data).toHaveProperty('byPriority');
            expect(response.data.total).toBe(3);
        });
    });
    
    describe('Permission Testing', () => {
        let otherUser;
        let otherUserTask;
        
        beforeEach(() => {
            // Create another user dan task
            const otherUserData = TestDataFactory.createValidUserData({
                username: 'otheruser',
                email: 'other@example.com'
            });
            otherUser = userRepository.create(otherUserData);
            
            // Create task as other user
            taskController.setCurrentUser(otherUser.id);
            const taskData = TestDataFactory.createValidTaskData();
            const createResponse = taskController.createTask(taskData);
            otherUserTask = createResponse.data;
            
            // Switch back to original user
            taskController.setCurrentUser(testUser.id);
        });
        
        test('should not allow access to other user task', () => {
            // Act
            const response = taskController.getTask(otherUserTask.id);
            
            // Assert
            TestAssertions.assertControllerResponse(response, false);
            expect(response.error).toBe('Anda tidak memiliki akses ke task ini');
        });
        
        test('should not allow updating other user task', () => {
            // Act
            const response = taskController.updateTask(otherUserTask.id, { title: 'Hacked' });
            
            // Assert
            TestAssertions.assertControllerResponse(response, false);
            expect(response.error).toBe('Hanya owner yang bisa mengubah task');
        });
        
        test('should not allow deleting other user task', () => {
            // Act
            const response = taskController.deleteTask(otherUserTask.id);
            
            // Assert
            TestAssertions.assertControllerResponse(response, false);
            expect(response.error).toBe('Hanya owner yang bisa menghapus task');
        });
    });
});
```

### ✅ **CHECKPOINT 6: Validasi Controller Tests**

**Test TaskController secara terpisah**:
```bash
npm test tests/controllers/TaskController.test.js
```

**Expected**: Semua 19 tests harus PASS

**Jika ada failed tests**:
1. Pastikan import statements di repository files sudah benar
2. Pastikan TestAssertions.assertControllerResponse sudah di-update
3. Cek apakah TaskController.js ada dan benar

### Step 7: Jalankan Tests dan Interpretasi Hasil

Sekarang kita jalankan tests yang sudah dibuat dan pelajari cara membaca hasilnya.

#### Menjalankan Tests

**Command dasar untuk menjalankan tests:**

```bash
# Jalankan semua tests
npm test

# Jalankan tests dengan coverage report
npm run test:coverage

# Jalankan tests dalam watch mode (otomatis re-run saat file berubah)
npm run test:watch

# Jalankan test file tertentu
npm test User.test.js

# Jalankan tests dengan pattern tertentu
npm test -- --testNamePattern="should create"
```

### ✅ **FINAL CHECKPOINT: Validasi Semua Tests**

**Jalankan semua tests sekaligus**:
```bash
npm test
```

**Expected output yang BENAR**:
```
Test Suites: 4 passed, 4 total
Tests:       59 passed, 59 total
Snapshots:   0 total
Time:        X.XXXs
```

**Coverage yang diharapkan**:
```
----------------------------|---------|----------|---------|---------|
File                        | % Stmts | % Branch | % Funcs | % Lines |
----------------------------|---------|----------|---------|---------|
All files                   |   25%+  |   25%+   |   30%+  |   25%+  |
 src/models                 |   65%+  |   60%+   |   60%+  |   65%+  |
  EnhancedTask.js           |   80%+  |   75%+   |   75%+  |   80%+  |
  User.js                   |   85%+  |   70%+   |   80%+  |   85%+  |
 src/repositories           |   55%+  |   45%+   |   55%+  |   55%+  |
  TaskRepository.js         |   50%+  |   40%+   |   50%+  |   50%+  |
  UserRepository.js         |   65%+  |   70%+   |   70%+  |   65%+  |
 src/controllers            |   40%+  |   40%+   |   35%+  |   40%+  |
  TaskController.js         |   65%+  |   65%+   |   70%+  |   65%+  |
----------------------------|---------|----------|---------|---------|
```

**🚨 JIKA ADA FAILED TESTS**:
1. **STOP** - jangan lanjut ke step berikutnya
2. Baca error message dengan teliti
3. Cek troubleshooting guide di bawah
4. Fix satu error dulu, baru test lagi
5. Ulangi sampai semua tests PASS

#### Membaca Output Test

**Contoh output sukses:**
```
PASS tests/models/User.test.js
  User Model
    User Creation
      ✓ should create user with valid data (5ms)
      ✓ should throw error when username is empty (2ms)
      ✓ should throw error when email is invalid (1ms)
    User Methods
      ✓ should update profile successfully (3ms)
      ✓ should record login time (2ms)

Test Suites: 1 passed, 1 total
Tests:       5 passed, 5 total
Snapshots:   0 total
Time:        2.345s
```

**Contoh output dengan error:**
```
FAIL tests/models/User.test.js
  User Model
    User Creation
      ✓ should create user with valid data (5ms)
      ✗ should throw error when username is empty (8ms)

  ● User Model › User Creation › should throw error when username is empty

    expect(received).toThrow(expected)

    Expected substring: "Username wajib diisi"
    Received function did not throw

      23 |             // Act & Assert
      24 |             expect(() => {
    > 25 |                 new User(userData.username, userData.email, userData.fullName);
         |                 ^
      26 |             }).toThrow('Username wajib diisi');
```

#### Membaca Coverage Report

Coverage report menunjukkan seberapa banyak kode yang di-test:

```
File                | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
--------------------|---------|----------|---------|---------|------------------
All files           |   85.71 |    83.33 |   88.89 |   85.71 |
 models/            |   90.00 |    85.00 |   95.00 |   90.00 |
  User.js           |   95.00 |    90.00 |  100.00 |   95.00 | 45-47
  EnhancedTask.js   |   85.00 |    80.00 |   90.00 |   85.00 | 123,145-150
 repositories/      |   80.00 |    75.00 |   85.00 |   80.00 |
  UserRepository.js |   80.00 |    75.00 |   85.00 |   80.00 | 89-95
```

**Penjelasan metrics:**
- **% Stmts**: Persentase statements yang dieksekusi
- **% Branch**: Persentase branches (if/else) yang ditest
- **% Funcs**: Persentase functions yang dipanggil
- **% Lines**: Persentase lines yang dieksekusi
- **Uncovered Line #s**: Nomor baris yang belum di-test

### Step 8: Debugging Tests yang Gagal

Ketika tests gagal, ikuti langkah-langkah ini untuk debugging:

#### 1. Baca Error Message dengan Teliti

```javascript
// Contoh test yang gagal
test('should create user with valid data', () => {
    const userData = { username: '', email: 'test@example.com' };
    const user = new User(userData.username, userData.email);
    
    expect(user.username).toBe('testuser'); // Ini akan gagal
});
```

**Error message:**
```
Expected: "testuser"
Received: ""
```

**Solusi**: Periksa data yang digunakan dalam test.

#### 2. Gunakan console.log untuk Debugging

```javascript
test('should create user with valid data', () => {
    const userData = TestDataFactory.createValidUserData();
    console.log('userData:', userData); // Debug data
    
    const user = new User(userData.username, userData.email, userData.fullName);
    console.log('created user:', user.toJSON()); // Debug hasil
    
    expect(user.username).toBe(userData.username);
});
```

#### 3. Isolasi Test yang Bermasalah

```bash
# Jalankan hanya satu test file
npm test User.test.js

# Jalankan hanya test dengan nama tertentu
npm test -- --testNamePattern="should create user"
```

#### 4. Periksa Setup dan Teardown

```javascript
describe('User Model', () => {
    let testData;
    
    beforeEach(() => {
        console.log('Setting up test data...'); // Debug setup
        testData = TestDataFactory.createValidUserData();
    });
    
    afterEach(() => {
        console.log('Cleaning up...'); // Debug cleanup
        testData = null;
    });
    
    test('should work correctly', () => {
        // Test implementation
    });
});
```

### Step 9: Best Practices untuk Testing

#### 1. Test Naming Convention

**Good:**
```javascript
test('should create user with valid data')
test('should throw error when username is empty')
test('should update task status from pending to completed')
```

**Bad:**
```javascript
test('user creation')
test('validation')
test('update test')
```

#### 2. AAA Pattern (Arrange-Act-Assert)

```javascript
test('should update user profile', () => {
    // Arrange - Setup data dan kondisi
    const userData = TestDataFactory.createValidUserData();
    const user = new User(userData.username, userData.email, userData.fullName);
    const newName = 'Updated Name';
    
    // Act - Lakukan aksi yang di-test
    user.updateProfile(newName, user.email);
    
    // Assert - Verifikasi hasil
    expect(user.fullName).toBe(newName);
});
```

#### 3. Test Independence

```javascript
// BAD - Tests bergantung satu sama lain
describe('User Tests', () => {
    let user;
    
    test('should create user', () => {
        user = new User('test', 'test@example.com'); // Set global variable
        expect(user).toBeDefined();
    });
    
    test('should update user', () => {
        user.updateProfile('New Name'); // Depends on previous test
        expect(user.fullName).toBe('New Name');
    });
});

// GOOD - Each test is independent
describe('User Tests', () => {
    test('should create user', () => {
        const user = new User('test', 'test@example.com');
        expect(user).toBeDefined();
    });
    
    test('should update user', () => {
        const user = new User('test', 'test@example.com');
        user.updateProfile('New Name');
        expect(user.fullName).toBe('New Name');
    });
});
```

#### 4. Test Edge Cases

```javascript
describe('Task Validation', () => {
    test('should handle empty title', () => {
        expect(() => new EnhancedTask('', 'desc', 'user1')).toThrow();
    });
    
    test('should handle very long title', () => {
        const longTitle = 'a'.repeat(1000);
        expect(() => new EnhancedTask(longTitle, 'desc', 'user1')).toThrow();
    });
    
    test('should handle null values', () => {
        expect(() => new EnhancedTask(null, 'desc', 'user1')).toThrow();
    });
    
    test('should handle special characters', () => {
        const specialTitle = '!@#$%^&*()_+{}|:"<>?';
        const task = new EnhancedTask(specialTitle, 'desc', 'user1');
        expect(task.title).toBe(specialTitle);
    });
});
```

### Step 10: Update HTML untuk Testing

Kita perlu update HTML untuk load file-file testing yang baru.

**File**: `public/index.html` (update bagian script loading)

```html
<!-- Load JavaScript modules in correct order -->
<script src="src/models/User.js"></script>
<script src="src/models/EnhancedTask.js"></script>
<script src="src/utils/StorageManager.js"></script>
<script src="src/repositories/UserRepository.js"></script>
<script src="src/repositories/TaskRepository.js"></script>
<script src="src/controllers/UserController.js"></script>
<script src="src/controllers/TaskController.js"></script>
<script src="src/app.js"></script>
```

**Penjelasan urutan loading**:
1. Models dulu (User, EnhancedTask)
2. Utilities (StorageManager)
3. Repositories (butuh Models dan StorageManager)
4. Controllers (butuh Repositories)
5. App.js terakhir (butuh semua komponen)

### Step 11: Verifikasi Setup dengan Test Run

Sekarang jalankan tests untuk memastikan semuanya bekerja:

```bash
# Test setup
npm test

# Jika ada error, jalankan satu per satu
npm test User.test.js
npm test EnhancedTask.test.js
npm test UserRepository.test.js
npm test TaskController.test.js
```

**Expected output jika sukses:**
```
PASS tests/models/User.test.js
PASS tests/models/EnhancedTask.test.js
PASS tests/repositories/UserRepository.test.js
PASS tests/controllers/TaskController.test.js

Test Suites: 4 passed, 4 total
Tests:       XX passed, XX total
Snapshots:   0 total
Time:        X.XXXs, estimated XXs
```

**Jika ada error**, periksa:
1. Apakah semua file sudah dibuat dengan benar?
2. Apakah path import sudah benar?
3. Apakah ada typo dalam kode?
4. Apakah jest.config.js sudah benar?
## 🔧 Troubleshooting Common Issues

### Issue 1: "Cannot find module" Error

**Error:**
```
Cannot find module '../../src/models/User'
```

**Solusi:**
1. Periksa path file apakah benar
2. Pastikan file User.js ada di lokasi yang tepat
3. Periksa case sensitivity (User.js vs user.js)

### Issue 2: "ReferenceError: expect is not defined"

**Error:**
```
ReferenceError: expect is not defined
```

**Solusi:**
1. Pastikan jest.config.js sudah dibuat
2. Jalankan `npm install jest --save-dev` jika belum terinstall
3. Pastikan test file berakhiran `.test.js`

### Issue 3: Tests Timeout

**Error:**
```
Timeout - Async callback was not invoked within the 5000ms timeout
```

**Solusi:**
1. Periksa apakah ada infinite loop dalam kode
2. Tambahkan timeout lebih besar: `jest.setTimeout(10000)`
3. Pastikan async/await digunakan dengan benar

### Issue 4: Mock Functions Not Working

**Error:**
```
mockStorage.save is not a function
```

**Solusi:**
1. Pastikan TestDataFactory.createMockStorage() return object yang benar
2. Periksa apakah jest.fn() digunakan dengan benar
3. Reset mocks dengan `jest.clearAllMocks()` di beforeEach

## 📊 Understanding Test Results

### Coverage Targets

Untuk project ini, target coverage yang baik:
- **Lines**: 80%+ (80% baris kode di-test)
- **Functions**: 85%+ (85% function dipanggil dalam test)
- **Branches**: 75%+ (75% if/else conditions di-test)
- **Statements**: 80%+ (80% statements dieksekusi)

### Interpreting Test Output

**Green (✓)**: Test passed - kode bekerja sesuai ekspektasi
**Red (✗)**: Test failed - ada bug atau test salah
**Yellow**: Warning - biasanya coverage kurang

## 🎯 Key Concepts Review

### 1. Unit Testing
- Test komponen individual secara terpisah
- Fast, focused, easy to debug
- Contoh: Test User.updateProfile() method

### 2. Integration Testing
- Test interaksi antar komponen
- Lebih lambat tapi lebih comprehensive
- Contoh: Test TaskController dengan TaskRepository

### 3. Test-Driven Development (TDD)
- Red: Write failing test
- Green: Write minimal code to pass
- Refactor: Improve code quality

### 4. Mocking
- Replace dependencies dengan fake objects
- Isolate component being tested
- Control external dependencies

## ✅ Implementation Checklist

### **CRITICAL - Harus Benar Dulu:**
- [ ] **WAJIB**: Cek import statements di repository files
  - [ ] `const User = require('../models/User');` di UserRepository.js
  - [ ] `const EnhancedTask = require('../models/EnhancedTask');` di TaskRepository.js
- [ ] **WAJIB**: Fix browser vs Node.js compatibility
  - [ ] Update conditional imports di UserRepository.js dan TaskRepository.js
  - [ ] Gunakan `typeof module !== 'undefined'` check yang lebih ketat
  - [ ] Validasi tidak ada "Identifier already declared" error di browser
- [ ] **WAJIB**: File structure lengkap (models, repositories, controllers)
- [ ] **WAJIB**: Aplikasi bisa jalan dengan `npm start` DAN browser tidak error

### **Setup Testing:**
- [ ] Setup Jest configuration (jest.config.js)
- [ ] Buat test utilities (TestDataFactory, TestAssertions)
- [ ] Update TestAssertions untuk handle data/message response format

### **Unit Tests:**
- [ ] Tulis unit tests untuk User model (10 tests)
- [ ] Tulis unit tests untuk EnhancedTask model (14 tests)
- [ ] Fix timing issue di EnhancedTask tests (toBeGreaterThanOrEqual)

### **Integration Tests:**
- [ ] Tulis tests untuk UserRepository (16 tests)
- [ ] Tulis integration tests untuk TaskController (19 tests)

### **Final Validation:**
- [ ] **CRITICAL**: Jalankan `npm test` - harus 59 passed, 0 failed
- [ ] **CRITICAL**: Jalankan `npm start` dan buka http://localhost:3000
- [ ] **CRITICAL**: Cek browser console - tidak boleh ada "Identifier already declared" error
- [ ] Check coverage report (target 25%+ untuk semester 1)
- [ ] Test manual di browser untuk memastikan tidak ada regression
- [ ] Test login, create task, dan basic functionality masih bekerja

### **Troubleshooting Checklist:**
- [ ] Baca error messages dengan teliti
- [ ] Cek import statements jika ada "is not defined" error
- [ ] Fix browser vs Node.js compatibility jika ada "Identifier already declared" error
- [ ] Test satu file dulu jika ada multiple failures
- [ ] Restart terminal jika ada cache issues
- [ ] Cek browser console untuk error yang tidak muncul di terminal

## 🚀 Next Steps

Setelah menyelesaikan Day 3:

**Day 4**: Version Control & Collaboration
- Git workflow dan branching strategies
- Code review processes
- Collaborative development practices

**Day 5**: Deployment & Production
- Production configuration
- Monitoring dan logging
- Deployment strategies

## 🚨 **TROUBLESHOOTING GUIDE - WAJIB BACA!**

### **Masalah yang Sering Terjadi dan Solusinya**

#### ❌ **Error: "ReferenceError: User is not defined"**
**Penyebab**: Repository tidak mengimport Model class
**Lokasi Error**: `src/repositories/UserRepository.js` line 37
**Solusi**:
```javascript
// Tambahkan di baris pertama UserRepository.js
const User = require('../models/User');
```

#### ❌ **Error: "ReferenceError: EnhancedTask is not defined"**
**Penyebab**: TaskRepository tidak mengimport EnhancedTask class
**Lokasi Error**: `src/repositories/TaskRepository.js`
**Solusi**:
```javascript
// Tambahkan di baris pertama TaskRepository.js
const EnhancedTask = require('../models/EnhancedTask');
```

#### ❌ **Error: "Cannot find module '../../src/models/User'"**
**Penyebab**: Path import salah atau file tidak ada
**Solusi**:
1. Pastikan file `src/models/User.js` ada
2. Cek path relatif dari test file ke model file
3. Pastikan nama file exact match (case-sensitive)

#### ❌ **Error: "expect is not defined"**
**Penyebab**: Jest tidak ter-setup dengan benar
**Solusi**:
1. Pastikan `jest.config.js` ada
2. Jalankan `npm install --save-dev jest`
3. Restart terminal dan coba lagi

#### ❌ **Error: "Timeout - Async callback was not invoked"**
**Penyebab**: Test terlalu lama atau infinite loop
**Solusi**:
1. Cek apakah ada infinite loop di kode
2. Tambahkan timeout di jest.config.js:
```javascript
module.exports = {
    testTimeout: 10000 // 10 detik
};
```

#### ❌ **Error: "mockStorage.save is not a function"**
**Penyebab**: Mock object tidak di-setup dengan benar
**Solusi**:
```javascript
const mockStorage = {
    save: jest.fn(),
    load: jest.fn().mockReturnValue([]),
    clear: jest.fn()
};
```

#### ❌ **Error: "expect(received).toHaveProperty(path)"**
**Penyebab**: Response format tidak sesuai ekspektasi
**Contoh Error**: Expected path: "data", Received: {"message": "...", "success": true}
**Solusi**: Response delete menggunakan `message` bukan `data`, ini normal

#### ❌ **Error: "expect(received).toBeGreaterThan(expected)"**
**Penyebab**: Timing issue pada timestamp testing
**Solusi**: Gunakan `toBeGreaterThanOrEqual` instead of `toBeGreaterThan`

#### ❌ **Error: "Identifier 'User' has already been declared" (Browser Console)**
**Penyebab**: Konflik antara browser environment (script tags) dan Node.js environment (require)
**Lokasi Error**: Browser console saat membuka http://localhost:3000
**Gejala**: 
- Tests berjalan dengan baik (`npm test` sukses)
- Browser menampilkan error "Identifier already declared"
- Aplikasi tidak berfungsi di browser

**Solusi LENGKAP**:

1. **Update UserRepository.js** - Ganti conditional import:
```javascript
// GANTI dari:
if (typeof require !== 'undefined' && typeof User === 'undefined') {
    var User = require('../models/User');
}

// MENJADI:
if (typeof require !== 'undefined' && typeof module !== 'undefined') {
    // Hanya import jika kita benar-benar di Node.js environment
    if (typeof User === 'undefined') {
        User = require('../models/User');
    }
}
```

2. **Update TaskRepository.js** - Ganti conditional import:
```javascript
// GANTI dari:
if (typeof require !== 'undefined' && typeof EnhancedTask === 'undefined') {
    var EnhancedTask = require('../models/EnhancedTask');
}

// MENJADI:
if (typeof require !== 'undefined' && typeof module !== 'undefined') {
    // Hanya import jika kita benar-benar di Node.js environment
    if (typeof EnhancedTask === 'undefined') {
        EnhancedTask = require('../models/EnhancedTask');
    }
}
```

**Penjelasan Solusi**:
- Browser environment: Classes tersedia via script tags (global scope)
- Node.js environment: Classes perlu di-import dengan require()
- Conditional import yang lebih ketat mencegah konflik variable declaration
- `typeof module !== 'undefined'` memastikan kita benar-benar di Node.js

**Validasi Solusi**:
1. Jalankan `npm test` - harus tetap 59 passed, 0 failed
2. Jalankan `npm start` dan buka http://localhost:3000
3. Buka browser console - tidak boleh ada error "Identifier already declared"
4. Test aplikasi berfungsi normal (login, create task, dll)

### **Langkah Debugging Sistematis**

#### 1. **Cek File Structure**
```bash
# Pastikan semua file ada
ls -la src/models/
ls -la src/repositories/
ls -la tests/
```

#### 2. **Cek Import Statements**
```bash
# Cek baris pertama repository files
head -n 5 src/repositories/UserRepository.js
head -n 5 src/repositories/TaskRepository.js
```

#### 3. **Test Satu File Dulu**
```bash
# Test model dulu (paling sederhana)
npm test tests/models/User.test.js

# Kalau model pass, test repository
npm test tests/repositories/UserRepository.test.js

# Terakhir test controller
npm test tests/controllers/TaskController.test.js
```

#### 4. **Cek Error Message Detail**
```bash
# Jalankan dengan verbose untuk detail error
npm test -- --verbose
```

### **Checklist Sebelum Minta Bantuan**

- [ ] Sudah cek import statements di repository files
- [ ] Sudah fix browser vs Node.js compatibility (conditional imports)
- [ ] Sudah coba test satu file dulu (User.test.js)
- [ ] Sudah baca error message dengan teliti
- [ ] Sudah cek file structure sesuai guide
- [ ] Sudah cek browser console untuk error tambahan
- [ ] Sudah restart terminal dan coba lagi

### **Expected Test Results**

Jika semua benar, hasil `npm test` harus:
```
Test Suites: 4 passed, 4 total
Tests:       59 passed, 59 total
Snapshots:   0 total
Time:        X.XXXs
```

**Coverage yang diharapkan**:
- Statements: 25%+ (normal, karena banyak file belum di-test)
- Branches: 25%+
- Functions: 30%+
- Lines: 25%+

## 💡 Tips untuk Sukses

1. **Start Small**: Mulai dengan test sederhana, lalu kompleks
2. **Read Error Messages**: Error message Jest sangat informatif
3. **Use Console.log**: Untuk debugging test yang gagal
4. **Test Edge Cases**: Empty values, null, undefined, very long strings
5. **Keep Tests Simple**: Satu test untuk satu behavior
6. **Use Descriptive Names**: Test name harus jelas apa yang di-test

## 📚 Additional Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)
- [Test-Driven Development Guide](https://martinfowler.com/bliki/TestDrivenDevelopment.html)

## 🔧 **Quick Reference - Command Cheat Sheet**

### **Testing Commands:**
```bash
# Test semua
npm test

# Test satu file
npm test User.test.js

# Test dengan coverage
npm run test:coverage

# Test dengan watch mode
npm run test:watch

# Test dengan verbose output
npm test -- --verbose
```

### **Debugging Commands:**
```bash
# Cek Jest version
npm test -- --version

# Cek file structure
ls -la src/models/
ls -la src/repositories/
ls -la tests/

# Cek import statements
head -n 5 src/repositories/UserRepository.js
head -n 5 src/repositories/TaskRepository.js
```

### **Validation Commands:**
```bash
# Test aplikasi masih jalan
npm start

# Test syntax JavaScript
node -c src/models/User.js
node -c src/repositories/UserRepository.js

# Test browser compatibility
# 1. Jalankan npm start
# 2. Buka http://localhost:3000 di browser
# 3. Buka Developer Tools (F12)
# 4. Cek Console tab - tidak boleh ada error merah
```

## 🎉 Congratulations!

Anda telah berhasil menyelesaikan Day 3! Sekarang aplikasi Anda memiliki:
- ✅ Comprehensive test suite
- ✅ Automated testing dengan Jest
- ✅ Good test coverage
- ✅ Confidence dalam kode quality
- ✅ Foundation untuk collaborative development

Testing adalah investasi untuk masa depan kode Anda. Dengan tests yang baik, Anda bisa:
- Refactor dengan confidence
- Catch bugs early
- Document expected behavior
- Enable team collaboration

Great job! 🎊