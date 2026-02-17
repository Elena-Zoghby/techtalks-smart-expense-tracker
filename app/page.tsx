"use client";
import { useState, useEffect, useMemo } from "react";
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
  const [budgetInput, setBudgetInput] = useState("");

  const [search, setSearch] = useState("");
  const [filterMode, setFilterMode] = useState<"all" | "byCategory">("all");
  const [filterCategory, setFilterCategory] = useState("All");

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

  // ✅ Dashboard calculations (single source of truth)
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  const remaining =
    budget !== null ? Math.max(budget - totalExpenses, 0) : 0;

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

  // Pie chart data
  const chartData = categories
    .map((cat) => ({
      name: cat,
      value: expenses
        .filter((e) => e.category === cat)
        .reduce((sum, e) => sum + e.amount, 0),
    }))
    .filter((data) => data.value > 0);

  useEffect(() => {
    if (editing) {
      setTitle(editing.title);
      setAmount(String(editing.amount));
      setDate(editing.date.split("T")[0]);
      setDescription(editing.description || "");
      setCategory(editing.category);
    }
  }, [editing]);

  const handleAddExpense = async () => {
    if (!title || !amount || !date) return alert("Fill all required fields");
    if (Number(amount) <= 0) return alert("Amount must be positive");

    setIsSubmitting(true);
    try {
      if (editing) {
        const res = await fetch(`${BASE_URL}/expenses/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, amount: Number(amount), date, description, category }),
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

      if (!res.ok) throw new Error("Failed to save budget");

      const data = await res.json();
      setBudget(data.amount);
      setBudgetInput("");
    } catch (err) {
      console.error(err);
      alert("Failed to save budget");
    }
  };

  const filteredExpenses = useMemo(() => {
    const q = search.trim().toLowerCase();

    return expenses.filter((exp) => {
      const matchesSearch =
        q.length === 0 || exp.title.toLowerCase().includes(q);

      const matchesCategory =
        filterMode === "all" ||
        filterCategory === "All" ||
        exp.category === filterCategory;

      return matchesSearch && matchesCategory;
    });
  }, [expenses, search, filterMode, filterCategory]);

  useEffect(() => {
    if (filterMode === "all") setFilterCategory("All");
  }, [filterMode]);

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-6 text-black">
      <main className="w-full max-w-md bg-white p-6 rounded-lg shadow-lg border border-gray-200">
        <h1 className="text-2xl font-bold text-center mb-4">Smart Expense Tracker</h1>

        {/* Dashboard */}
        <div className="mb-6 p-4 bg-gray-100 rounded space-y-1">
          <p className="font-medium">Total Spending: ${totalExpenses.toFixed(2)}</p>
          <p className="font-medium">Remaining Budget: ${remaining.toFixed(2)}</p>
          <p className="text-sm text-gray-600">Top Category: {topCategory}</p>
        </div>

        {/* Budget */}
        <div className="mb-4 p-4 bg-gray-100 rounded">
          <h2 className="font-medium mb-2">Monthly Budget</h2>
          <form onSubmit={handleBudget} className="flex gap-2">
            <input
              type="number"
              placeholder="Set budget"
              value={budgetInput}
              onChange={(e) => setBudgetInput(e.target.value)}
              className="border p-2 rounded flex-1"
            />
            <button type="submit" className="bg-black text-white px-4 rounded">
              Save
            </button>
          </form>
        </div>

        {/* Pie chart */}
        <div className="mb-6 p-4 bg-gray-100 rounded">
          <h2 className="font-medium mb-2">Expenses by Category</h2>
          <PieChart width={300} height={300}>
            <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
              {chartData.map((entry, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </div>

        {/* Add/Edit */}
        <div className="flex flex-col gap-3 mb-6">
          <input type="text" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} className="border p-2 rounded" />
          <input type="number" min="0.01" step="0.01" placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} className="border p-2 rounded" />
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="border p-2 rounded" />
          <input type="text" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} className="border p-2 rounded" />
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="border p-2 rounded bg-white">
            {categories.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
          <button onClick={handleAddExpense} disabled={isSubmitting} className="p-2 rounded text-white bg-black hover:bg-gray-800 disabled:bg-gray-400">
            {isSubmitting ? "Saving..." : editing ? "Update Expense" : "Add Expense"}
          </button>
        </div>
      </main>
    </div>
  );
}
