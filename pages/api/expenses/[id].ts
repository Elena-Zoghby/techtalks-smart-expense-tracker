import { NextApiRequest, NextApiResponse } from "next";
import { expenses } from "../expenses"; 

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const expenseId = Number(id);

  const index = expenses.findIndex(exp => exp.id === expenseId);
  if (index === -1) {
    return res.status(404).json({ message: "Expense not found" });
  }

  if (req.method === "PUT") {
    const { title, amount, date, description, category } = req.body;

    if (!title || amount === undefined || !date || !category) {
      return res.status(400).json({ message: "Missing fields" });
    }

    expenses[index] = {
      id: expenseId,
      title,
      amount,
      date,
      description: description || "",
      category,
    };

    return res.status(200).json(expenses[index]);
  }

  if (req.method === "DELETE") {
    expenses.splice(index, 1);
    return res.status(200).json({ message: "Expense deleted" });
  }

  res.setHeader("Allow", ["PUT", "DELETE"]);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
