from datetime import datetime, timezone
from uuid import uuid4

from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware

from app.models import HelpDeskRequestCreate, RequestStatus, StatusUpdate
from app.security import verify_admin_key
from app.storage import read_requests, write_requests

app = FastAPI(
    title="Smart Campus Help Desk API",
    description="A secure FastAPI backend for managing student help desk requests.",
    version="1.0.0",
)

# For internship/demo frontend. In production, replace * with your actual frontend domain.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


def current_time() -> str:
    return datetime.now(timezone.utc).isoformat()


def create_request_id() -> str:
    return "HLP-" + uuid4().hex[:8].upper()


@app.get("/")
def home():
    return {
        "project": "Smart Campus Help Desk API",
        "status": "running",
        "docs": "/docs",
    }


@app.post("/api/requests", status_code=status.HTTP_201_CREATED)
def create_request(request: HelpDeskRequestCreate):
    all_requests = read_requests()

    request_id = create_request_id()
    while request_id in all_requests:
        request_id = create_request_id()

    now = current_time()
    all_requests[request_id] = {
        "request_id": request_id,
        "student_name": request.student_name,
        "enrollment": request.enrollment,
        "department": request.department,
        "phone": request.phone,
        "request_type": request.request_type,
        "message": request.message,
        "status": RequestStatus.pending,
        "created_at": now,
        "updated_at": now,
    }

    write_requests(all_requests)

    return {
        "message": "Request submitted successfully",
        "request_id": request_id,
        "data": all_requests[request_id],
    }


@app.get("/api/track/{request_id}")
def track_request(request_id: str):
    all_requests = read_requests()

    if request_id not in all_requests:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Request not found",
        )

    data = all_requests[request_id]
    return {
        "request_id": request_id,
        "student_name": data["student_name"],
        "request_type": data["request_type"],
        "status": data["status"],
        "created_at": data["created_at"],
        "updated_at": data["updated_at"],
    }


@app.get("/api/admin/requests", dependencies=[Depends(verify_admin_key)])
def list_requests(status_filter: RequestStatus | None = None):
    all_requests = read_requests()

    if status_filter is None:
        return {
            "total": len(all_requests),
            "requests": all_requests,
        }

    filtered = {
        request_id: data
        for request_id, data in all_requests.items()
        if data.get("status") == status_filter
    }

    return {
        "total": len(filtered),
        "status_filter": status_filter,
        "requests": filtered,
    }


@app.get("/api/admin/requests/{request_id}", dependencies=[Depends(verify_admin_key)])
def get_request(request_id: str):
    all_requests = read_requests()

    if request_id not in all_requests:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Request not found",
        )

    return all_requests[request_id]


@app.patch("/api/admin/requests/{request_id}/status", dependencies=[Depends(verify_admin_key)])
def update_request_status(request_id: str, update: StatusUpdate):
    all_requests = read_requests()

    if request_id not in all_requests:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Request not found",
        )

    all_requests[request_id]["status"] = update.status
    all_requests[request_id]["updated_at"] = current_time()
    write_requests(all_requests)

    return {
        "message": "Status updated successfully",
        "data": all_requests[request_id],
    }


@app.delete("/api/admin/requests/{request_id}", dependencies=[Depends(verify_admin_key)])
def delete_request(request_id: str):
    all_requests = read_requests()

    if request_id not in all_requests:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Request not found",
        )

    deleted_request = all_requests.pop(request_id)
    write_requests(all_requests)

    return {
        "message": "Request deleted successfully",
        "deleted": deleted_request,
    }


@app.get("/api/admin/dashboard", dependencies=[Depends(verify_admin_key)])
def dashboard():
    all_requests = read_requests()

    summary = {
        "total_requests": len(all_requests),
        "pending": 0,
        "in_progress": 0,
        "solved": 0,
        "rejected": 0,
    }

    for data in all_requests.values():
        request_status = data.get("status", "pending")
        if request_status in summary:
            summary[request_status] += 1

    return summary
