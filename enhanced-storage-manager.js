/**
 * Enhanced Storage Manager - Day 2 Implementation
 * FIXED VERSION (No Web API Conflict)
 */

class EnhancedStorageManager {
    constructor(storageKey = 'taskManagementApp_v2') {
        this.storageKey = storageKey;
        this.isAvailable = this._checkStorageAvailability();
        this.cache = new Map();
        this.cacheExpiry = 5 * 60 * 1000; // 5 minutes
        this.version = '2.0';

        this._initializeStorage();
    }

    /* ================= PUBLIC API ================= */

    save(entityType, data) {
        if (!this.isAvailable) return false;

        try {
            const fullKey = `${this.storageKey}_${entityType}`;
            const payload = {
                version: this.version,
                timestamp: new Date().toISOString(),
                data
            };

            localStorage.setItem(fullKey, JSON.stringify(payload));
            this.cache.set(entityType, { data, timestamp: Date.now() });
            return true;
        } catch (error) {
            this._handleStorageError(error, 'save', entityType);
            return false;
        }
    }

    load(entityType, defaultValue = null) {
        if (!this.isAvailable) return defaultValue;

        const cached = this._getFromCache(entityType);
        if (cached !== null) return cached;

        try {
            const fullKey = `${this.storageKey}_${entityType}`;
            const raw = localStorage.getItem(fullKey);
            if (!raw) return defaultValue;

            const parsed = this._migrateData(JSON.parse(raw));
            this.cache.set(entityType, {
                data: parsed.data,
                timestamp: Date.now()
            });

            return parsed.data;
        } catch (error) {
            this._handleStorageError(error, 'load', entityType);
            return defaultValue;
        }
    }

    remove(entityType) {
        if (!this.isAvailable) return false;
        localStorage.removeItem(`${this.storageKey}_${entityType}`);
        this.cache.delete(entityType);
        return true;
    }

    clear() {
        if (!this.isAvailable) return false;

        Object.keys(localStorage)
            .filter(k => k.startsWith(this.storageKey))
            .forEach(k => localStorage.removeItem(k));

        this.cache.clear();
        return true;
    }

    /* ================= PRIVATE ================= */

    _checkStorageAvailability() {
        try {
            localStorage.setItem('__test__', '1');
            localStorage.removeItem('__test__');
            return true;
        } catch {
            return false;
        }
    }

    _initializeStorage() {
        if (!this.isAvailable) return;

        const metaKey = `${this.storageKey}_meta`;
        if (!localStorage.getItem(metaKey)) {
            localStorage.setItem(metaKey, JSON.stringify({
                version: this.version,
                createdAt: new Date().toISOString()
            }));
        }
    }

    _getFromCache(entityType) {
        const cached = this.cache.get(entityType);
        if (!cached) return null;

        if (Date.now() - cached.timestamp > this.cacheExpiry) {
            this.cache.delete(entityType);
            return null;
        }
        return cached.data;
    }

    _migrateData(storedData) {
        if (!storedData.version) {
            return {
                version: this.version,
                timestamp: new Date().toISOString(),
                data: storedData
            };
        }
        return storedData;
    }

    _handleStorageError(error, operation, entityType) {
        console.error(`[Storage Error] ${operation}`, entityType, error.message);
        if (error.name === 'QuotaExceededError') {
            this.cache.clear();
        }
    }
}

/* ================= BACKWARD COMPATIBLE WRAPPER ================= */

// ✅ GANTI NAMA — JANGAN "StorageManager"
class AppStorageManager extends EnhancedStorageManager {
    constructor(storageKey = 'taskManagementApp_v2') {
        super(storageKey);
    }
}

/* ================= GLOBAL EXPORT ================= */

window.EnhancedStorageManager = EnhancedStorageManager;
window.AppStorageManager = AppStorageManager;
