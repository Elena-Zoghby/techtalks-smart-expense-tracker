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

// This line ensures the code finds the .env file in the folder ABOVE 'backend'
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
  id: saved._id,       // <-- frontend can use id
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


app.listen(port, () => {
  console.log(`🚀 Server is live at http://localhost:${port}`);
});