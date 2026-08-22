from fastapi import FastAPI

from attendance import router as attendance_router
from auth import router as auth_router
from database import Base, engine
from employees import router as employee_router
from leave import router as leave_router
from models.attendance import Attendance
from models.employee import Employee
from models.leave import Leave
from models.payroll import Payroll
from models.user import User


app = FastAPI()
app.include_router(auth_router)
app.include_router(employee_router)
app.include_router(attendance_router)
app.include_router(leave_router)


@app.on_event("startup")
def create_tables() -> None:
    Base.metadata.create_all(bind=engine)


@app.get("/")
def home():
    return {"message": "Dayflow backend is running!"}