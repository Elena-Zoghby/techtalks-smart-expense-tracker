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

  const [isFetching, setIsFetching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Fetch expenses
  useEffect(() => {
    const fetchExpenses = async () => {
      setIsFetching(true);
      try {
        const res = await fetch("/api/expenses");
        if (!res.ok) throw new Error("Failed to fetch expenses");
        const data = await res.json();
        setExpenses(data);
      } catch {
        setError("Failed to load expenses. Please refresh the page.");
      } finally {
        setIsFetching(false);
      }
    };

    fetchExpenses();
  }, []);

  // Add expense
  const handleAddExpense = async () => {
    setError("");

    if (!title || !amount || !date) {
      setError("All fields are required");
      return;
    }

    if (Number(amount) <= 0) {
      setError("Amount must be greater than 0");
      return;
    }

    const selectedDate = new Date(date);
    const today = new Date();

    if (isNaN(selectedDate.getTime())) {
      setError("Please enter a valid date");
      return;
    }

    selectedDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    if (selectedDate > today) {
      setError("Date cannot be in the future");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          amount: Number(amount),
          date,
        }),
      });

      if (!res.ok) throw new Error("Failed to add expense");

      const savedExpense = await res.json();
      setExpenses((prev) => [...prev, savedExpense]);

      setTitle("");
      setAmount("");
      setDate("");
    } catch {
      setError("Failed to add expense. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <main className="w-full max-w-md bg-white p-6 rounded-lg shadow-lg border border-gray-200 space-y-6">
        
        <h1 className="text-2xl font-bold text-center text-gray-800">
          Smart Expense Tracker
        </h1>

        {/* Form */}
        <div className="flex flex-col gap-4">

          {/* Title Input */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Expense Title</label>
            <input
              type="text"
              placeholder="e.g. Groceries, Transportation"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-white border border-gray-400 p-2 rounded 
                         text-gray-800 placeholder-gray-500
                         focus:outline-none focus:ring-2 focus:ring-black transition"
            />
          </div>

          {/* Amount Input */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Amount ($)</label>
            <input
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="bg-white border border-gray-400 p-2 rounded 
                         text-gray-800 placeholder-gray-500
                         focus:outline-none focus:ring-2 focus:ring-black transition"
            />
          </div>

          {/* Date Input */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-white border border-gray-400 p-2 rounded
                         text-gray-800 placeholder-gray-500
                         focus:outline-none focus:ring-2 focus:ring-black transition"
            />
          </div>

          {/* Error Display */}
          {error && (
            <p className="text-red-500 text-sm text-center mt-1">{error}</p>
          )}

          {/* Submit Button */}
          <button
            onClick={handleAddExpense}
            disabled={isSubmitting}
            className={`p-2 rounded text-white font-medium transition ${
              isSubmitting
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-black hover:bg-gray-800"
            }`}
          >
            {isSubmitting ? "Saving..." : "Add Expense"}
          </button>
        </div>

        {/* Expense List */}
        <div>
          <h2 className="text-lg font-semibold text-gray-700 mb-3">Expense List</h2>

          {isFetching ? (
            <p className="text-gray-500 text-center">Loading expenses...</p>
          ) : expenses.length === 0 ? (
            <p className="text-gray-500 text-center">
              No expenses yet. Start by adding one 💸
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {expenses.map((expense) => (
                <li
                  key={expense.id}
                  className="flex justify-between items-center border border-gray-200 
                             p-3 rounded-lg shadow-sm bg-gray-50"
                >
                  <span className="font-medium text-gray-800">{expense.title}</span>
                  <span className="font-semibold text-gray-900">${expense.amount}</span>
                  <span className="text-xs text-gray-500">{expense.date}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

      </main>
    </div>
  );
}
