"use client";

import { useState } from "react";

type Expense = {
  title: string;
  amount: number;
  date: string;
};

export default function Home() {
  // Mock initial data
  const [expenses, setExpenses] = useState<Expense[]>([
    { title: "Lunch", amount: 10, date: "2026-01-28" },
    { title: "Taxi", amount: 5, date: "2026-01-27" },
  ]);

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");

  const handleAddExpense = () => {
    if (!title || !amount || !date) {
      alert("Please fill all fields");
      return;
    }

    const newExpense: Expense = {
      title,
      amount: Number(amount),
      date,
    };

    setExpenses([...expenses, newExpense]);

    // Clear input fields
    setTitle("");
    setAmount("");
    setDate("");
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
            className="bg-black text-white p-2 rounded hover:bg-gray-800"
          >
            Add Expense
          </button>

        </div>

        {/* Expense List */}
        <div>
          <h2 className="text-lg font-medium mb-3">Expense List</h2>

          {expenses.length === 0 ? (
            <p className="text-gray-500">No expenses added yet.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {expenses.map((expense, index) => (
                <li
                  key={index}
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
