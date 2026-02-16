"use client";
import { useState, useEffect } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

type Expense = {
  id: string;
  title: string;
  amount: number;
  date: string;
  description?: string;
  category: string;
};

const categories = ["Food", "Transport", "Bills", "Entertainment", "Shopping", "Other"];
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AA00FF", "#FF3366"];
const BASE_URL = "http://localhost:3001";

export default function Home() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Food");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);

  const [budget, setBudget] = useState<number | null>(0);
  const [remainingBudget, setRemainingBudget] = useState<number | null>(0);
  const [budgetInput, setBudgetInput] = useState("");

  // Fetch expenses
  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const res = await fetch(`${BASE_URL}/expenses`);
        if (!res.ok) throw new Error("Failed to fetch expenses");
        const data = await res.json();
        setExpenses(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchExpenses();
  }, []);

  // Calculate dashboard stats
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const numExpenses = expenses.length;
  const topCategory = (() => {
    const totals: Record<string, number> = {};
    categories.forEach((cat) => {
      totals[cat] = expenses
        .filter((e) => e.category === cat)
        .reduce((sum, e) => sum + e.amount, 0);
    });
    const sorted = Object.entries(totals).sort((a, b) => b[1] - a[1]);
    return sorted[0] && sorted[0][1] > 0 ? sorted[0][0] : "None";
  })();
  const remaining = budget !== null ? Math.max(budget - totalExpenses, 0) : 0;

  // Pie chart data
  const chartData = categories
    .map((cat) => ({
      name: cat,
      value: expenses
        .filter((e) => e.category === cat)
        .reduce((sum, e) => sum + e.amount, 0),
    }))
    .filter((data) => data.value > 0);

  // Pre-fill form when editing
  useEffect(() => {
    if (editing) {
      setTitle(editing.title);
      setAmount(String(editing.amount));
      setDate(editing.date.split("T")[0]);
      setDescription(editing.description || "");
      setCategory(editing.category);
    }
  }, [editing]);

  // Add / Update Expense
  const handleAddExpense = async () => {
    if (!title || !amount || !date) return alert("Fill all required fields");
    if (Number(amount) <= 0) return alert("Amount must be positive");

    setIsSubmitting(true);
    try {
      if (editing) {
        const res = await fetch(`${BASE_URL}/expenses/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            amount: Number(amount),
            date,
            description,
            category,
          }),
        });
        if (!res.ok) throw new Error("Failed to update expense");
        const updated = await res.json();
        setExpenses((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
        setEditing(null);
      } else {
        const res = await fetch(`${BASE_URL}/expenses`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, amount: Number(amount), date, description, category }),
        });
        if (!res.ok) throw new Error("Failed to add expense");
        const newExp = await res.json();
        setExpenses((prev) => [...prev, newExp]);
      }

      // Reset form
      setTitle("");
      setAmount("");
      setDate("");
      setDescription("");
      setCategory("Food");
    } catch (err) {
      console.error(err);
      alert("Error saving expense");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`${BASE_URL}/expenses/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      setExpenses((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      console.error(err);
      alert("Error deleting expense");
    }
  };

  const handleBudget = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!budgetInput || Number(budgetInput) <= 0) return alert("Enter a valid budget");

    try {
      const method = budget === 0 || budget === null ? "POST" : "PUT";

      const res = await fetch(`${BASE_URL}/api/budget`, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: Number(budgetInput) }),
      });

      

      const data = await res.json();
      setBudget(data.amount);
      setRemainingBudget(data.amount - totalExpenses);
      setBudgetInput("");
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to save budget");
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-6 text-black">
      <main className="w-full max-w-md bg-white p-6 rounded-lg shadow-lg border border-gray-200">
        <h1 className="text-2xl font-bold text-center mb-4">Smart Expense Tracker</h1>

        {/* DASHBOARD CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          <div className="p-4 bg-gray-100 rounded shadow text-center">
            <p className="text-sm font-medium">Total Spent</p>
            <p className="text-lg font-bold">${totalExpenses.toFixed(2)}</p>
          </div>
          <div className="p-4 bg-gray-100 rounded shadow text-center">
            <p className="text-sm font-medium">Remaining Budget</p>
            <p className="text-lg font-bold">${remaining.toFixed(2)}</p>
          </div>
          <div className="p-4 bg-gray-100 rounded shadow text-center">
            <p className="text-sm font-medium">Monthly Budget</p>
            <p className="text-lg font-bold">${budget || 0}</p>
          </div>
          <div className="p-4 bg-gray-100 rounded shadow text-center">
            <p className="text-sm font-medium">Number of Expenses</p>
            <p className="text-lg font-bold">{numExpenses}</p>
          </div>
          <div className="p-4 bg-gray-100 rounded shadow text-center col-span-1 sm:col-span-2">
            <p className="text-sm font-medium">Top Category</p>
            <p className="text-lg font-bold">{topCategory}</p>
          </div>
        </div>

        {/* BUDGET */}
        <div className="mb-4 p-4 bg-gray-100 rounded">
          <h2 className="font-medium mb-2">Monthly Budget</h2>
          <form onSubmit={handleBudget} className="flex gap-2">
            <input
              type="number"
              placeholder="Set budget"
              value={budgetInput}
              onChange={(e) => setBudgetInput(e.target.value)}
              className="border p-2 mb-2 rounded flex-1"
            />
            <button type="submit" className="bg-black text-white px-4 mb-2 rounded">
              Save
            </button>
          </form>
          {budget !== null && <p className="mt-1 text-sm">Current Budget: ${budget}</p>}
          {remainingBudget !== null && <p className="mt-1 text-sm">Remaining: ${remainingBudget}</p>}
        </div>

        {/* PIE CHART */}
        <div className="mb-6 p-4 bg-gray-100 rounded">
          <h2 className="font-medium mb-2">Expenses by Category</h2>
          <PieChart width={300} height={300}>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </div>

        {/* ADD / EDIT EXPENSE FORM */}
        <div className="flex flex-col gap-3 mb-6">
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="border p-2 rounded"
          />
          <input
            type="number"
            min="0.01"
            step="0.01"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="border p-2 rounded"
          />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border p-2 rounded"
          />
          <input
            type="text"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="border p-2 rounded"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="border p-2 rounded bg-white"
          >
            {categories.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
          <button
            onClick={handleAddExpense}
            disabled={isSubmitting}
            className="p-2 rounded text-white bg-black hover:bg-gray-800 disabled:bg-gray-400"
          >
            {isSubmitting ? "Saving..." : editing ? "Update Expense" : "Add Expense"}
          </button>
        </div>

        {/* EXPENSE LIST */}
        <h2 className="text-lg font-semibold mb-3">Expense List</h2>
        {expenses.length === 0 ? (
          <p>No expenses yet</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {expenses.map((exp) => (
              <li
                key={exp.id}
                className="flex justify-between items-center border p-3 rounded-lg bg-gray-50 shadow-sm"
              >
                <div>
                  <p className="font-medium">{exp.title}</p>
                  <p className="text-xs text-gray-500">
                    {exp.category} • {exp.date.split("T")[0]}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold">${exp.amount}</span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setEditing(exp)}
                      className="text-xs bg-gray-200 p-1 rounded hover:bg-black hover:text-white"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(exp.id)}
                      className="text-xs bg-gray-200 p-1 rounded hover:bg-red-500 hover:text-white"
                    >
                      Del
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
