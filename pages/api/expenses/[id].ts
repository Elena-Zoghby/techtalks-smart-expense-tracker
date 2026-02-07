// pages/api/expenses/[id].ts
import { NextApiRequest, NextApiResponse } from "next";
import { expenses } from "../expenses";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  const expenseIndex = expenses.findIndex((exp) => exp.id === id);
  if (expenseIndex === -1) return res.status(404).json({ message: "Expense not found" });

  if (req.method === "PUT") {
    const { title, amount, date, description, category } = req.body;
    if (!title || amount === undefined || !date || !category)
      return res.status(400).json({ message: "Missing fields" });

    expenses[expenseIndex] = { id: id as string, title, amount, date, description: description || "", category };
    return res.status(200).json(expenses[expenseIndex]);
  }

  if (req.method === "DELETE") {
    expenses.splice(expenseIndex, 1);
    return res.status(200).json({ message: "Expense deleted" });
  }

  res.setHeader("Allow", ["PUT", "DELETE"]);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
