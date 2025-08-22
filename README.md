# 🎯 ManageEase - Complete Full-Stack Task Management Application

## 🚀 Complete Production-Ready Application

A fully functional, modern task management system built with the MERN stack and TypeScript.

### ✨ Features

- 🔐 **Authentication System** - JWT-based auth with secure sessions
- 📝 **Task Management** - Complete CRUD operations with priorities and due dates
- 📊 **Dashboard Analytics** - Task statistics and insights
- 🎨 **Modern UI** - Responsive design with Tailwind CSS
- 🛡️ **Security** - Comprehensive security measures and validation
- 🚀 **Performance** - Optimized for speed and scalability
- 📱 **Mobile-First** - Works perfectly on all devices

### 🛠️ Tech Stack

**Backend:** Node.js + Express.js + TypeScript + MongoDB + JWT  
**Frontend:** React 18 + TypeScript + Vite + Tailwind CSS

## ⚡ Quick Start

1. **Install dependencies:**
   ```bash
   npm run install:all
   ```

2. **Configure backend:**
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env with your MongoDB URI and JWT secrets
   ```

3. **Start both servers:**
   ```bash
   npm run dev
   ```

4. **Open browser:** http://localhost:5173

## 🔧 Environment Configuration

**Backend (.env):**
```env
MONGODB_URI=mongodb://localhost:27017/manage-ease
JWT_ACCESS_SECRET=your_32_character_secret_key_here
JWT_REFRESH_SECRET=your_32_character_refresh_key_here
CORS_ORIGIN=http://localhost:5173
```

**Frontend (.env.local):**
```env
VITE_API_URL=http://localhost:5000/api/v1
VITE_APP_NAME=ManageEase
```

## 📚 API Endpoints

**Authentication:**
- POST /api/v1/auth/register - User registration
- POST /api/v1/auth/login - User login
- GET /api/v1/auth/me - Get current user

**Tasks:**
- GET /api/v1/tasks - Get all tasks
- POST /api/v1/tasks - Create task
- PUT /api/v1/tasks/:id - Update task
- DELETE /api/v1/tasks/:id - Delete task

## 🚀 Production Deployment

**Backend:** Deploy to Railway, Heroku, or DigitalOcean  
**Frontend:** Deploy to Vercel, Netlify, or GitHub Pages

## 📄 License

MIT License - Free for personal and commercial use.

---

🎉 **Complete, production-ready full-stack application!**  
Perfect for portfolios, learning, or as a foundation for bigger projects.
