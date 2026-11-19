
from sqlalchemy import Column, Integer, String, Date, Text, Numeric
from datetime import date
from .database import Base


class Expense(Base):
    __tablename__ = "expenses"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(150), nullable=False)
    amount = Column(Numeric(10, 2), nullable=False)
    category = Column(String(30), nullable=False)
    date = Column(Date, default=date.today, nullable=False)
    note = Column(Text, nullable=True)
