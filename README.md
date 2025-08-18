# 📌 ManageEase

**ManageEase** is a full-stack **task & user management web application**.  
It provides secure authentication, role-based authorization, and an intuitive UI for managing tasks and users.

---

## 🚀 Features

### 👤 User Management
- Register, login, update profile, change password
- Role-based access:
  - **Admin:** manage all users & tasks
  - **Regular User:** manage only own profile & tasks
- Delete account with confirmation

### ✅ Task Management
- Create, update, delete, and view tasks
- Tasks include: title, description, priority, status, due date, assigned user
- Admins can assign tasks to any user
- Search, filter, and sort tasks

### 🔒 Security
- JWT-based authentication
- Secure password hashing (bcrypt)
- Role-based access control
- Production-ready configs (HTTPS, secure cookies, `.env` secrets)

### 🎨 Frontend (React + Vite)
- Responsive UI
- Modern design with navigation bar
- Task cards with priority/status highlights
- Confirmation dialogs before dangerous actions
- Mobile-friendly layout

### ⚡ Backend (Node.js + Express + MongoDB)
- RESTful APIs for users and tasks
- Mongoose for schema and data validation
- Centralized error handling
- Input validation

---

## 🛠️ Tech Stack

**Frontend:** React (Vite), Axios, React Router, TailwindCSS / Material UI  
**Backend:** Node.js, Express, MongoDB (Mongoose), JWT, bcrypt  
**Other:** dotenv, nodemon  

---

## 📜 License

MIT License © 2025 ManageEase

---

👉 Do you also want me to generate a **diagram of the architecture** (frontend ↔ backend ↔ database) to include in this README? That would make it more professional.
