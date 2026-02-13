// pages/api/expenses/stats.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { Expense, expenses } from "../expenses"; // Make sure this path is correct

type StatsResponse = {
  budget: number;
  remainingBudget: number;
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<StatsResponse | { message: string }>
) {
  if (req.method === "GET") {
    try {
      const totalBudget = 0; // default budget, can integrate later
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();

      const monthlyTotal = expenses
        .filter((e: Expense) => {
          const d = new Date(e.date);
          return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        })
        .reduce((sum, e) => sum + e.amount, 0);

      res.status(200).json({
        budget: totalBudget,
        remainingBudget: totalBudget - monthlyTotal,
      });
    } catch (err) {
      res.status(500).json({ message: "Failed to calculate stats" });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}