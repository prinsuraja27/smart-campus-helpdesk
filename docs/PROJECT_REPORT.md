# Internship Project Report

## Project Title

Smart Campus Help Desk Portal

## Introduction

Smart Campus Help Desk Portal is a full-stack web application designed for college students to submit campus-related requests. The system allows students to submit issues such as ID card problems, certificate requests, fee queries, website issues, library issues, and other college-related problems. The admin can view submitted requests, update their status, delete requests, and monitor the overall dashboard summary.

## Objective

The main objective of this project is to build a practical and real-world help desk system using FastAPI for backend development and HTML, CSS, and JavaScript for the frontend. The project focuses on request handling, validation, JSON file storage, admin security, CRUD operations, and dashboard reporting.

## Technologies Used

- Python
- FastAPI
- Pydantic
- Uvicorn
- HTML
- CSS
- JavaScript
- JSON file storage

## Key Features

1. Student request submission form
2. Automatic unique request ID generation
3. Public request status tracking
4. Secure admin dashboard using admin key
5. View all submitted requests
6. Update request status
7. Delete request
8. Dashboard summary with request counts
9. JSON-based persistent storage
10. Proper validation and error handling

## Backend Modules

### main.py
Contains all FastAPI routes and main application logic.

### models.py
Contains Pydantic models for request body validation and status enums.

### storage.py
Handles reading and writing request data from the JSON file.

### security.py
Handles admin key verification for protected admin routes.

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | / | API health check |
| POST | /api/requests | Submit a new student request |
| GET | /api/track/{request_id} | Track request status |
| GET | /api/admin/dashboard | Admin dashboard summary |
| GET | /api/admin/requests | Show all requests |
| GET | /api/admin/requests/{request_id} | Show single request |
| PATCH | /api/admin/requests/{request_id}/status | Update request status |
| DELETE | /api/admin/requests/{request_id} | Delete request |

## Security Features

The admin routes are protected using an `x-admin-key` header. Only a user with the correct admin key can access the admin dashboard, update status, view all requests, and delete requests. The backend also validates input data using Pydantic models.

## Conclusion

This project demonstrates a real-world campus help desk system with frontend and backend integration. It uses FastAPI for backend APIs, JavaScript for frontend API calls, and JSON storage for persistent data. The project helped in learning CRUD operations, request body handling, validation, error handling, API security, and basic full-stack integration.
