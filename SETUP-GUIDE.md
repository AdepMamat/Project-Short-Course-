# 🚀 Day 2 Setup Guide

## 📋 **Prerequisites**

Pastikan Anda sudah menyelesaikan Day 1 dan memiliki:
- ✅ Node.js installed
- ✅ Project folder dengan `package.json`
- ✅ Express server setup (`server.js`)
- ✅ Basic project structure

## 🔧 **Setup Day 2**

### **1. Verifikasi Setup Day 1**
```bash
# Pastikan di root project folder
ls -la

# Harus ada file-file ini:
# ├── package.json
# ├── server.js  
# ├── public/
# │   ├── index.html
# │   └── styles.css
# └── src/
#     └── app.js
```

### **2. Install Dependencies (jika belum)**
```bash
npm install
```

### **3. Test Server**
```bash
npm start
```

Harus muncul:
```
🚀 Development server running at http://localhost:3000
📁 Serving files from: /path/to/project/public
```

### **4. Buka Browser**
- Go to `http://localhost:3000`
- Harus melihat Day 1 task management system

## 📁 **File Structure Day 2**

Setelah mengikuti step-by-step guide, struktur akan menjadi:

```
project/
├── package.json                    # ✅ Sudah ada dari Day 1
├── server.js                       # ✅ Sudah ada dari Day 1
├── requirements.md                 # 🆕 Buat baru
├── public/
│   ├── index.html                  # 🔄 Update dari Day 1
│   └── styles.css                  # 🔄 Update dari Day 1
└── src/
    ├── models/                     # 🆕 Folder baru
    │   ├── User.js                 # 🆕 Buat baru
    │   └── EnhancedTask.js         # 🆕 Buat baru
    ├── repositories/               # 🆕 Folder baru
    │   ├── UserRepository.js       # 🆕 Buat baru
    │   └── TaskRepository.js       # 🆕 Buat baru
    ├── controllers/                # 🆕 Folder baru
    │   ├── UserController.js       # 🆕 Buat baru
    │   └── TaskController.js       # 🆕 Buat baru
    ├── views/                      # 🆕 Folder baru
    │   └── TaskView.js             # 🆕 Buat baru
    ├── utils/                      # 🆕 Folder baru
    │   └── EnhancedStorageManager.js # 🆕 Buat baru
    └── app.js                      # 🔄 Update dari Day 1
```

## 🎯 **Key Differences dari Day 1**

### **Day 1 (Simple):**
- Single `app.js` file
- Basic HTML/CSS
- Simple task management
- No user system

### **Day 2 (MVC Architecture):**
- Multiple organized files
- MVC pattern implementation
- User authentication
- Enhanced task features
- Repository pattern

## 🚨 **Common Issues & Solutions**

### **Issue: "Cannot GET /"**
**Cause**: Server tidak berjalan
**Solution**: 
```bash
npm start
```

### **Issue: "Module not found"**
**Cause**: File path salah di HTML
**Solution**: Pastikan script tags menggunakan path yang benar:
```html
<script src="src/models/User.js"></script>
```

### **Issue: "User is not defined"**
**Cause**: Script loading order salah
**Solution**: Pastikan urutan script di HTML benar (models → repositories → controllers → views → app)

### **Issue: "localStorage not working"**
**Cause**: Browser security restrictions
**Solution**: Pastikan menggunakan `http://localhost:3000`, bukan `file://`

## 🔄 **Development Workflow**

### **1. Start Development Server**
```bash
npm start
```

### **2. Make Changes**
- Edit files sesuai step-by-step guide
- Save changes

### **3. Test Changes**
- Refresh browser (`http://localhost:3000`)
- Check browser console for errors
- Test functionality

### **4. Debug Issues**
- Check browser console
- Check terminal for server errors
- Verify file paths and script loading order

## 📊 **Progress Tracking**

### **Checkpoint 1: Basic Setup**
- [ ] Server running successfully
- [ ] Can access `http://localhost:3000`
- [ ] No console errors

### **Checkpoint 2: Models Created**
- [ ] `src/models/User.js` created
- [ ] `src/models/EnhancedTask.js` created
- [ ] Can create User and Task instances in console

### **Checkpoint 3: Repositories Working**
- [ ] `src/repositories/UserRepository.js` created
- [ ] `src/repositories/TaskRepository.js` created
- [ ] Data persists in localStorage

### **Checkpoint 4: Controllers Functional**
- [ ] `src/controllers/UserController.js` created
- [ ] `src/controllers/TaskController.js` created
- [ ] Login/logout working

### **Checkpoint 5: Views Interactive**
- [ ] `src/views/TaskView.js` created
- [ ] UI updates automatically
- [ ] All interactions working

### **Checkpoint 6: Integration Complete**
- [ ] All components working together
- [ ] Full MVC pattern implemented
- [ ] Enhanced features functional

## 🎓 **Learning Objectives Check**

After completing Day 2 setup, students should be able to:
- [ ] Explain MVC pattern with examples
- [ ] Create models with proper encapsulation
- [ ] Implement repository pattern for data access
- [ ] Build controllers that coordinate between layers
- [ ] Create views that handle UI interactions
- [ ] Integrate all components into working application

## 📞 **Getting Help**

### **If Stuck:**
1. Check this setup guide
2. Verify all prerequisites
3. Check browser console for errors
4. Ask instructor for help

### **Before Asking for Help:**
- [ ] Tried restarting server
- [ ] Checked browser console
- [ ] Verified file paths
- [ ] Followed step-by-step guide exactly

---

**💡 Remember**: Day 2 builds on Day 1, so make sure Day 1 is working perfectly before starting Day 2!