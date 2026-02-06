"use client";

import { useState, useEffect } from "react";

type Expense = {
  id: number;
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

  // Fetch expenses on page load
  useEffect(() => {
    const fetchExpenses = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/expenses");
        if (!res.ok) throw new Error("Failed to fetch expenses");
        const data = await res.json();
        setExpenses(data);
      } catch (err: any) {
        console.error(err.message);
        alert("Failed to load expenses");
      } finally {
        setLoading(false);
      }
    };
    fetchExpenses();
  }, []);

  // Add new expense
  const handleAddExpense = async () => {
    if (!title || !amount || !date) {
      alert("Please fill all required fields");
      return;
    }

    const newExpense = {
      title,
      amount: Number(amount),
      date,
      description,
      category,
    };

    try {
      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newExpense),
      });

      if (!res.ok) {
        const error = await res.json();
        alert("Error: " + error.message);
        return;
      }

      const savedExpense: Expense = await res.json();
      setExpenses([...expenses, savedExpense]);

      setTitle("");
      setAmount("");
      setDate("");
      setDescription("");
      setCategory("Food");
    } catch (err: any) {
      console.error(err.message);
      alert("Failed to add expense");
    }
  };

  // Delete expense
  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`/api/expenses/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");

      setExpenses((prev) => prev.filter((exp) => exp.id !== id));
    } catch (err: any) {
      console.error(err.message);
      alert("Failed to delete expense");
    }
  };

  // Update expense
  const handleUpdate = async () => {
    if (!editing) return;

    try {
      const res = await fetch(`/api/expenses/${editing.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editing),
      });

      if (!res.ok) throw new Error("Failed to update");

      const updatedExpense = await res.json();
      setExpenses((prev) =>
        prev.map((exp) => (exp.id === updatedExpense.id ? updatedExpense : exp))
      );

      setEditing(null);
    } catch (err: any) {
      console.error(err.message);
      alert("Failed to update expense");
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-6">
      <main className="w-full max-w-md bg-white p-6 rounded-lg shadow">
        <h1 className="text-2xl font-semibold mb-4 text-center text-black">
          Smart Expense Tracker
        </h1>

        {/* Add Expense Form */}
        <div className="flex flex-col gap-3 mb-6 text-black">
          <input
            type="text"
            placeholder="Expense Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="border p-2 rounded"
          />
          <input
            type="number"
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
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="border p-2 rounded"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="border p-2 rounded"
          >
            <option>Food</option>
            <option>Transport</option>
            <option>Bills</option>
            <option>Entertainment</option>
            <option>Shopping</option>
            <option>Other</option>
          </select>
          <button
            onClick={handleAddExpense}
            disabled={loading}
            className={`p-2 rounded text-white ${
              loading ? "bg-gray-400" : "bg-black hover:bg-gray-800"
            }`}
          >
            Add Expense
          </button>
        </div>

        {/* Expense List */}
        <div>
          <h2 className="text-lg font-medium mb-3 text-black">Expense List</h2>

          {loading ? (
            <p className="text-gray-500">Loading...</p>
          ) : expenses.length === 0 ? (
            <p className="text-gray-500">No expenses added yet.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {expenses.map((expense) => (
                <li
                  key={expense.id}
                  className="flex justify-between items-center border p-2 rounded"
                >
                  <div className="flex flex-col">
                    <span className="font-medium text-black">{expense.title}</span>
                    <span className="text-gray-500 text-sm">{expense.category}</span>
                  </div>
                  <span>${expense.amount}</span>
                  <span className="text-gray-500">{expense.date}</span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setEditing(expense)}
                      className="bg-gray-200 text-black p-2 mr-1 rounded cursor-pointer hover:bg-black hover:text-white transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(expense.id)}
                      className="bg-gray-200 text-black p-2 rounded cursor-pointer hover:bg-black hover:text-white transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Edit Expense Form */}
        {editing && (
          <div className="mt-4 p-2 border rounded bg-gray-50">
            <h3 className="font-medium text-black mb-2">Edit Expense</h3>
            <input
              type="text"
              placeholder="Title"
              value={editing.title}
              onChange={(e) => setEditing({ ...editing, title: e.target.value })}
              className="border p-2 rounded mb-2 w-full text-black"
            />
            <input
              type="number"
              placeholder="Amount"
              value={editing.amount}
              onChange={(e) =>
                setEditing({ ...editing, amount: Number(e.target.value) })
              }
              className="border p-2 rounded mb-2 w-full text-black"
            />
            <input
              type="date"
              value={editing.date}
              onChange={(e) => setEditing({ ...editing, date: e.target.value })}
              className="border p-2 rounded mb-2 w-full text-black"
            />
            <input
              type="text"
              placeholder="Description"
              value={editing.description || ""}
              onChange={(e) =>
                setEditing({ ...editing, description: e.target.value })
              }
              className="border p-2 rounded mb-2 w-full text-black"
            />
            <select
              value={editing.category}
              onChange={(e) =>
                setEditing({ ...editing, category: e.target.value })
              }
              className="border p-2 rounded mb-2 w-full text-black"
            >
              <option>Food</option>
              <option>Transport</option>
              <option>Bills</option>
              <option>Entertainment</option>
              <option>Shopping</option>
              <option>Other</option>
            </select>
            <div className="flex gap-2">
              <button
                onClick={handleUpdate}
                className="bg-gray-200 text-black p-2 rounded cursor-pointer hover:bg-black hover:text-white transition-colors"
              >
                Save
              </button>
              <button
                onClick={() => setEditing(null)}
                className="bg-gray-200 text-black p-2 rounded cursor-pointer hover:bg-black hover:text-white transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
