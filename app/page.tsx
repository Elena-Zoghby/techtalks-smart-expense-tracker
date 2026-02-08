"use client";
import { useState, useEffect } from "react";

type Expense = {
  id: string;
  title: string;
  amount: number;
  date: string;
  description?: string;
  category: string;
};

export default function Home() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Food");
  const [isFetching, setIsFetching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [error, setError] = useState("");

  // Fetch expenses
  useEffect(() => {
    const fetchExpenses = async () => {
      setIsFetching(true);
      try {
        const res = await fetch("http://localhost:3001/expenses");
        if (!res.ok) throw new Error("Failed to fetch expenses");
        const data = await res.json();
        setExpenses(data);
      } catch (err: any) {
        setError("Failed to load expenses. Please refresh the page.");
      } finally {
        setIsFetching(false);
      }
    };
    fetchExpenses();
  }, []);

  // ===== SUMMARY CALCULATIONS =====
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const monthlyTotal = expenses
    .filter(exp => {
      const d = new Date(exp.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    })
    .reduce((sum, exp) => sum + exp.amount, 0);

  // Add expense
  const handleAddExpense = async () => {
    setError("");
    if (!title || !amount || !date) return setError("Fill all required fields");
    if (Number(amount) <= 0) return setError("Amount must be positive");

    const selectedDate = new Date(date);
    const today = new Date();
    selectedDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    if (selectedDate > today) return setError("Date cannot be in the future");

    setIsSubmitting(true);
    const newExpense = { title, amount: Number(amount), date, description, category };

    try {
      const res = await fetch("http://localhost:3001/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newExpense),
      });

      if (!res.ok) throw new Error("Failed to add expense");

      const savedExpense = await res.json();
      setExpenses((prev) => [...prev, savedExpense]);
      setTitle(""); setAmount(""); setDate(""); setDescription(""); setCategory("Food");
    } catch {
      setError("Failed to add expense. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async () => {
    if (!editing) return;
    if (editing.amount <= 0) return alert("Amount must be greater than 0");

    try {
      const res = await fetch(`http://localhost:3001/expenses/${editing.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editing),
      });

      if (!res.ok) throw new Error("Failed to update");

      const updated = await res.json();
      setExpenses(expenses.map(e => e.id === updated.id ? updated : e));
      setEditing(null);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:3001/expenses/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      setExpenses(expenses.filter(e => e.id !== id));
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-6 text-black">
      <main className="w-full max-w-md bg-white p-6 rounded-lg shadow-lg border border-gray-200">
        
        <h1 className="text-2xl font-bold text-center mb-4">Smart Expense Tracker</h1>

        {/* SUMMARY SECTION */}
        <div className="mb-6 p-4 bg-gray-100 rounded">
          <p className="font-medium">Total Spending: ${totalExpenses.toFixed(2)}</p>
          <p className="font-medium">This Month: ${monthlyTotal.toFixed(2)}</p>
        </div>

        {/* Form */}
        <div className="flex flex-col gap-3 mb-6">
          <input type="text" placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} className="border p-2 rounded" />
          <input type="number" min="0.01" step="0.01" placeholder="Amount" value={amount} onChange={e => setAmount(e.target.value)} className="border p-2 rounded" />
          <input type="date" value={date} onChange={e => setDate(e.target.value)} className="border p-2 rounded" />
          <input type="text" placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} className="border p-2 rounded" />
          <select value={category} onChange={e => setCategory(e.target.value)} className="border p-2 rounded bg-white">
            {["Food","Transport","Bills","Entertainment","Shopping","Other"].map(c => <option key={c}>{c}</option>)}
          </select>
          
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <button onClick={handleAddExpense} disabled={isSubmitting} className="p-2 rounded text-white bg-black hover:bg-gray-800 disabled:bg-gray-400">
            {isSubmitting ? "Saving..." : "Add Expense"}
          </button>
        </div>

        {/* List */}
        <h2 className="text-lg font-semibold mb-3">Expense List</h2>
        {isFetching ? <p className="text-center text-gray-500">Loading...</p> : expenses.length === 0 ? <p>No expenses yet</p> : (
          <ul className="flex flex-col gap-2">
            {expenses.map(exp => (
              <li key={exp.id} className="flex justify-between items-center border p-3 rounded-lg bg-gray-50 shadow-sm">
                <div>
                  <p className="font-medium">{exp.title}</p>
                  <p className="text-xs text-gray-500">{exp.category} • {exp.date.split("T")[0]}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold">${exp.amount}</span>
                  <div className="flex gap-1">
                    <button onClick={() => setEditing(exp)} className="text-xs bg-gray-200 p-1 rounded hover:bg-black hover:text-white">Edit</button>
                    <button onClick={() => handleDelete(exp.id)} className="text-xs bg-gray-200 p-1 rounded hover:bg-red-500 hover:text-white">Del</button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}

        {/* Edit Modal/Form */}
        {editing && (
          <div className="mt-6 p-4 border-2 border-black rounded bg-gray-50">
            <h3 className="font-bold mb-2 text-sm">Editing Expense</h3>
            <input value={editing.title} onChange={e => setEditing({...editing, title: e.target.value})} className="border p-2 rounded mb-2 w-full text-sm" />
            <input type="number" min="0.01" step="0.01" value={editing.amount} onChange={e => setEditing({...editing, amount: Number(e.target.value)})} className="border p-2 rounded mb-2 w-full text-sm" />
            <input type="date" value={editing.date.split("T")[0]} onChange={e => setEditing({...editing, date: e.target.value})} className="border p-2 rounded mb-2 w-full text-sm" />
            <div className="flex gap-2">
              <button onClick={handleUpdate} className="bg-black text-white p-2 rounded w-full text-sm">Update</button>
              <button onClick={() => setEditing(null)} className="bg-gray-300 p-2 rounded w-full text-sm">Cancel</button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}