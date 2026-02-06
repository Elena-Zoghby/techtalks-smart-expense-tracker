import { NextApiRequest, NextApiResponse } from "next";

type Expense = {
  id: number;
  title: string;
  amount: number;
  date: string;
  description?: string;
  category: "Food" | "Transport" | "Bills" | "Entertainment" | "Shopping" | "Other";
};

let expenses: Expense[] = [];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    res.status(200).json(expenses);
  } else if (req.method === "POST") {
    const { title, amount, date, description, category } = req.body;

    // Validate required fields
    if (!title || amount === undefined || !date || !category) {
      return res.status(400).json({ message: "Missing fields" });
    }

    // Validate amount
    if (typeof amount !== "number" || isNaN(amount)) {
      return res.status(400).json({ message: "Amount must be a number" });
    }

    // Validate date
    if (isNaN(Date.parse(date))) {
      return res.status(400).json({ message: "Invalid date" });
    }

    // Validate category
    const validCategories = ["Food", "Transport", "Bills", "Entertainment", "Shopping", "Other"];
    if (!validCategories.includes(category)) {
      return res.status(400).json({ message: "Invalid category" });
    }

    const newExpense: Expense = {
      id: expenses.length + 1,
      title,
      amount,
      date,
      description: description || "",
      category,
    };

    expenses.push(newExpense);
    res.status(201).json(newExpense);
  } else {
    res.setHeader("Allow", ["GET", "POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
