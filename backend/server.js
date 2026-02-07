import Expense from "./models/expense.js";
import 'dotenv/config'; 
import mongoose from 'mongoose';
import express from 'express';
import cors from "cors";

import path from 'path'; 

const app = express();
app.use(express.json());
app.use(cors({
  origin: "http://localhost:3000"
}));


const port = 3001;

import dotenv from 'dotenv';
dotenv.config({ path: '../.env' }); 

const mongoURI = process.env.MONGO_URI;

// Check if the URI is actually there before trying to connect
if (!mongoURI) {
  console.error("❌ ERROR: MONGODB_URI is not defined in your .env file!");
} else {
  mongoose.connect(mongoURI)
    .then(() => console.log("✅ SUCCESS: We are connected to MongoDB!"))
    .catch((err) => console.error("❌ ERROR: Connection failed:", err));
}

app.get('/health', (req, res) => { 
  res.send({ status: 'Server is running!' });
});
app.get('/expenses', async (req, res) => {
  try {
    const expenses = await Expense.find().sort({ date: -1 });

// map _id → id for frontend
const responseData = expenses.map(exp => ({
  id: exp._id, 
  title: exp.title,
  amount: exp.amount,
  date: exp.date,
  category: exp.category,
  createdAt: exp.createdAt,
  updatedAt: exp.updatedAt
}));

res.json(responseData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.post('/expenses', async (req, res) => {
  try {
    const { title, amount, date, category } = req.body;

    if (!title || !amount || !date || !category) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const expense = new Expense({
      title,
      amount,
      date,
      category
    });

    const saved = await expense.save();

res.status(201).json({
  id: saved._id,
  title: saved.title,
  amount: saved.amount,
  date: saved.date,
  category: saved.category,
  createdAt: saved.createdAt,
  updatedAt: saved.updatedAt
});

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/expenses/:id', async (req, res) => {
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
        description: description || '',
        category,
      },
      { new: true, runValidators: true }
    );

    if (!updatedExpense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    console.log('Update successful:', updatedExpense);

    res.json({
      id: updatedExpense._id,
      title: updatedExpense.title,
      amount: updatedExpense.amount,
      date: updatedExpense.date,
      description: updatedExpense.description,
      category: updatedExpense.category,
      createdAt: updatedExpense.createdAt,
      updatedAt: updatedExpense.updatedAt
    });

  } catch (err) {
    console.error('Update error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/expenses/:id', async (req, res) => {
  try {
    const { id } = req.params;

    console.log('🗑️ Delete request for ID:', id);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid expense ID format" });
    }

    const deletedExpense = await Expense.findByIdAndDelete(id);

    if (!deletedExpense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    console.log('Delete successful:', deletedExpense);
    res.json({ message: "Expense deleted successfully", id: deletedExpense._id });

  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ error: err.message });
  }
});


app.listen(port, () => {
  console.log(`🚀 Server is live at http://localhost:${port}`);
});