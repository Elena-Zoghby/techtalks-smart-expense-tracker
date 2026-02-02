"use client";

import { useState, useEffect } from "react";

type Expense = {
  id: number;
  title: string;
  amount: number;
  date: string;
  description?: string;
};

export default function Home() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch expenses from backend on page load
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

  // Handle submitting new expense to backend
  const handleAddExpense = async () => {
    if (!title || !amount || !date) {
      alert("Please fill all fields");
      return;
    }

    const newExpense = { title, amount: Number(amount), date };

    try {
      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newExpense),
      });

      if (!res.ok) throw new Error("Failed to add expense");

      const savedExpense = await res.json();
      setExpenses(prev => [...prev, savedExpense]);

      // Clear input fields
      setTitle("");
      setAmount("");
      setDate("");
    } catch (err: any) {
      console.error(err.message);
      alert("Failed to add expense");
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-6">
      <main className="w-full max-w-md bg-white p-6 rounded-lg shadow">
        {/* Page Title */}
        <h1 className="text-2xl font-semibold mb-4 text-center">
          Smart Expense Tracker
        </h1>

        {/* Expense Form */}
        <div className="flex flex-col gap-3 mb-6">
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
          <button
            onClick={handleAddExpense}
            disabled={loading}
            className={`p-2 rounded text-white ${loading ? "bg-gray-400" : "bg-black hover:bg-gray-800"}`}
          >
            Add Expense
          </button>
        </div>

        {/* Expense List */}
        <div>
          <h2 className="text-lg font-medium mb-3">Expense List</h2>

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
                  <span className="font-medium">{expense.title}</span>
                  <span>${expense.amount}</span>
                  <span className="text-gray-500">{expense.date}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}
