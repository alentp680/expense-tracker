# Expense Tracker

A simple web-based Expense Tracker application built with **Python, FastAPI, SQLite, SQLAlchemy, HTML, CSS and JavaScript**.

The application allows users to record, manage, search and filter expenses while viewing monthly spending summaries and category-wise breakdowns.

## Features

- Add new expenses with title, amount, category, date and optional notes.
- View all recorded expenses.
- Edit existing expenses.
- Delete expenses.
- Search expenses by title.
- Filter expenses by category and date range.
- View total monthly spending.
- View total expense count and average monthly expense.
- View category-wise monthly spending breakdown.
- Responsive frontend interface.

## Technology Stack

| Component | Technology |
|---|---|
| Backend | Python, FastAPI |
| Database | SQLite |
| ORM | SQLAlchemy |
| Frontend | HTML, CSS, JavaScript |
| API Documentation | Swagger UI |

## Project Structure

```text
expense-tracker/
│
├── backend/
│   ├── __init__.py
│   ├── main.py
│   ├── database.py
│   ├── models.py
│   └── schemas.py
│
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── app.js
│
├── requirements.txt
├── .gitignore
└── README.md
```

## Installation and Setup

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/expense-tracker.git
cd expense-tracker
```

### 2. Create a virtual environment

```bash
python -m venv venv
```

### 3. Activate the virtual environment

For Windows PowerShell:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\venv\Scripts\Activate.ps1
```

### 4. Install dependencies

```bash
pip install -r requirements.txt
```

### 5. Start the application

```bash
uvicorn backend.main:app --reload
```

### 6. Open the application

Frontend:

http://127.0.0.1:8000

API documentation:

http://127.0.0.1:8000/docs

The SQLite database is automatically created when the application starts.

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/expenses` | Add an expense |
| GET | `/api/expenses` | Retrieve expenses |
| PUT | `/api/expenses/{expense_id}` | Update an expense |
| DELETE | `/api/expenses/{expense_id}` | Delete an expense |
| GET | `/api/summary/monthly` | Get monthly spending summary |

### Expense Filtering

The GET expenses endpoint supports:

- `category`
- `from_date`
- `to_date`
- `title`

## Database Note

This implementation uses SQLite for local database storage, with SQLAlchemy as the ORM. The database file is created automatically when the application runs.

## Testing

The following operations were tested successfully:

- Creating and retrieving expenses.
- Updating and deleting expenses.
- Searching and filtering expenses.
- Calculating monthly spending totals.
- Displaying category-wise spending summaries.

## Future Improvements

- MySQL database integration.
- User authentication.
- Monthly and yearly reports.
- Data visualization using charts.
