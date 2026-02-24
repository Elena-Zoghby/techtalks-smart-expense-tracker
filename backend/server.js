import Expense from "./models/expense.js";
import Budget from "./models/budget.js";
import mongoose from "mongoose";
import express from "express";
import cors from "cors";
import PDFDocument from "pdfkit";
import dotenv from "dotenv";

dotenv.config({ path: ".env" });

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:3000",
  })
);

const port = 3001;
const mongoURI = process.env.MONGO_URI;

if (!mongoURI) {
  console.error("❌ ERROR: MONGODB_URI is not defined in your .env file!");
} else {
  mongoose
    .connect(mongoURI)
    .then(() => console.log("✅ SUCCESS: We are connected to MongoDB!"))
    .catch((err) => console.error("❌ ERROR: Connection failed:", err));
}

app.get("/health", (req, res) => {
  res.send({ status: "Server is running!" });
});

app.get("/expenses", async (req, res) => {
  try {
    const expenses = await Expense.find().sort({ date: -1 });

    const responseData = expenses.map((exp) => ({
      id: exp._id,
      title: exp.title,
      amount: exp.amount,
      date: exp.date,
      category: exp.category,
      description: exp.description,
      createdAt: exp.createdAt,
      updatedAt: exp.updatedAt,
    }));

    res.json(responseData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/expenses", async (req, res) => {
  try {
    const { title, amount, date, category, description } = req.body;

    if (!title || !amount || !date || !category) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const expense = new Expense({
      title,
      amount,
      date,
      category,
      description: description || "",
    });

    const saved = await expense.save();

    res.status(201).json({
      id: saved._id,
      title: saved.title,
      amount: saved.amount,
      date: saved.date,
      category: saved.category,
      description: saved.description,
      createdAt: saved.createdAt,
      updatedAt: saved.updatedAt,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/expenses/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title, amount, date, description, category } = req.body;

    if (!title || !amount || !date || !category) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid expense ID format" });
    }

    const updatedExpense = await Expense.findByIdAndUpdate(
      id,
      {
        title,
        amount: Number(amount),
        date: new Date(date),
        description: description || "",
        category,
      },
      { new: true, runValidators: true }
    );

    if (!updatedExpense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    res.json({
      id: updatedExpense._id,
      title: updatedExpense.title,
      amount: updatedExpense.amount,
      date: updatedExpense.date,
      description: updatedExpense.description,
      category: updatedExpense.category,
      createdAt: updatedExpense.createdAt,
      updatedAt: updatedExpense.updatedAt,
    });
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.delete("/expenses/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid expense ID format" });
    }

    const deletedExpense = await Expense.findByIdAndDelete(id);

    if (!deletedExpense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    res.json({ message: "Expense deleted successfully", id: deletedExpense._id });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/budget", async (req, res) => {
  try {
    const month = new Date().toISOString().slice(0, 7);
    const budget = await Budget.findOne({ month });
    res.json(budget);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post("/api/budget", async (req, res) => {
  try {
    const month = new Date().toISOString().slice(0, 7);

    const existing = await Budget.findOne({ month });
    if (existing) {
      return res.status(400).json({ message: "Budget already exists for this month" });
    }

    const amount = Number(req.body.amount);

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid budget amount" });
    }

    const budget = new Budget({
      month,
      amount,
    });

    await budget.save();
    res.status(201).json(budget);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.put("/api/budget", async (req, res) => {
  try {
    const month = new Date().toISOString().slice(0, 7);
    const amount = Number(req.body.amount);

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid budget amount" });
    }

    const updated = await Budget.findOneAndUpdate(
      { month },
      { amount },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "No budget found for this month" });
    }

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get("/api/expenses/stats", async (req, res) => {
  try {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const endOfMonth = new Date(startOfMonth);
    endOfMonth.setMonth(endOfMonth.getMonth() + 1);

    const expenses = await Expense.find({
      date: { $gte: startOfMonth, $lt: endOfMonth },
    });

    const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const expensesCount = expenses.length;

    const categoryTotals = {};
    expenses.forEach((exp) => {
      if (categoryTotals[exp.category]) {
        categoryTotals[exp.category] += exp.amount;
      } else {
        categoryTotals[exp.category] = exp.amount;
      }
    });

    const month = new Date().toISOString().slice(0, 7);
    const budget = await Budget.findOne({ month });

    const remainingBudget = budget ? budget.amount - totalSpent : null;

    res.json({
      totalSpent,
      remainingBudget,
      expensesCount,
      categoryTotals,
      budget: budget ? budget.amount : 0,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get("/api/expenses/export-pdf", async (req, res) => {
  try {
    const now = new Date();
    const monthLabel = now.toLocaleString("en-US", {
      month: "long",
      year: "numeric",
    });
    const year = now.getFullYear();
    const monthIndex = now.getMonth();

    const startOfMonth = new Date(year, monthIndex, 1, 0, 0, 0, 0);
    const endOfMonth = new Date(year, monthIndex + 1, 1, 0, 0, 0, 0);

    const expenses = await Expense.find({
      date: { $gte: startOfMonth, $lt: endOfMonth },
    }).sort({ date: 1 });

    const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);

    const categoryTotals = {};
    expenses.forEach((exp) => {
      if (categoryTotals[exp.category]) {
        categoryTotals[exp.category] += exp.amount;
      } else {
        categoryTotals[exp.category] = exp.amount;
      }
    });

    const currentMonthKey = now.toISOString().slice(0, 7);
    const budget = await Budget.findOne({ month: currentMonthKey });
    const budgetAmount = budget ? budget.amount : null;
    const remainingBudget =
      budgetAmount != null ? budgetAmount - totalSpent : null;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="expenses-${currentMonthKey}.pdf"`
    );

    const doc = new PDFDocument({ margin: 40 });
    doc.pipe(res);

    doc.fontSize(20).text("Smart Expense Tracker - Monthly Report", {
      align: "center",
    });
    doc.moveDown();

    doc.fontSize(12).text(`Month: ${monthLabel}`);
    doc.moveDown(0.5);

    doc.fontSize(14).text("Summary");
    doc.moveDown(0.3);
    doc.fontSize(12).text(`Total expenses: $${totalSpent.toFixed(2)}`);

    if (budgetAmount != null) {
      doc.text(`Budget: $${budgetAmount.toFixed(2)}`);
      doc.text(
        `Remaining budget: ${
          remainingBudget != null ? "$" + remainingBudget.toFixed(2) : "-"
        }`
      );
    }

    doc.moveDown(0.5);
    doc.fontSize(13).text("Totals by Category");
    doc.moveDown(0.2);

    if (Object.keys(categoryTotals).length === 0) {
      doc.fontSize(12).text("No expenses this month.");
    } else {
      Object.entries(categoryTotals).forEach(([cat, value]) => {
        doc.fontSize(12).text(`• ${cat}: $${value.toFixed(2)}`);
      });
    }

    doc.moveDown(0.8);
    doc.fontSize(14).text("Detailed Expenses");
    doc.moveDown(0.3);

    if (expenses.length === 0) {
      doc.fontSize(12).text("No expenses recorded for this month.");
    } else {
      expenses.forEach((exp) => {
        const dateStr = exp.date.toISOString().slice(0, 10);
        doc
          .fontSize(12)
          .text(
            `${dateStr} | ${exp.title} | ${exp.category} | $${exp.amount.toFixed(
              2
            )}`
          );
        if (exp.description) {
          doc.fontSize(10).text(`  - ${exp.description}`, { indent: 20 });
        }
        doc.moveDown(0.2);
      });
    }

    doc.end();
  } catch (err) {
    console.error("PDF export error:", err);
    if (!res.headersSent) {
      res.status(500).json({ message: "Failed to generate PDF" });
    }
  }
});

app.listen(port, () => {
  console.log(`🚀 Server is live at http://localhost:${port}`);
});