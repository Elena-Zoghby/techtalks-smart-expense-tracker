import mongoose, { Schema, Document, Model } from "mongoose";

// TypeScript interface for Budget
export interface IBudget extends Document {
  month: string;
  amount: number;
}

const budgetSchema: Schema<IBudget> = new Schema(
  {
    month: { type: String, required: true, unique: true },
    amount: { type: Number, required: true },
  },
  { timestamps: true }
);

// Prevent overwrite error in Next.js hot reload
const Budget: Model<IBudget> =
  mongoose.models.Budget || mongoose.model<IBudget>("Budget", budgetSchema);

export default Budget;