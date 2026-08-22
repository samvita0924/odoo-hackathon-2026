from datetime import date, datetime, timezone
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, ConfigDict, model_validator
from sqlalchemy import select
from sqlalchemy.orm import Session

from auth import get_current_user, get_db
from models.employee import Employee
from models.leave import Leave
from models.user import User


router = APIRouter(prefix="/leaves", tags=["leaves"])


class LeaveCreateRequest(BaseModel):
    leave_type: str
    start_date: date
    end_date: date
    remarks: str | None = None

    @model_validator(mode="after")
    def validate_date_range(self) -> "LeaveCreateRequest":
        if self.end_date < self.start_date:
            raise ValueError("end_date must not be before start_date")
        return self


class LeaveDecisionRequest(BaseModel):
    admin_comment: str | None = None


class LeaveResponse(BaseModel):
    id: int
    employee_id: int
    leave_type: str
    start_date: date
    end_date: date
    remarks: str | None
    status: str
    admin_comment: str | None
    applied_at: datetime
    approved_by: int | None

    model_config = ConfigDict(from_attributes=True)


class LeaveAllResponse(LeaveResponse):
    employee_name: str
    employee_code: str


def utc_now() -> datetime:
    return datetime.now(timezone.utc).replace(tzinfo=None)


def find_employee(db: Session, user: User) -> Employee:
    employee = db.scalar(select(Employee).where(Employee.user_id == user.id))
    if employee is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee profile not found",
        )
    return employee


def require_hr(user: User) -> None:
    if user.role != "hr":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="HR access required",
        )


def find_leave_or_404(db: Session, leave_id: int) -> Leave:
    leave = db.get(Leave, leave_id)
    if leave is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Leave request not found",
        )
    return leave


@router.post("", response_model=LeaveResponse, status_code=status.HTTP_201_CREATED)
def create_leave_request(
    request: LeaveCreateRequest,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> Leave:
    employee = find_employee(db, current_user)
    leave = Leave(
        employee_id=employee.id,
        leave_type=request.leave_type,
        start_date=request.start_date,
        end_date=request.end_date,
        remarks=request.remarks,
        status="Pending",
        applied_at=utc_now(),
        approved_by=None,
        admin_comment=None,
    )
    db.add(leave)
    db.commit()
    db.refresh(leave)
    return leave


@router.get("/me", response_model=list[LeaveResponse])
def get_my_leave_requests(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> list[Leave]:
    employee = find_employee(db, current_user)
    query = (
        select(Leave)
        .where(Leave.employee_id == employee.id)
        .order_by(Leave.applied_at.desc(), Leave.id.desc())
    )
    return list(db.scalars(query))


@router.get("/all", response_model=list[LeaveAllResponse])
def get_all_leave_requests(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> list[dict[str, object]]:
    require_hr(current_user)
    records = db.scalars(
        select(Leave)
        .join(Employee, Leave.employee_id == Employee.id)
        .order_by(Leave.applied_at.desc(), Leave.id.desc())
    )
    return [
        {
            "id": leave.id,
            "employee_id": leave.employee_id,
            "leave_type": leave.leave_type,
            "start_date": leave.start_date,
            "end_date": leave.end_date,
            "remarks": leave.remarks,
            "status": leave.status,
            "admin_comment": leave.admin_comment,
            "applied_at": leave.applied_at,
            "approved_by": leave.approved_by,
            "employee_name": leave.employee.name,
            "employee_code": leave.employee.employee_id,
        }
        for leave in records
    ]


@router.put("/{leave_id}/approve", response_model=LeaveResponse)
def approve_leave_request(
    leave_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> Leave:
    require_hr(current_user)
    leave = find_leave_or_404(db, leave_id)
    if leave.status != "Pending":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Only Pending leave requests can be approved",
        )

    leave.status = "Approved"
    leave.approved_by = current_user.id
    db.commit()
    db.refresh(leave)
    return leave


@router.put("/{leave_id}/reject", response_model=LeaveResponse)
def reject_leave_request(
    leave_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
    decision: LeaveDecisionRequest | None = None,
) -> Leave:
    require_hr(current_user)
    leave = find_leave_or_404(db, leave_id)
    if leave.status != "Pending":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Only Pending leave requests can be rejected",
        )

    leave.status = "Rejected"
    leave.approved_by = current_user.id
    leave.admin_comment = decision.admin_comment if decision else None
    db.commit()
    db.refresh(leave)
    return leave
