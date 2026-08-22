from sqlalchemy import Float, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database import Base
from models.user import User


class Employee(Base):
    __tablename__ = "employees"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id"), unique=True, nullable=False
    )
    employee_id: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    name: Mapped[str] = mapped_column(String, nullable=False)
    email: Mapped[str] = mapped_column(String, nullable=False)
    phone: Mapped[str | None] = mapped_column(String, nullable=True)
    address: Mapped[str | None] = mapped_column(String, nullable=True)
    job_position: Mapped[str | None] = mapped_column(String, nullable=True)
    salary: Mapped[float | None] = mapped_column(Float, nullable=True)
    profile_picture: Mapped[str | None] = mapped_column(String, nullable=True)

    user: Mapped[User] = relationship()

    def __repr__(self) -> str:
        return f"<Employee id={self.id!r} employee_id={self.employee_id!r}>"
