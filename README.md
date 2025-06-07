# 📋 Trackify – Task & Habit Tracker

**Trackify** is a personal task and habit tracking web application built using **Node.js**, **Express**, **MongoDB**, and **Vanilla JS**.  
It allows users to register, log in, manage daily tasks and habits, and receive email reminders.

---

## 🚀 Features

- ✅ User Registration & Login (with password hashing)
- 📅 Task creation and tracking 
- 📈 Habit tracking with scheduled reminders
- 📧 Email reminders (1 hour before task/habit time)
- 🔒 Toggle email notifications on/off
- 🧼 Clean and intuitive dashboard UI

---

## 🛠️ Tech Stack

- **Backend:** Node.js, Express
- **Database:** MongoDB (via Mongoose)
- **Frontend:** HTML, CSS, JavaScript
- **Email Service:** Nodemailer with Gmail App Password
- **Scheduling:** node-cron

---

## 🔐 Environment Variables

You must create a `.env` file in the `/Trackify` directory based on `.env.example`.

---

## 📦 Installation & Setup

1. Clone the repository:
    ```bash
    git clone https://github.com/aashish090/IU_DLBCSPJWD01-Trackify.git
    ```

2. Navigate to the project folder:
    ```bash
    cd IU_DLBCSPJWD01/Trackify
    ```

3. Install dependencies:
    ```bash
    npm install
    ```

4. Create your `.env` file:
    ```bash
    cp .env.example .env
    ```

5. Start the server:
    ```bash
    node server.js
    ```

6. Visit `http://localhost:3000` in your browser.

---

## 🎯 Usage

- Register a new user or log in.
- Add tasks with titles, and due times.
- Create habits and set reminder times.
- Enable/disable email reminders from your dashboard.

---

## 
