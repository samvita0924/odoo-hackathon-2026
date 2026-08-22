from datetime import date, datetime, timezone
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, ConfigDict
from sqlalchemy import select
from sqlalchemy.orm import Session

from auth import get_current_user, get_db
from models.attendance import Attendance
from models.employee import Employee
from models.user import User


router = APIRouter(prefix="/attendance", tags=["attendance"])


class AttendanceResponse(BaseModel):
    id: int
    employee_id: int
    date: date
    check_in: datetime | None
    check_out: datetime | None
    status: str
    work_hours: float | None

    model_config = ConfigDict(from_attributes=True)


class AttendanceAllResponse(AttendanceResponse):
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


def find_today_attendance(
    db: Session, employee_id: int, attendance_date: date
) -> Attendance | None:
    return db.scalar(
        select(Attendance).where(
            Attendance.employee_id == employee_id,
            Attendance.date == attendance_date,
        )
    )


@router.post("/check-in", response_model=AttendanceResponse, status_code=status.HTTP_201_CREATED)
def check_in(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> Attendance:
    employee = find_employee(db, current_user)
    today = utc_now().date()
    if find_today_attendance(db, employee.id, today) is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Attendance already checked in today",
        )

    attendance = Attendance(
        employee_id=employee.id,
        date=today,
        check_in=utc_now(),
        status="Present",
    )
    db.add(attendance)
    db.commit()
    db.refresh(attendance)
    return attendance


@router.post("/check-out", response_model=AttendanceResponse)
def check_out(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> Attendance:
    employee = find_employee(db, current_user)
    attendance = find_today_attendance(db, employee.id, utc_now().date())
    if attendance is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Today's attendance record not found",
        )
    if attendance.check_out is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Attendance already checked out today",
        )
    if attendance.check_in is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Attendance has no check-in time",
        )

    attendance.check_out = utc_now()
    attendance.work_hours = (
        attendance.check_out - attendance.check_in
    ).total_seconds() / 3600
    db.commit()
    db.refresh(attendance)
    return attendance


@router.get("/me", response_model=list[AttendanceResponse])
def get_my_attendance(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
    date_filter: Annotated[date | None, Query(alias="date")] = None,
) -> list[Attendance]:
    employee = find_employee(db, current_user)
    query = select(Attendance).where(Attendance.employee_id == employee.id)
    if date_filter is not None:
        query = query.where(Attendance.date == date_filter)
    return list(db.scalars(query.order_by(Attendance.date.desc(), Attendance.id.desc())))


@router.get("/all", response_model=list[AttendanceAllResponse])
def get_all_attendance(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> list[dict[str, object]]:
    if current_user.role != "hr":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="HR access required",
        )

    records = db.scalars(
        select(Attendance)
        .join(Employee, Attendance.employee_id == Employee.id)
        .order_by(Attendance.date.desc(), Attendance.id.desc())
    )
    return [
        {
            "id": attendance.id,
            "employee_id": attendance.employee_id,
            "date": attendance.date,
            "check_in": attendance.check_in,
            "check_out": attendance.check_out,
            "status": attendance.status,
            "work_hours": attendance.work_hours,
            "employee_name": attendance.employee.name,
            "employee_code": attendance.employee.employee_id,
        }
        for attendance in records
    ]
