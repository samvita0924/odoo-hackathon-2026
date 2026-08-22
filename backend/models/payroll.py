from sqlalchemy import Float, ForeignKey, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database import Base
from models.employee import Employee


class Payroll(Base):
    __tablename__ = "payroll"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    employee_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("employees.id"), unique=True, nullable=False
    )
    basic_salary: Mapped[float] = mapped_column(Float, nullable=False)
    allowances: Mapped[float] = mapped_column(Float, nullable=False, default=0)
    deductions: Mapped[float] = mapped_column(Float, nullable=False, default=0)
    net_salary: Mapped[float] = mapped_column(Float, nullable=False)

    employee: Mapped[Employee] = relationship()

    def __repr__(self) -> str:
        return f"<Payroll id={self.id!r} employee_id={self.employee_id!r}>"
