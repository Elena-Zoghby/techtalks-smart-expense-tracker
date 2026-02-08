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
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);

  // Fetch expenses
  useEffect(() => {
    const fetchExpenses = async () => {
      setLoading(true);
      try {
        const res = await fetch("http://localhost:3001/expenses");
        if (!res.ok) throw new Error("Failed to fetch expenses");
        setExpenses(await res.json());
      } catch (err: any) {
        alert(err.message);
      } finally {
        setLoading(false);
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
    if (!title || !amount || !date) return alert("Fill all required fields");
    if(Number(amount) <= 0) return alert("Amount must be positive");
    const newExpense = { title, amount: Number(amount), date, description, category };

    try {
      const res = await fetch("http://localhost:3001/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newExpense),
      });

      if (!res.ok) throw new Error("Failed to add expense");

      setExpenses([...expenses, await res.json()]);
      setTitle(""); setAmount(""); setDate(""); setDescription(""); setCategory("Food");
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleUpdate = async () => {
    if (!editing) return;
    if (editing.amount <= 0) {
    return alert("Amount must be greater than 0");
  }
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
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-6">
      <main className="w-full max-w-md bg-white p-6 rounded-lg shadow">

        <h1 className="text-2xl font-semibold mb-4 text-center text-black">
          Smart Expense Tracker
        </h1>

        {/* ===== SUMMARY SECTION ===== */}
        <div className="mb-6 p-4 bg-gray-100 rounded text-black">
          <p className="font-medium">Total Spending: ${totalExpenses.toFixed(2)}</p>
          <p className="font-medium">This Month: ${monthlyTotal.toFixed(2)}</p>
        </div>

        {/* Add Form */}
        <div className="flex flex-col gap-3 mb-6 text-black">
          <input type="text" placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} className="border p-2 rounded" />
          <input type="number" min="0.01" step="0.01" placeholder="Amount" value={amount} onChange={e => setAmount(e.target.value)} className="border p-2 rounded" />
          <input type="date" value={date} onChange={e => setDate(e.target.value)} className="border p-2 rounded" />
          <input type="text" placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} className="border p-2 rounded" />
          <select value={category} onChange={e => setCategory(e.target.value)} className="border p-2 rounded">
            {["Food","Transport","Bills","Entertainment","Shopping","Other"].map(c => <option key={c}>{c}</option>)}
          </select>
          <button onClick={handleAddExpense} disabled={loading} className="p-2 rounded text-white bg-black hover:bg-gray-800">
            Add Expense
          </button>
        </div>

        {/* List */}
        <h2 className="text-lg font-medium mb-3 text-black">Expense List</h2>
        {expenses.length === 0 ? <p>No expenses yet</p> : (
          <ul className="flex flex-col gap-2">
            {expenses.map(exp => (
              <li key={exp.id} className="flex justify-between items-center border p-2 rounded">
                <div>
                  <p className="font-medium text-black">{exp.title}</p>
                  <p className="text-sm text-gray-500">{exp.category}</p>
                </div>
                <span className="text-black">${exp.amount}</span>
                <span className="text-gray-500">{exp.date.split("T")[0]}</span>
                <div className="flex gap-1">
                  <button onClick={() => setEditing(exp)} className="bg-gray-200 text-black p-2 mr-1 rounded hover:bg-black hover:text-white">Edit</button>
                  <button onClick={() => handleDelete(exp.id)} className="bg-gray-200 text-black p-2 rounded hover:bg-black hover:text-white">Delete</button>
                </div>
              </li>
            ))}
          </ul>
        )}

        {/* Edit Form */}
        {editing && (
          <div className="mt-4 p-2 border rounded bg-gray-50">
            <input value={editing.title} onChange={e => setEditing({...editing, title: e.target.value})} className="border p-2 rounded mb-2 w-full" />
            <input type="number" min="0.01" step="0.01" placeholder="Amount" value={editing.amount} onChange={e => setEditing({...editing, amount: Number(e.target.value)})} className="border p-2 rounded mb-2 w-full" />
            <input type="date" value={editing.date.split("T")[0]} onChange={e => setEditing({...editing, date: e.target.value})} className="border p-2 rounded mb-2 w-full" />
            <button onClick={handleUpdate} className="bg-black text-white p-2 rounded w-full">Save</button>
          </div>
        )}

      </main>
    </div>
  );
}
