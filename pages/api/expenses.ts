import { NextApiRequest, NextApiResponse } from "next";

let expenses: { id: number; title: string; amount: number; date: string; description?: string }[] = [];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {

    res.status(200).json(expenses);
  } else if (req.method === "POST") {
    const { title, amount, date, description } = req.body;

    if (!title || amount === undefined || !date) {
      return res.status(400).json({ message: "Missing fields" });
    }

    if (typeof amount !== "number" || isNaN(amount)) {
      return res.status(400).json({ message: "Amount must be a number" });
    }

    if (isNaN(Date.parse(date))) {
      return res.status(400).json({ message: "Invalid date" });
    }

    const newExpense = {
      id: expenses.length + 1,
      title,
      amount,
      date,
      description: description || "", 
    };

    expenses.push(newExpense);
    res.status(201).json(newExpense);
  } else {
    res.setHeader("Allow", ["GET", "POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
