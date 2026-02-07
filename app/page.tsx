"use client";
import { useState, useEffect } from "react";

type Expense = {
  id: string; // must match backend
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

  // Add expense
  const handleAddExpense = async () => {
    if (!title || !amount || !date) return alert("Fill all required fields");

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

  try {
    const res = await fetch(`http://localhost:3001/expenses/${editing.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: editing.title,
        amount: editing.amount,
        date: editing.date,
        description: editing.description,
        category: editing.category
      }),
    });
    
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Failed to update: ${errorText}`);
    }
    
    const updated = await res.json();
    
    setExpenses(expenses.map(exp => exp.id === updated.id ? updated : exp));
    setEditing(null);
  } catch (err: any) {
    alert(err.message);
  }
};

const handleDelete = async (id: string) => {

  try {
    const res = await fetch(`http://localhost:3001/expenses/${id}`, { 
      method: "DELETE" 
    });
    
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Failed to delete: ${errorText}`);
    }
    
    setExpenses(expenses.filter(exp => exp.id !== id));
  } catch (err: any) {
    alert(err.message);
  }
};

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-6">
      <main className="w-full max-w-md bg-white p-6 rounded-lg shadow">
        <h1 className="text-2xl font-semibold mb-4 text-center text-black">Smart Expense Tracker</h1>

        {/* Add Form */}
        <div className="flex flex-col gap-3 mb-6 text-black">
          <input type="text" placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} className="border p-2 rounded" />
          <input type="number" placeholder="Amount" value={amount} onChange={e => setAmount(e.target.value)} className="border p-2 rounded" />
          <input type="date" value={date} onChange={e => setDate(e.target.value)} className="border p-2 rounded" />
          <input type="text" placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} className="border p-2 rounded" />
          <select value={category} onChange={e => setCategory(e.target.value)} className="border p-2 rounded">
            {["Food","Transport","Bills","Entertainment","Shopping","Other"].map(c => <option key={c}>{c}</option>)}
          </select>
          <button onClick={handleAddExpense} disabled={loading} className={`p-2 rounded text-white ${loading ? "bg-gray-400":"bg-black hover:bg-gray-800"}`}>Add Expense</button>
        </div>

        {/* List */}
        <div>
          <h2 className="text-lg font-medium mb-3 text-black">Expense List</h2>
          {loading ? <p>Loading...</p> : expenses.length === 0 ? <p>No expenses yet</p> : (
            <ul className="flex flex-col gap-2">
              {expenses.map(exp => (
                <li key={exp.id} className="flex justify-between items-center border p-2 rounded">
                  <div className="flex flex-col">
                    <span className="font-medium text-black">{exp.title}</span>
                    <span className="text-gray-500 text-sm">{exp.category}</span>
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
        </div>

        {/* Edit Form */}
        {editing && (
          <div className="mt-4 p-2 border rounded bg-gray-50">
            <h3 className="font-medium text-black mb-2">Edit Expense</h3>
            <input type="text" value={editing.title} onChange={e => setEditing({...editing, title: e.target.value})} className="border p-2 rounded mb-2 w-full text-black" />
            <input type="number" value={editing.amount} onChange={e => setEditing({...editing, amount: Number(e.target.value)})} className="border p-2 rounded mb-2 w-full text-black" />
            <input type="date" value={editing.date.split("T")[0]} onChange={e => setEditing({...editing, date: e.target.value})} className="border p-2 rounded mb-2 w-full text-black" />
            <input type="text" value={editing.description || ""} onChange={e => setEditing({...editing, description: e.target.value})} className="border p-2 rounded mb-2 w-full text-black" />
            <select value={editing.category} onChange={e => setEditing({...editing, category: e.target.value})} className="border p-2 rounded mb-2 w-full text-black">
              {["Food","Transport","Bills","Entertainment","Shopping","Other"].map(c => <option key={c}>{c}</option>)}
            </select>
            <div className="flex gap-2">
              <button onClick={handleUpdate} className="bg-gray-200 text-black p-2 rounded hover:bg-black hover:text-white">Save</button>
              <button onClick={() => setEditing(null)} className="bg-gray-200 text-black p-2 rounded hover:bg-black hover:text-white">Cancel</button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
