from fastapi import FastAPI

from database import Base, engine
from models.attendance import Attendance
from models.employee import Employee
from models.leave import Leave
from models.payroll import Payroll
from models.user import User


app = FastAPI()


@app.on_event("startup")
def create_tables() -> None:
    Base.metadata.create_all(bind=engine)


@app.get("/")
def home():
    return {"message": "Dayflow backend is running!"}