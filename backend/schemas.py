
from pydantic import BaseModel, Field
from datetime import date as Date
from typing import Optional, Literal

Category = Literal[
    "Food",
    "Transport",
    "Shopping",
    "Bills",
    "Entertainment",
    "Others"
]


class ExpenseCreate(BaseModel):
    title: str = Field(min_length=1, max_length=150)
    amount: float = Field(gt=0)
    category: Category
    date: Date = Field(default_factory=Date.today)
    note: Optional[str] = None


class ExpenseResponse(ExpenseCreate):
    id: int

    class Config:
        orm_mode = True
