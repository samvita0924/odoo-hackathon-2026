from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy import select
from sqlalchemy.orm import Session

from auth import get_current_user, get_db
from models.employee import Employee
from models.payroll import Payroll
from models.user import User


router = APIRouter(prefix="/payroll", tags=["payroll"])


class PayrollUpdateRequest(BaseModel):
    basic_salary: float | None = Field(default=None, ge=0)
    allowances: float | None = Field(default=None, ge=0)
    deductions: float | None = Field(default=None, ge=0)


class PayrollResponse(BaseModel):
    id: int
    employee_id: int
    basic_salary: float
    allowances: float
    deductions: float
    net_salary: float

    model_config = ConfigDict(from_attributes=True)


class PayrollAllResponse(PayrollResponse):
    employee_code: str
    employee_name: str


def find_employee(db: Session, user: User) -> Employee:
    employee = db.scalar(select(Employee).where(Employee.user_id == user.id))
    if employee is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee profile not found",
        )
    return employee


def find_payroll(db: Session, employee_id: int) -> Payroll:
    payroll = db.scalar(
        select(Payroll).where(Payroll.employee_id == employee_id)
    )
    if payroll is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payroll record not found",
        )
    return payroll


def require_hr(user: User) -> None:
    if user.role != "hr":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="HR access required",
        )


@router.get("/me", response_model=PayrollResponse)
def get_my_payroll(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> Payroll:
    employee = find_employee(db, current_user)
    return find_payroll(db, employee.id)


@router.get("/all", response_model=list[PayrollAllResponse])
def get_all_payroll(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> list[dict[str, object]]:
    require_hr(current_user)
    records = db.scalars(
        select(Payroll)
        .join(Employee, Payroll.employee_id == Employee.id)
        .order_by(Employee.employee_id)
    )
    return [
        {
            "id": payroll.id,
            "employee_id": payroll.employee_id,
            "basic_salary": payroll.basic_salary,
            "allowances": payroll.allowances,
            "deductions": payroll.deductions,
            "net_salary": payroll.net_salary,
            "employee_code": payroll.employee.employee_id,
            "employee_name": payroll.employee.name,
        }
        for payroll in records
    ]


@router.put("/{employee_id}", response_model=PayrollResponse)
def update_payroll(
    employee_id: int,
    request: PayrollUpdateRequest,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> Payroll:
    require_hr(current_user)
    payroll = find_payroll(db, employee_id)
    updates = request.model_dump(exclude_unset=True)
    for field, value in updates.items():
        setattr(payroll, field, value)

    payroll.net_salary = (
        payroll.basic_salary + payroll.allowances - payroll.deductions
    )
    db.commit()
    db.refresh(payroll)
    return payroll
