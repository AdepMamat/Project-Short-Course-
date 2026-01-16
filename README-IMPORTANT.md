# 🚨 PENTING: Panduan Penggunaan File Day 2

## 📁 Struktur File dan Versi

Folder ini berisi **DUA VERSI** implementasi Day 2:

### 🎓 **VERSI BEGINNER (Untuk Mahasiswa Semester awal)**
**Gunakan file-file ini untuk mengikuti step-by-step guide:**

- `day2-step-by-step-guide.md` - **PANDUAN UTAMA**
- `requirements.md` - User stories sederhana
- `user-model.js` - User model yang sudah disederhanakan
- `enhanced-task-model-simplified.js` - Task model yang sesuai dengan guide

### 🚀 **VERSI ADVANCED (Referensi Lanjutan)**
**File-file ini untuk referensi atau mahasiswa advanced:**

- `requirements-analysis.md` - Requirements analysis yang formal
- `enhanced-task-model.js` - Task model dengan fitur lengkap
- File lainnya dengan implementasi yang lebih kompleks

## 🎯 **Untuk Instructor:**

### **Saat Mengajar Mahasiswa Semester awal:**
1. **GUNAKAN** `day2-step-by-step-guide.md` sebagai panduan utama
2. **ARAHKAN** mahasiswa menggunakan file simplified
3. **JANGAN** berikan file advanced di awal (akan membingungkan)

### **File yang Harus Digunakan Mahasiswa:**
```
✅ GUNAKAN INI:
├── day2-step-by-step-guide.md
├── requirements.md  
├── user-model.js (sudah disederhanakan)
└── enhanced-task-model-simplified.js

❌ JANGAN GUNAKAN INI DULU:
├── requirements-analysis.md
├── enhanced-task-model.js (terlalu kompleks)
└── File advanced lainnya
```

## 🔄 **Progression Path:**

### **Day 2 - Beginner Track:**
- Ikuti `day2-step-by-step-guide.md`
- Implementasi basic MVC pattern
- User management sederhana
- Task dengan kategori dan due date

### **Day 2 - Advanced Track (Opsional):**
- Setelah menguasai beginner track
- Explore file advanced untuk fitur tambahan
- Role-based permissions
- Advanced task properties

## 🛠 **Cara Menggunakan:**

### **Untuk Mahasiswa Semester awal:**
1. Buka `day2-step-by-step-guide.md`
2. Ikuti langkah demi langkah
3. Copy code dari guide (sudah disesuaikan)
4. Jangan bingung dengan file lain yang ada

### **Untuk Mahasiswa Advanced:**
1. Mulai dengan beginner track dulu
2. Setelah selesai, explore file advanced
3. Compare implementasi sederhana vs kompleks
4. Pelajari design patterns yang lebih advanced

## 📝 **File Mapping:**

| Step-by-Step Guide | File yang Digunakan |
|-------------------|-------------------|
| Step 1: Requirements | `requirements.md` |
| Step 2: User Model | `user-model.js` (simplified) |
| Step 3: Task Model | `enhanced-task-model-simplified.js` |
| Step 4: Repository | Buat baru sesuai guide |
| Step 5: Controller | Buat baru sesuai guide |
| Step 6: View | Buat baru sesuai guide |

## ⚠️ **Warning untuk Instructor:**

**JANGAN** share semua file sekaligus ke mahasiswa semester awal. Ini akan menyebabkan:
- Confusion antara versi simplified dan advanced
- Mahasiswa menggunakan code yang terlalu kompleks
- Frustasi karena tidak bisa mengikuti step-by-step guide

## 🎯 **Rekomendasi Distribusi:**

### **Week 1 (Day 2):**
- Share hanya: `day2-step-by-step-guide.md`
- Biarkan mahasiswa buat file sendiri mengikuti guide
- Atau share file simplified sebagai reference

### **Week 2 (Review):**
- Share file advanced sebagai "next level"
- Jelaskan perbedaan implementasi
- Diskusi trade-off complexity vs functionality

## 🔧 **Troubleshooting:**

### **Jika Mahasiswa Bingung:**
1. Pastikan mereka menggunakan file yang benar
2. Arahkan ke `day2-step-by-step-guide.md`
3. Jelaskan ada dua versi (simplified vs advanced)

### **Jika Code Tidak Match dengan Guide:**
1. Cek apakah menggunakan file simplified
2. Pastikan mengikuti step-by-step guide
3. Jangan mix antara simplified dan advanced code

## 📚 **Learning Objectives:**

### **Beginner Track:**
- Memahami MVC pattern dasar
- Implementasi user authentication sederhana
- Task management dengan kategori
- Repository pattern introduction

### **Advanced Track:**
- Complex domain modeling
- Advanced validation patterns
- Role-based access control
- Metadata dan extensibility patterns

---

**💡 TIP:** Mulai selalu dengan beginner track, bahkan untuk mahasiswa yang sudah berpengalaman. Foundation yang kuat lebih penting daripada complexity yang prematur.