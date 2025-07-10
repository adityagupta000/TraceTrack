# 🔍 TraceTrack – Lost and Found Management Platform

<div align="center">

A full-stack React and Flask-based web platform to manage lost and found items across campuses or organizations.

[Features](#-features) • [Installation](#-installation) • [Usage](#-usage) • [Tech Stack](#-tech-stack) • [Screenshots](#-screenshots)

</div>

## 📋 Overview

TraceTrack is a modern lost and found management system built with React, Flask, and MySQL. It allows users to report, browse, and claim lost/found items, while administrators manage operations through a secure dashboard. The system supports scheduled item cleanup and includes role-based access control, image uploads, and a feedback module.

## ✨ Features

### 👥 User Features
- **🔐 User Registration & Login** – Secure credential system with hashed passwords
- **📝 Report Items** – Post lost or found items with image and description
- **🔍 Search & Filter** – Browse and filter reported items
- **📋 Claim Management** – Submit item claims with auto-checks and claim dashboard
- **💬 Send Messages** – Communicate with admins via message system
- **📊 User Dashboard** – View posted items, claims, and claim statuses

### 🛠️ Admin Features
- **🎛️ Admin Dashboard** – Overview of users, items, claims, and feedback
- **✅ Approve/Reject Claims** – Claim request handling with action panel
- **👥 User Management** – View and delete registered users
- **🗃 Item Cleanup** – Auto-remove unclaimed items after expiration
- **💌 View Feedback** – See feedback submitted by users

### 🔧 System Features
- **⚙️ RESTful API** – Flask backend with modular route handling
- **🧹 Scheduled Cleanup** – Auto-deletion of outdated items using APScheduler
- **🖼️ Image Upload** – Supports item image uploads and secure storage
- **🗂️ MySQL Procedures/Triggers** – Used for claim handling logic
- **🔐 Role-Based Access Control** – Separate routing for users and admins

## 🚀 Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | React, Tailwind CSS | Dynamic, responsive user interface |
| **Backend** | Flask (Python) | API server with route logic |
| **Database** | MySQL | Data storage, procedures, triggers |
| **Scheduler** | APScheduler | Periodic item cleanup |
| **Auth** | Flask Session, bcrypt | Authentication and role management |
| **Uploads** | Flask werkzeug, uuid | File storage and renaming |

## 📁 Project Structure

```
tracetrack/
│
├── frontend/
│   ├── public/
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── App.jsx
│       └── index.js
│
├── backend/
│   ├── static/
│   ├── templates/
│   ├── scheduler.py            # APScheduler cleanup task
│   ├── db_connection.py        # DB connector config
│   ├── app.py                  # Flask app entry point
│   └── routes/                 # Modular API routes
│       ├── auth_routes.py
│       ├── item_routes.py
│       ├── claim_routes.py
│       └── admin_routes.py
│
└── script.py                   # Exports project source code as PDF
```

## 🔧 Installation

### 🧩 Prerequisites
- Node.js (v18+)
- Python 3.10+
- MySQL 8.0+
- pip, npm, virtualenv

### 🖥 Backend Setup (Flask API)

```bash
# Clone repository
git clone https://github.com/yourusername/tracetrack.git
cd tracetrack/backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate (Windows)

# Install Python dependencies
pip install -r requirements.txt

# Configure MySQL
# Update db_connection.py with your DB credentials
# Then run your schema.sql to set up tables, procedures, and triggers

# Run the backend server
python app.py
# Flask app runs on http://localhost:5000
```

### 🌐 Frontend Setup (React)

```bash
cd tracetrack/frontend

# Install dependencies
npm install

# Start development server
npm run dev
# React app runs on http://localhost:5173
```

## 🎯 Usage

### 👤 For Users
1. Register or login at `http://localhost:5173/login`
2. Report a lost/found item with image and description
3. Browse posted items at `http://localhost:5173/items`
4. Claim an item and view claim status at `http://localhost:5173/dashboard`
5. Submit feedback at `http://localhost:5173/feedback`

### 🧑‍💼 For Admins
1. Login as admin at `http://localhost:5173/admin`
2. Review all users, posted items, and claims
3. Approve or reject item claims
4. Delete users, items, or feedbacks if needed
5. APScheduler will automatically remove unclaimed items after a set period

## 🔐 Security & Authentication

- **Session-based login** (stored on server)
- **Passwords hashed** with bcrypt
- **Role-based route protection**
- **Input validation** on all forms
- **Safe image uploads** with unique filenames
- **Secure REST API routes** with auth decorators

## 🧮 Database Overview

| Table | Description |
|-------|-------------|
| `users` | User info (name, email, role, etc.) |
| `items` | Lost/found items (type, image, desc) |
| `claims` | Claims submitted by users |
| `messages` | Admin-user messages |
| `feedback` | User feedback records |

**Features:**
- ✅ Includes stored procedures for insert/update logic
- ✅ Triggers for automated cleanup and claim control
- ✅ Normalized schema for referential integrity

## 📸 Screenshots

### 🔐 Register
![Register Page](https://github.com/adityagupta000/Lost_And_Found_Dbms/blob/920ad653d0447d985e2882857dd9f86a49977dca/db_lab/2.png)

### 🔐 Login
![Login Page](https://github.com/adityagupta000/Lost_And_Found_Dbms/blob/main/db_lab/1.png?raw=true)

### 🏠 User Interface
![User Dashboard](https://github.com/adityagupta000/Lost_And_Found_Dbms/blob/920ad653d0447d985e2882857dd9f86a49977dca/db_lab/3.png)

### 📝 Item Registration
![Item Registration Form](https://github.com/adityagupta000/Lost_And_Found_Dbms/blob/920ad653d0447d985e2882857dd9f86a49977dca/db_lab/4.png)





---

<div align="center">
Made with ❤️ to bring lost items and humanity back together.
</div>
