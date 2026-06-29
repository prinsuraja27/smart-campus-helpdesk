from enum import Enum
from pydantic import BaseModel, Field, field_validator


class RequestType(str, Enum):
    id_card = "ID Card Problem"
    certificate = "Certificate Request"
    fee = "Fee Query"
    website = "Website Issue"
    library = "Library Issue"
    other = "Other"


class RequestStatus(str, Enum):
    pending = "pending"
    in_progress = "in_progress"
    solved = "solved"
    rejected = "rejected"


class HelpDeskRequestCreate(BaseModel):
    student_name: str = Field(..., min_length=2, max_length=60)
    enrollment: str = Field(..., min_length=3, max_length=30)
    department: str = Field(..., min_length=2, max_length=40)
    phone: str = Field(..., min_length=10, max_length=15)
    request_type: RequestType
    message: str = Field(..., min_length=5, max_length=500)

    @field_validator("student_name", "enrollment", "department", "phone", "message", mode="before")
    @classmethod
    def clean_text(cls, value):
        if isinstance(value, str):
            return value.strip()
        return value

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, value: str):
        cleaned = value.replace(" ", "")
        if not cleaned.isdigit():
            raise ValueError("phone number must contain only digits")
        if len(cleaned) < 10:
            raise ValueError("phone number must be at least 10 digits")
        return cleaned


class StatusUpdate(BaseModel):
    status: RequestStatus
