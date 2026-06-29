# Smart Campus Help Desk Portal

A full-stack internship project with a professional frontend and secure FastAPI backend.

## Project Idea

Students can submit campus-related requests. Admin can view all requests, update their status, delete requests, and see dashboard summary counts.

## Features

### Student Features
- Submit a help desk request
- Get a unique request ID
- Track request status using request ID

### Admin Features
- Protected admin dashboard using `x-admin-key`
- View all requests
- Update status: `pending`, `in_progress`, `solved`, `rejected`
- Delete requests
- Dashboard summary: total, pending, in progress, solved, rejected

### Backend Security/Quality Features
- Pydantic validation
- Phone number validation
- Admin API key protection
- Proper HTTP status codes
- JSON storage with safe file handling
- CORS enabled for local frontend demo
- Structured code using multiple files

## Folder Structure

```text
smart_campus_helpdesk_fullstack/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py
│   │   ├── models.py
│   │   ├── security.py
│   │   └── storage.py
│   ├── data/
│   │   └── requests.json
│   ├── requirements.txt
│   ├── sample_request.json
│   └── run.bat
├── frontend/
│   ├── index.html
│   └── assets/
│       ├── css/style.css
│       └── js/app.js
└── docs/
    └── PROJECT_REPORT.md
```

## How to Run Backend

Open terminal inside the `backend` folder and run:

```bash
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --reload
```

Or on Windows, double click:

```text
backend/run.bat
```

Backend URL:

```text
http://127.0.0.1:8000
```

API Docs:

```text
http://127.0.0.1:8000/docs
```

## How to Run Frontend

Open this file in browser:

```text
frontend/index.html
```

Make sure backend is running before submitting the form.

## Demo Admin Key

```text
campus-admin-123
```

For final/project use, change it using environment variable:

```bash
set HELPDESK_ADMIN_KEY=your-secret-key
```

## Main API Endpoints

```text
POST   /api/requests
GET    /api/track/{request_id}
GET    /api/admin/dashboard
GET    /api/admin/requests
GET    /api/admin/requests/{request_id}
PATCH  /api/admin/requests/{request_id}/status
DELETE /api/admin/requests/{request_id}
```

## Suggested Demo Flow

1. Start backend.
2. Open frontend.
3. Submit one student request.
4. Copy generated request ID.
5. Track request status.
6. Enter admin key.
7. Load dashboard.
8. Mark request as solved.
9. Track again to show status changed.
