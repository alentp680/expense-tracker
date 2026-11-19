
from fastapi import FastAPI, Depends, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import date
from pathlib import Path

from .database import Base, engine, get_db
from .models import Expense
from .schemas import ExpenseCreate, ExpenseResponse

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Expense Tracker API")

FRONTEND = Path(__file__).resolve().parent.parent / "frontend"

app.mount("/static", StaticFiles(directory=str(FRONTEND)), name="static")


@app.get("/")
def home():
    return FileResponse(FRONTEND / "index.html")


@app.post("/api/expenses", response_model=ExpenseResponse)
def add_expense(data: ExpenseCreate, db: Session = Depends(get_db)):
    expense = Expense(**data.dict())

    db.add(expense)
    db.commit()
    db.refresh(expense)

    return expense


@app.get("/api/expenses", response_model=list[ExpenseResponse])
def get_expenses(
    category: str = None,
    from_date: date = None,
    to_date: date = None,
    title: str = None,
    db: Session = Depends(get_db)
):
    query = db.query(Expense)

    if category:
        query = query.filter(Expense.category == category)

    if from_date:
        query = query.filter(Expense.date >= from_date)

    if to_date:
        query = query.filter(Expense.date <= to_date)

    if title:
        query = query.filter(Expense.title.ilike(f"%{title}%"))

    return query.order_by(
        Expense.date.desc(),
        Expense.id.desc()
    ).all()


@app.put("/api/expenses/{expense_id}", response_model=ExpenseResponse)
def update_expense(
    expense_id: int,
    data: ExpenseCreate,
    db: Session = Depends(get_db)
):
    expense = db.query(Expense).filter(
        Expense.id == expense_id
    ).first()

    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")

    for key, value in data.dict().items():
        setattr(expense, key, value)

    db.commit()
    db.refresh(expense)

    return expense


@app.delete("/api/expenses/{expense_id}")
def delete_expense(expense_id: int, db: Session = Depends(get_db)):
    expense = db.query(Expense).filter(
        Expense.id == expense_id
    ).first()

    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")

    db.delete(expense)
    db.commit()

    return {"message": "Expense deleted successfully"}


@app.get("/api/summary/monthly")
def monthly_summary(db: Session = Depends(get_db)):
    today = date.today()
    first_day = today.replace(day=1)

    if today.month == 12:
        next_month = date(today.year + 1, 1, 1)
    else:
        next_month = date(today.year, today.month + 1, 1)

    results = (
        db.query(
            Expense.category,
            func.sum(Expense.amount).label("total")
        )
        .filter(
            Expense.date >= first_day,
            Expense.date < next_month
        )
        .group_by(Expense.category)
        .all()
    )

    breakdown = {
        "Food": 0,
        "Transport": 0,
        "Shopping": 0,
        "Bills": 0,
        "Entertainment": 0,
        "Others": 0
    }

    for category, total in results:
        breakdown[category] = float(total or 0)

    return {
        "month": today.strftime("%B %Y"),
        "total_spent": round(sum(breakdown.values()), 2),
        "category_breakdown": breakdown
    }
