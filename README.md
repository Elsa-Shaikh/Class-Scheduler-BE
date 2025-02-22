# Class Scheduler – Backend

# Overview
- This is the backend for a Class Scheduler system where:
- Admin can create and manage classes.
- Teachers and Students can view their scheduled classes.
- A secure, role-based API ensures proper access control.
- Includes a notification system that sends alerts to teachers and students when a class is scheduled.
- Integrated email service for additional notifications.

# Tech Stack
- Node.js & Express.js – Backend framework
- MongoDB – Database
- Zod – Request body validation
- Logger – For easy debugging

# Key Features
- Secure Login & Signup (Role-Based Authentication & Authorization)
- Class CRUD Operations
- Real-time Notification System
- Email Notification Service

# How to Run the Backend Project

1. Install Dependencies
- npm install

2. Set Up Environment Variables
- DATABASE_URL=your_database_url_here
- email service credentials

3. Run the Development Server
- npm run dev

# API Documentation
- https://documenter.getpostman.com/view/36865675/2sAYdcrC5k
