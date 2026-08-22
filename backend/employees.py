from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, ConfigDict
from sqlalchemy import select
from sqlalchemy.orm import Session

from auth import get_current_user, get_db
from models.employee import Employee
from models.user import User


router = APIRouter(prefix="/employees", tags=["employees"])


class EmployeeProfileUpdate(BaseModel):
    phone: str | None = None
    address: str | None = None
    profile_picture: str | None = None


class EmployeeProfileResponse(BaseModel):
    id: int
    employee_id: str
    name: str
    email: str
    phone: str | None
    address: str | None
    job_position: str | None
    salary: float | None
    profile_picture: str | None

    model_config = ConfigDict(from_attributes=True)


def find_employee(db: Session, user: User) -> Employee:
    employee = db.scalar(select(Employee).where(Employee.user_id == user.id))
    if employee is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee profile not found",
        )
    return employee


@router.get("/me", response_model=EmployeeProfileResponse)
def get_employee_profile(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> Employee:
    return find_employee(db, current_user)


@router.put("/me", response_model=EmployeeProfileResponse)
def update_employee_profile(
    profile_update: EmployeeProfileUpdate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> Employee:
    employee = find_employee(db, current_user)
    for field, value in profile_update.model_dump(exclude_unset=True).items():
        setattr(employee, field, value)

    db.commit()
    db.refresh(employee)
    return employee
