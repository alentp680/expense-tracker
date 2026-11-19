
const API = "/api/expenses";
const $ = id => document.getElementById(id);
let editingId = null;

const categories = ["Food", "Transport", "Shopping", "Bills", "Entertainment", "Others"];

function localDate() {
    const now = new Date();
    return new Date(now.getTime() - now.getTimezoneOffset() * 60000)
        .toISOString().split("T")[0];
}

function money(value) {
    return Number(value || 0).toLocaleString("en-IN", {
        style: "currency", currency: "INR"
    });
}

function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    })[char]);
}

async function loadExpenses() {
    try {
        const fromDate = $("fromDate").value;
        const toDate = $("toDate").value;

        // Validate date range
        if (fromDate && toDate && fromDate > toDate) {
            $("expenseTable").innerHTML = `
                <tr>
                    <td colspan="6" class="empty">
                        From date cannot be later than To date.
                    </td>
                </tr>`;
            return;
        }

        const params = new URLSearchParams();

        table.innerHTML = expenses.map(e => `
            <tr>
                <td><strong>${escapeHTML(e.title)}</strong></td>
                <td>${money(e.amount)}</td>
                <td><span class="badge">${escapeHTML(e.category)}</span></td>
                <td>${escapeHTML(e.date)}</td>
                <td>${escapeHTML(e.note || "-")}</td>
                <td><div class="actions">
                    <button class="btn-edit" data-action="edit" data-id="${e.id}">Edit</button>
                    <button class="btn-delete" data-action="delete" data-id="${e.id}">Delete</button>
                </div></td>
            </tr>`).join("");
    } catch (error) {
        console.error(error);
        alert(error.message);
    }
}

async function loadSummary() {
    try {
        const [summaryResponse, expensesResponse] = await Promise.all([
            fetch("/api/summary/monthly"), fetch(API)
        ]);

        if (!summaryResponse.ok || !expensesResponse.ok)
            throw new Error("Unable to load summary");

        const summary = await summaryResponse.json();
        const expenses = await expensesResponse.json();
        const month = localDate().substring(0, 7);

        const monthly = expenses.filter(e => e.date.startsWith(month));

        $("totalSpent").textContent = money(summary.total_spent);
        $("expenseCount").textContent = expenses.length;
        $("averageExpense").textContent = money(
            monthly.length ? summary.total_spent / monthly.length : 0
        );

        $("categoryBreakdown").innerHTML = categories.map(category => {
            const amount = summary.category_breakdown[category] || 0;
            const percentage = summary.total_spent
                ? amount / summary.total_spent * 100 : 0;

            return `<div class="category-item">
                <div class="category-top">
                    <strong>${category}</strong><span>${money(amount)}</span>
                </div>
                <div class="progress">
                    <div class="progress-fill" style="width:${percentage}%"></div>
                </div>
            </div>`;
        }).join("");
    } catch (error) {
        console.error(error);
        alert(error.message);
    }
}

async function refreshDashboard() {
    await Promise.all([loadExpenses(), loadSummary()]);
}

function resetForm() {
    $("expenseForm").reset();
    $("date").value = localDate();
    editingId = null;
    $("formHeading").textContent = "Add New Expense";
    $("submitBtn").textContent = "Add Expense";
    $("cancelEdit").hidden = true;
}

$("expenseForm").addEventListener("submit", async event => {
    event.preventDefault();

    const expense = {
        title: $("title").value.trim(),
        amount: Number($("amount").value),
        category: $("category").value,
        date: $("date").value,
        note: $("note").value.trim() || null
    };

    if (!expense.title || expense.amount <= 0 ||
        !categories.includes(expense.category) || !expense.date) {
        alert("Please enter valid expense details.");
        return;
    }

    try {
        const response = await fetch(editingId ? `${API}/${editingId}` : API, {
            method: editingId ? "PUT" : "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(expense)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || "Unable to save expense");
        }

        alert(editingId ? "Expense updated!" : "Expense added!");
        resetForm();
        await refreshDashboard();
    } catch (error) {
        alert(error.message);
    }
});

async function editExpense(id) {
    try {
        const response = await fetch(API);
        if (!response.ok) throw new Error("Unable to fetch expenses");

        const expenses = await response.json();
        const expense = expenses.find(e => e.id === Number(id));
        if (!expense) throw new Error("Expense not found");

        editingId = expense.id;
        $("title").value = expense.title;
        $("amount").value = expense.amount;
        $("category").value = expense.category;
        $("date").value = expense.date;
        $("note").value = expense.note || "";

        $("formHeading").textContent = "Edit Expense";
        $("submitBtn").textContent = "Update Expense";
        $("cancelEdit").hidden = false;
        window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
        alert(error.message);
    }
}

async function deleteExpense(id) {
    if (!confirm("Are you sure you want to delete this expense?")) return;

    try {
        const response = await fetch(`${API}/${id}`, { method: "DELETE" });
        if (!response.ok) throw new Error("Unable to delete expense");
        await refreshDashboard();
    } catch (error) {
        alert(error.message);
    }
}

$("expenseTable").addEventListener("click", event => {
    const button = event.target.closest("button[data-action]");
    if (!button) return;

    if (button.dataset.action === "edit") editExpense(button.dataset.id);
    if (button.dataset.action === "delete") deleteExpense(button.dataset.id);
});

$("cancelEdit").addEventListener("click", resetForm);

$("clearFilters").addEventListener("click", () => {
    ["searchTitle", "filterCategory", "fromDate", "toDate"]
        .forEach(id => $(id).value = "");
    loadExpenses();
});

["searchTitle", "filterCategory", "fromDate", "toDate"].forEach(id => {
    $(id).addEventListener(id === "searchTitle" ? "input" : "change", loadExpenses);
});

$("currentDate").textContent = new Date().toLocaleDateString("en-IN", {
    day: "numeric", month: "long", year: "numeric"
});

$("date").value = localDate();
refreshDashboard();
