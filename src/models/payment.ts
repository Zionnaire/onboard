import mongoose, { Schema, Document } from 'mongoose';

export interface IPayment extends Document {
  userId: mongoose.Schema.Types.ObjectId;
  amount: number;
  paymentMethod: string;
  paymentStatus: string;
  transactionId: string;
  paymentDate: Date;
}

const PaymentSchema = new Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  paymentMethod: { type: String, required: true },
  paymentStatus: { type: String, required: true },
  transactionId: { type: String, required: true },
  paymentDate: { type: Date, required: true },
});

const Payment = mongoose.model<IPayment>('Payment', PaymentSchema);

export { Payment };
